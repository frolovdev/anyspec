import { format } from 'prettier';
import { isSource, Source } from '../language';
import { parserName } from './consts';
import * as plugin from './plugin';

export const print = (input: Source | string) => {
  if (typeof input !== 'string' && input.sourceType === 'endpoints') {
    console.warn(`for now we don't support endpoints and skip them in printing`);
    return '';
  }

  const source = isSource(input) ? input : new Source({ body: input });

  return format(source.body, { parser: parserName, plugins: [plugin] });
};
