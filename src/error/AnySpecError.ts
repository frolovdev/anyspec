import { Source, ASTNode, getLocation, SourceLocation } from '../language';
import { isObjectLike } from '../utils';
import { printLocation, printSourceLocation } from './printLocation';
export class AnySpecError extends Error {
  /**
   * An array of { line, column } locations within the source AnySpec document
   * which correspond to this error.
   *
   * Errors during validation often contain multiple locations, for example to
   * point out two things with the same name. Errors during execution include a
   * single location, the field which produced the error.
   *
   * Enumerable, and appears in the result of JSON.stringify().
   */
  readonly locations?: ReadonlyArray<SourceLocation>;

  /**
   * An array describing the JSON-path into the execution response which
   * corresponds to this error. Only included for errors during execution.
   *
   * Enumerable, and appears in the result of JSON.stringify().
   */
  readonly path?: ReadonlyArray<string | number>;

  /**
   * An array of AnySpec AST Nodes corresponding to this error.
   */
  readonly nodes?: ReadonlyArray<ASTNode>;

  /**
   * The source AnySpec document for the first location of this error.
   *
   * Note that if this Error represents more than one node, the source may not
   * represent nodes after the first node.
   */
  readonly source?: Source;

  /**
   * An array of character offsets within the source AnySpec document
   * which correspond to this error.
   */
  readonly positions?: ReadonlyArray<number>;

  /**
   * The original error thrown from a field resolver during execution.
   */
  readonly originalError: $Maybe<Error>;

  /**
   * Extension fields to add to the formatted error.
   */
  readonly extensions?: { [key: string]: unknown };

  constructor(
    message: string,
    nodes?: ReadonlyArray<ASTNode> | ASTNode | null,
    source?: $Maybe<Source>,
    positions?: $Maybe<ReadonlyArray<number>>,
    path?: $Maybe<ReadonlyArray<string | number>>,
    originalError?: $Maybe<Error & { readonly extensions?: unknown }>,
    extensions?: $Maybe<{ [key: string]: unknown }>,
  ) {
    super(message);

    // Compute list of blame nodes.
    const _nodes = Array.isArray(nodes)
      ? nodes.length !== 0
        ? nodes
        : undefined
      : nodes
      ? [nodes]
      : undefined;

    // Compute locations in the source for the given nodes/positions.
    let _source = source;
    if (!_source && _nodes) {
      _source = _nodes[0].loc?.source;
    }

    let _positions;
    if (positions) {
      _positions = positions;
    } else if (_nodes) {
      _positions = [];
      for (const node of _nodes) {
        if (node.loc) {
          _positions.push(node.loc.start);
        }
      }
    }
    if (_positions && _positions.length === 0) {
      _positions = undefined;
    }

    let _locations;
    if (positions && source) {
      _locations = positions.map((pos) => getLocation(source, pos));
    } else if (_nodes) {
      _locations = [];
      for (const node of _nodes) {
        if (node.loc) {
          _locations.push(getLocation(node.loc.source, node.loc.start));
        }
      }
    }

    let _extensions = extensions;
    if (_extensions == null && originalError != null) {
      const originalExtensions = originalError.extensions;
      if (isObjectLike(originalExtensions)) {
        _extensions = originalExtensions;
      }
    }

    Object.defineProperties(this, {
      name: { value: 'AnySpecError' },
      message: {
        value: message,
        // By being enumerable, JSON.stringify will include `message` in the
        // resulting output. This ensures that the simplest possible AnySpec
        // service adheres to the spec.
        enumerable: true,
        writable: true,
      },
      locations: {
        // Coercing falsy values to undefined ensures they will not be included
        // in JSON.stringify() when not provided.
        value: _locations ?? undefined,
        // By being enumerable, JSON.stringify will include `locations` in the
        // resulting output. This ensures that the simplest possible AnySpec
        // service adheres to the spec.
        enumerable: _locations != null,
      },
      path: {
        // Coercing falsy values to undefined ensures they will not be included
        // in JSON.stringify() when not provided.
        value: path ?? undefined,
        // By being enumerable, JSON.stringify will include `path` in the
        // resulting output. This ensures that the simplest possible AnySpec
        // service adheres to the spec.
        enumerable: path != null,
      },
      nodes: {
        value: _nodes ?? undefined,
      },
      source: {
        value: _source ?? undefined,
      },
      positions: {
        value: _positions ?? undefined,
      },
      originalError: {
        value: originalError,
      },
      extensions: {
        // Coercing falsy values to undefined ensures they will not be included
        // in JSON.stringify() when not provided.
        value: _extensions ?? undefined,
        // By being enumerable, JSON.stringify will include `path` in the
        // resulting output. This ensures that the simplest possible AnySpec
        // service adheres to the spec.
        enumerable: _extensions != null,
      },
    });

    // Include (non-enumerable) stack trace.
    if (originalError?.stack) {
      Object.defineProperty(this, 'stack', {
        value: originalError.stack,
        writable: true,
        configurable: true,
      });
      return;
    }

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AnySpecError);
    } else {
      Object.defineProperty(this, 'stack', {
        value: Error().stack,
        writable: true,
        configurable: true,
      });
    }
  }

  toString(): string {
    return printError(this);
  }

  get [Symbol.toStringTag](): string {
    return 'Object';
  }
}

/**
 * Prints a AnySpecError to a string, representing useful location information
 * about the error's position in the source.
 */
export function printError(error: AnySpecError): string {
  let output = error.message;

  if (error.nodes) {
    for (const node of error.nodes) {
      if (node.loc) {
        output += '\n\n' + printLocation(node.loc);
      }
    }
  } else if (error.source && error.locations) {
    for (const location of error.locations) {
      output += '\n\n' + printSourceLocation(error.source, location);
    }
  }
  return output;
}
