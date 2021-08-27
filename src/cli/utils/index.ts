import { readFile } from 'fs/promises';
import { Source } from '../../language';

export async function mapPathsToSources(paths: string[]): Promise<Source[]> {
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

// private

function isEndpoint(val: string) {
  return val.match(/\.endpoints\.tinyspec$/) !== null;
}

function isModel(val: string) {
  return val.match(/\.models\.tinyspec$/) !== null;
}
