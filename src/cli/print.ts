import { default as nodePath } from 'path';
import { sync as glob } from 'globby';
import ora from 'ora';
import { mapPathsToSources } from './utils';
import { print as printFn } from '../printer';
import { writeFile } from 'fs/promises';

interface Options {
  outDir?: string;
}

export async function print(specFilePath: string, options: Options) {
  const argumentPath = nodePath.resolve(process.cwd(), specFilePath);

  const processingSpinner = ora(`Processing spec: ${argumentPath}`).start();
  const specFilePaths = glob(`${argumentPath}/**/*.tinyspec`);

  try {
    const sources = await mapPathsToSources(specFilePaths);

    for (const source of sources) {
      const result = printFn(source);

      writeFile(source.name, result, 'utf-8');
    }

    processingSpinner.succeed();
  } catch (error) {
    console.error(error);
    processingSpinner.fail();
  }
}
