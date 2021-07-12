import { Source } from '../source';

import { AnySpecError } from './AnySpecError';

/**
 * Produces a AnySpecError representing a syntax error, containing useful
 * descriptive information about the syntax error's position in the source.
 */
export function syntaxError(source: Source, position: number, description: string): Error {
  return new AnySpecError(`Syntax Error: ${description}`, undefined, source, [position]);
}
