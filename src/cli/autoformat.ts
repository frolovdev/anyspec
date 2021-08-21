#!/usr/bin/env node

import { Command } from 'commander';
import { default as getPath } from 'path';
import { readFile, writeFile } from 'fs/promises';
import { parse, Source } from '../language';

async function main() {
  const program = new Command();
  program.arguments('<specFiles>');

  program.parse();

  try {
    const { args } = program;

    const argPaths = args.map((arg) => getPath.resolve(process.cwd(), arg));

    const argumentPath = argPaths[0];

    const sources = await mapPathsToSources(argumentPath);

    const parsed = getParsed(sources);

    // const printed = printModels(parsed);

    // await writeFile(argumentPath, printed);
  } catch (e) {
    console.error(e);
  }
}

main();

// private

function isEndpoint(val: string) {
  return val.match(/\.endpoints\.tinyspec$/) !== null;
}

function isModel(val: string) {
  return val.match(/\.models\.tinyspec$/) !== null;
}

async function mapPathsToSources(paths: string): Promise<Source> {
  const specBodyFiles = await readFile(paths, { encoding: 'utf-8' });
  if (isEndpoint(paths)) {
    return new Source({ body: specBodyFiles, sourceType: 'endpoints', name: specBodyFiles });
  }

  if (isModel(paths)) {
    return new Source({ body: specBodyFiles, sourceType: 'models', name: specBodyFiles });
  }

  throw new Error(`File doesn't contain .endpoints.tinyspec or .models.tinyspec extension`);
}

function getParsed(source: Source) {
  try {
    return parse(source);
  } catch (error) {
    throw error;
  }
}
