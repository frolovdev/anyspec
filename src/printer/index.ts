import { format } from 'prettier';
import { parserName } from './consts';
import * as plugin from './plugin';

export const print = (source: string) => format(source, { parser: parserName, plugins: [plugin] });
