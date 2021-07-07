import { assert } from './utils';
import { inspect } from './utils';

interface Location {
  line: number;
  column: number;
}

type SourceType = "models" | "endpoints"

/**
 * A representation of source input. The `name` and `locationOffset` parameters are
 * optional, but they are useful for clients who store EasySpec documents in source files.
 * For example, if the input starts at line 40 in a file named `Foo.tinyspec`, it might
 * be useful for `name` to be `"Foo.tinyspec"` and location to be `{ line: 40, column: 1 }`.
 * The `line` and `column` properties in `locationOffset` are 1-indexed.
 */
export class Source {
  body: string;
  name: string;
  locationOffset: Location;
  sourceType: SourceType

  constructor(
    body: string,
    name: string = 'Anyspec code',
    locationOffset: Location = { line: 1, column: 1 },
    sourceType = "models" as SourceType
  ) {
    assert(typeof body === 'string', `Body must be a string. Received: ${inspect(body)}.`);

    this.body = body;
    this.name = name;
    this.locationOffset = locationOffset;
    this.sourceType = sourceType

    assert(
      this.locationOffset.line > 0,
      'line in locationOffset is 1-indexed and must be positive.',
    );
    assert(
      this.locationOffset.column > 0,
      'column in locationOffset is 1-indexed and must be positive.',
    );
  }

  get [Symbol.toStringTag]() {
    return 'Source';
  }
}

/**
 * Test if the given value is a Source object.
 *
 * @internal
 */
export function isSource(source: unknown): source is Source {
  return source instanceof Source;
}
