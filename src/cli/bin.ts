#!/usr/bin/env node

import { Command } from 'commander';
import { default as getPath } from 'path';
import { readFile } from 'fs/promises';
import { parse, Source, ASTNodeKind, TypeDefinitionNode } from '../language';
import { AnySpecSchema } from '../runtypes';
import { validate, baseRules } from '../validation';
import { AnySpecError, printError } from '../error';
import { sync as glob } from 'globby';
import ora from 'ora';

function isEndpoint(val: string) {
  return val.match(/\.endpoints\.tinyspec$/) !== null;
}

function isModel(val: string) {
  return val.match(/\.models\.tinyspec$/) !== null;
}

function printCliError(error: string) {
  return `${error}\n\n------------------------------------------------------------------------------------------\n`;
}

async function main() {
  const program = new Command();
  program
    .option('-o, --outDir <dir>', 'path to a directory for a generated openapi')
    .option('-ns, --namespaces [namespaces...]', 'array of existed namespaces')
    .option(
      '-cns, --commonNamespace <commonNamespace>',
      'name of common namespace where shared definitions stored',
      'common',
    )
    .arguments('<specFiles>');

  program.parse();

  const { args } = program;

  const options = program.opts() as {
    commonNamespace: string;
    namespaces?: string[];
    outDir?: string;
  };

  const { namespaces, outDir, commonNamespace } = options;

  const argPaths = args.map((arg) => getPath.resolve(process.cwd(), arg));

  const argumentPath = argPaths[0];
  const processingSpinner = ora(`Processing spec: ${argumentPath}`).start();

  const specFilePaths = glob(`${argumentPath}/**/*.tinyspec`);

  const specBodyFiles = await Promise.all(
    specFilePaths.map((file) => readFile(file, { encoding: 'utf-8' })),
  );

  const sources = specFilePaths.map((path, i) => {
    if (isEndpoint(path)) {
      return new Source({ body: specBodyFiles[i], sourceType: 'endpoints', name: path });
    }

    if (isModel(path)) {
      return new Source({ body: specBodyFiles[i], sourceType: 'models', name: path });
    }

    throw new Error(`File doesn't contain .endpoints.tinyspec or .models.tinyspec extension`);
  });

  const resultDefinitions: TypeDefinitionNode[] = [];

  const parsingErrors: AnySpecError[] = [];
  for (const source of sources) {
    try {
      const doc = parse(source);
      resultDefinitions.push(...doc.definitions);
    } catch (error) {
      if (error instanceof AnySpecError) {
        parsingErrors.push(error);
      } else {
        console.error('Unknown error during parsing', error);
        processingSpinner.fail();
        process.exit(1);
      }
    }
  }

  if (parsingErrors.length > 0) {
    for (const e of parsingErrors) {
      console.error(printCliError(printError(e)));
    }
  } else {
    const doc = { kind: ASTNodeKind.DOCUMENT, definitions: resultDefinitions };
    const schema = new AnySpecSchema({ ast: doc });

    const errors = validate(schema, doc, baseRules);
    errors.forEach((e) => console.error(printCliError(printError(e))));
  }
  processingSpinner.succeed();
}

main();
