import type { Source } from '../source';

import { EasySpecError } from './EasySpecError';

/**
 * Produces a EasySpecError representing a syntax error, containing useful
 * descriptive information about the syntax error's position in the source.
 */
export function syntaxError(source: Source, position: number, description: string): Error {
  return new EasySpecError(`Syntax Error: ${description}`, undefined, source, [position]);
}
