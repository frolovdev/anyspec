#!/usr/bin/env node

import { Command } from 'commander';
import { default as nodePath } from 'path';
import { readFile } from 'fs/promises';
import { parse, Source, DocumentNode } from '../language';
import { AnySpecSchema } from '../runtypes';
import { validate, rulesMap } from '../validation';
import { AnySpecError, printError } from '../error';
import { sync as glob } from 'globby';
import ora from 'ora';
import { concatAST } from '../language/concatAST';
import { parseConfig, readConfig } from './config';

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
    .option('-c, --config <path>', 'path to config file')
    .arguments('<specFiles>');

  program.parse();

  const { args } = program;

  const options = program.opts() as {
    commonNamespace: string;
    namespaces?: string[];
    outDir?: string;
    config?: string;
  };

  const { namespaces, outDir, commonNamespace, config: configPath } = options;

  if (!namespaces) {
    throw new Error('please provide namespaces');
  }

  const argPaths = args.map((arg) => nodePath.resolve(process.cwd(), arg));

  const argumentPath = argPaths[0];
  const processingSpinner = ora(`Processing spec: ${argumentPath}`).start();

  const specFilePaths = glob(`${argumentPath}/**/*.tinyspec`);
  try {
    const sources = await mapPathsToSources(specFilePaths);

    const { res: config, err: configErr } = readConfig(configPath);
    if (configErr || !config) {
      console.error(configErr);
      processingSpinner.fail();
      return;
    }

    const groupedSources = groupSourcesByNamespaces({ sources, commonNamespace, namespaces });

    const { groupedParsedDocuments, parsingErrors } = getGroupedDocuments(
      groupedSources,
      (error: Error) => {
        console.error('Unknown error during parsing', error);
        processingSpinner.fail();
        process.exit(1);
      },
    );

    if (parsingErrors.length > 0) {
      for (const e of parsingErrors) {
        console.error(printCliError(printError(e)));
      }

      processingSpinner.fail();
      return;
    }

    const { enabledRules, invalidRules } = parseConfig(config);

    const enabledRulesFns = enabledRules.map((rule) => rulesMap[rule]);
    const unitedASTs = groupedParsedDocuments.map((documents) => concatAST(documents));
    const schemas = unitedASTs.map((ast) => new AnySpecSchema({ ast }));
    const errors = schemas.map((s, index) => validate(s, unitedASTs[index], enabledRulesFns));

    errors.flat().forEach((e) => console.error(printCliError(printError(e))));
    invalidRules.forEach((e) => console.error(printCliError(`Invalid Rule: ${e}`)));

    processingSpinner.succeed();
  } catch (e) {
    console.error(e);
    processingSpinner.fail();
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

function printCliError(error: string) {
  return `${error}\n\n------------------------------------------------------------------------------------------\n`;
}

async function mapPathsToSources(paths: string[]): Promise<Source[]> {
  const specBodyFiles = await Promise.all(
    paths.map((file) => readFile(file, { encoding: 'utf-8' })),
  );

  const sources = paths.map((path, i) => {
    if (isEndpoint(path)) {
      return new Source({ body: specBodyFiles[i], sourceType: 'endpoints', name: path });
    }

    if (isModel(path)) {
      return new Source({ body: specBodyFiles[i], sourceType: 'models', name: path });
    }

    throw new Error(`File doesn't contain .endpoints.tinyspec or .models.tinyspec extension`);
  });

  return sources;
}

function groupSourcesByNamespaces({
  sources,
  namespaces,
  commonNamespace,
}: {
  sources: Source[];
  namespaces: string[];
  commonNamespace: string;
}): Source[][] {
  const commonRegexp = new RegExp(`\.${commonNamespace}\.(models|endpoints)\.tinyspec$`);

  const namespacesRegexps = namespaces.map(
    (n) => new RegExp(`\.${n}\.(models|endpoints)\.tinyspec$`),
  );
  const commonSources = sources.filter((s) => commonRegexp.test(s.name));

  const namespaceSources = namespacesRegexps
    .map((regexp) => sources.filter((s) => regexp.test(s.name)))
    .filter((sources) => sources.length > 0);

  return namespaceSources.map((sourceArray) => sourceArray.concat(commonSources));
}

function getGroupedDocuments(groupedSources: Source[][], errCb: (err: Error) => void) {
  const groupedParsedDocuments: DocumentNode[][] = [];

  const parsingErrors: AnySpecError[] = [];
  groupedSources.forEach((gS) => {
    const parsedDocuments: DocumentNode[] = [];

    gS.forEach((s) => {
      try {
        const doc = parse(s);
        parsedDocuments.push(doc);
      } catch (error) {
        if (error instanceof AnySpecError) {
          parsingErrors.push(error);
        } else {
          errCb(error);
        }
      }
    });

    groupedParsedDocuments.push(parsedDocuments);
  });

  return { groupedParsedDocuments, parsingErrors };
}
