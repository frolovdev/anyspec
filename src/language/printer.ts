import { ASTReducer, visit } from '../visitor';
import { ASTNode } from './ast';

/**
 * Converts an AST into a string, using one set of reasonable
 * formatting rules.
 */
export function print(ast: ASTNode): string {
  return visit(ast, printDocASTReducer);
}

const printDocASTReducer: ASTReducer<string> = {
  Name: { leave: (node) => node.value ?? '' },

  NamedType: { leave: (node) => node.name },

  Document: {
    leave: (node) => join(node.definitions, '\n\n'),
  },

  ModelTypeDefinition: {
    leave: ({ name, description, fields }) => {
      if (fields.length === 0) {
        return `${description}${name} {}`;
      }
      return join([name, block(fields)], ' ');
    },
  },
  Description: {
    leave: (node) => {
      const descriptions = node.value.split('\n');
      return `${descriptions.map((description) => `// ${description}`).join('\n')}\n`;
    },
  },
  FieldDefinition: {
    leave: ({ name, type, optional }) => {
      const opt = optional ? '?' : '';
      if (type.length === 0) {
        return `${name}${opt}`;
      }
      return `${name}${opt}: ${type}`;
    },
  },
};

/** Conveniently represents flow's "Maybe" type https://flow.org/en/docs/types/maybe/ */
type Maybe<T> = null | undefined | T;
/**
 * Given maybeArray, print an empty string if it is null or empty, otherwise
 * print all items together separated by separator if provided
 */
function join(maybeArray: Maybe<ReadonlyArray<string | undefined>>, separator = ''): string {
  return maybeArray?.filter((x) => x).join(separator) ?? '';
}

/**
 * Given array, print each item on its own line, wrapped in an indented `{ }` block.
 */
function block(array: Maybe<ReadonlyArray<string | undefined>>): string {
  return wrap('{\n', indent(join(array, ',\n')), '\n}');
}

/**
 * If maybeString is not null or empty, then wrap with start and end, otherwise print an empty string.
 */
function wrap(start: string, maybeString: Maybe<string>, end: string = ''): string {
  return maybeString != null && maybeString !== '' ? start + maybeString + end : '';
}

function indent(str: string): string {
  return wrap('  ', str.replace(/\n/g, '\n  '));
}

function hasMultilineItems(maybeArray: Maybe<ReadonlyArray<string>>): boolean {
  // istanbul ignore next (See: 'https://github.com/graphql/graphql-js/issues/2203')
  return maybeArray?.some((str) => str.includes('\n')) ?? false;
}
