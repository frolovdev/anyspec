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
  return val.includes('.endpoints.');
}

function isModel(val: string) {
  return val.includes('.models.');
}

async function main() {
  const program = new Command();
  program
    .requiredOption('-o, --out-dir <dir>', 'path to a directory for a generated SDK')
    .arguments('<specFiles...>');

  program.parse();

  const { args } = program;

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

  const parsingError: AnySpecError[] = [];
  for (const source of sources) {
    try {
      const doc = parse(source);
      resultDefinitions.push(...doc.definitions);
    } catch (error) {
      if (error instanceof AnySpecError) {
        parsingError.push(error);
      } else {
        console.error('Unknown error during parsing', error);
        processingSpinner.fail();
        process.exit(1);
      }
    }
  }

  if (parsingError.length > 0) {
    for (const e of parsingError) {
      console.error(printError(e));
    }
  } else {
    const doc = { kind: ASTNodeKind.DOCUMENT, definitions: resultDefinitions };
    const schema = new AnySpecSchema({ ast: doc });

    const errors = validate(schema, doc, baseRules);
    errors.forEach((e) => console.error(printError(e)));
  }
  processingSpinner.succeed();
}

main();
