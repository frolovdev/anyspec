#!/usr/bin/env node

import { Command } from 'commander';
import { default as getPath } from 'path';
import { readFile } from 'fs/promises';
import { parse } from '../parser';
import { AnySpecSchema } from '../runtypes';
import { validate, baseRules } from '../validation';
import { AnySpecError, printError } from '../error';
import { sync as glob } from 'globby';
import { Source } from '../source';
import ora from 'ora';
import { ASTNodeKind, TypeDefinitionNode } from '../language';

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
      return new Source({ body: specBodyFiles[i], sourceType: 'endpoints' });
    }

    if (isModel(path)) {
      return new Source({ body: specBodyFiles[i], sourceType: 'models' });
    }

    throw new Error(`File doesn't contain .endpoints.tinyspec or .models.tinyspec extension`);
  });

  try {
    const resultDefinitions: TypeDefinitionNode[] = [];
    for (const source of sources) {
      const doc = parse(source);

      resultDefinitions.push(...doc.definitions);
    }

    const doc = { kind: ASTNodeKind.DOCUMENT, definitions: resultDefinitions };
    const schema = new AnySpecSchema({ ast: doc });

    const errors = validate(schema, doc, baseRules);
    errors.forEach((e) => console.log(printError(e)));

    processingSpinner.succeed();
  } catch (error) {
    if (error instanceof AnySpecError) {
      console.log(printError(error));
    }

    processingSpinner.fail(`Failed to process document`);
  }
}

main();
