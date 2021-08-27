#!/usr/bin/env node

import { Command } from 'commander';
import { lint } from './lint';
import { print } from './print';

async function main() {
  const program = new Command();

  program
    .command('lint')

    .option('-ns, --namespaces [namespaces...]', 'array of existed namespaces')
    .option(
      '-cns, --commonNamespace <commonNamespace>',
      'name of common namespace where shared definitions stored',
      'common',
    )
    .option('-c, --config <path>', 'path to config file')
    .arguments('<specFiles>')
    .action((specsFilesPath, options) => lint(specsFilesPath, options));

  program
    .command('print')
    .option('-o, --outDir <dir>', 'path to a directory for a printed files')
    .arguments('<specFiles>')
    .action((specFilesPath, options) => print(specFilesPath, options));

  // program
  //   .command('compile')
  //   .option('-o, --outDir <dir>', 'path to a directory for a generated openapi');

  program.parse();
}

main();
