import { format } from 'prettier';
import { Source } from '../language';
import { parserName } from './consts';
import * as plugin from './plugin';

export const print = (source: Source) => {
  if (source.sourceType !== 'models') {
    console.warn(`for now we don't support endpoints and skip them in printing`);
  }

  return format(source.body, { parser: parserName, plugins: [plugin] });
};
