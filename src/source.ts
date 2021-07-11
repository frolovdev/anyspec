import { assert } from './utils';
import { inspect } from './utils';

interface Location {
  line: number;
  column: number;
}

type SourceType = 'models' | 'endpoints';

interface SourceArgs {
  body: string;
  name?: string;
  locationOffset?: Location;
  sourceType?: SourceType;
}

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
  sourceType: SourceType;

  constructor(args: SourceArgs) {

    assert(
      typeof args?.body === 'string',
      `Body must be a string. Received: ${inspect(args)}.`,
    );

    const {
      body,
      name = 'source code',
      locationOffset = { line: 1, column: 1 },
      sourceType = "models",
    } = args;

    this.body = body;
    this.name = name;
    this.locationOffset = locationOffset;
    this.sourceType = sourceType;

    assert(
      typeof this.body === 'string',
      `Body must be a string. Received: ${inspect(this.body)}.`,
    );

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