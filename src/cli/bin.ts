#!/usr/bin/env node

import { Command } from 'commander';
import path from 'path';
import { readFile } from 'fs/promises';
import { parse } from '../parser';
import { AnySpecSchema } from '../runtypes';
import { validate, baseRules } from '../validation';
import { printError } from '../error';

async function main() {
  const program = new Command();
  program
    .requiredOption('-o, --out-dir <dir>', 'path to a directory for a generated SDK')
    .arguments('<specFiles...>');

  program.parse();

  const { args } = program;

  const specFiles = args.map((arg) => path.resolve(process.cwd(), arg));

  const content = await readFile(specFiles[0], { encoding: 'utf-8' });

  const doc = parse(content);

  const schema = new AnySpecSchema({ ast: doc });
  const errors = validate(schema, doc, baseRules);

  errors.forEach((e) => console.log(printError(e)));
}

main();
