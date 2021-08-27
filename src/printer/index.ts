import { format } from 'prettier';
import { Source } from '../language';
import { parserName } from './consts';
import * as plugin from './plugin';

export const print = (source: Source) => {
  if (source.sourceType !== 'models') {
    throw new Error("currently we don't support endpoints");
  }

  return format(source.body, { parser: parserName, plugins: [plugin] });
};
