import { ASTReducer, visit } from '../visitor';
import { ASTNode, ASTNodeKind, DocumentNode } from '../language/ast';
import { Doc, FastPath, ParserOptions, Printer } from 'prettier';
import { PrinterDocumentNode } from './types/types';

/**
 * Converts an AST into a string, using one set of reasonable
 * formatting rules.
 */

const MAX_LINE_LENGTH = 80;

export function printModels(ast: ASTNode): string {
  return visit(ast, printDocASTReducerModel);
}

const printDocASTReducerModel: ASTReducer<string> = {
  EndpointNamespaceTypeDefinition: {
    leave: () => {
      throw new Error("Can't parse AST with EndpointNamespaceTypeDefinition");
    },
  },

  Name: { leave: (node) => node.value ?? '' },

  NamedType: { leave: (node) => node.name },

  Document: {
    leave: (node) => join(node.definitions, '\n\n'),
  },

  ModelTypeDefinition: {
    leave: ({ name, description, fields, strict, extendsModels }) => {
      const extModels = extendsModels.length > 0 ? ` < ${extendsModels.join(', ')}` : '';
      const strct = strict ? '!' : '';
      if (fields.length === 0) {
        return `${description ?? ''}${name}${extModels} ${strct}{}`;
      }
      return `${description ?? ''}${name}${extModels} ${strct}${block(fields)}`;
    },
  },
  Description: {
    leave: (node) => {
      const descriptions = node.value.split('\n');
      return `${descriptions.map((description) => `// ${description}`).join('\n')}\n`;
    },
  },
  FieldDefinition: {
    leave: ({ name, type, optional, omitted }) => {
      const ommtd = omitted ? '-' : '';
      const opt = optional ? '?' : '';
      if (type.length === 0) {
        return `${ommtd}${name}${opt}`;
      }
      return `${ommtd}${name}${opt}: ${type}`;
    },
  },
  ListType: {
    leave: (node) => {
      const arraySymbol = '[]';
      let list: string[] = [];
      let currentNode: any = node;
      while (currentNode.kind === ASTNodeKind.LIST_TYPE) {
        list.push(arraySymbol);
        currentNode = node.type;
      }
      return `${node.type}${list.join()}`;
    },
  },
  EnumValueDefinition: {
    leave: ({ name }) => name,
  },
  EnumInlineTypeDefinition: {
    leave: ({ values }) => {
      const str = `( ${join(values, ' | ')} )`;
      if (str.length > MAX_LINE_LENGTH) {
        return enumBlock(values);
      }
      return str;
    },
  },
  ObjectTypeDefinition: {
    leave: ({ fields, strict }) => {
      const strct = strict ? '!' : '';
      if (fields.length === 0) {
        return `${strct}{}`;
      }
      return `${strct}${block(fields)}`;
    },
  },
  EnumTypeDefinition: {
    leave: ({ name, values, description }) => {
      return `${description ?? ''}${name} ${enumBlock(values)}`;
    },
  },
};

/**
 * Given maybeArray, print an empty string if it is null or empty, otherwise
 * print all items together separated by separator if provided
 */
function join(maybeArray: $Maybe<ReadonlyArray<string | undefined>>, separator = ''): string {
  return maybeArray?.filter((x) => x).join(separator) ?? '';
}

/**
 * Given array, print each item on its own line, wrapped in an indented `{ }` block.
 */
function block(array: $Maybe<ReadonlyArray<string | undefined>>): string {
  return wrap('{\n', indent(join(array, ',\n')), ',\n}');
}

/**
 * Given array, print each item on its own line, wrapped in an indented `( )` block with `|` separator.
 */
function enumBlock(array: $Maybe<ReadonlyArray<string | undefined>>): string {
  return wrap('(\n', indent(join(array, ' |\n')), '\n)');
}

/**
 * If maybeString is not null or empty, then wrap with start and end, otherwise print an empty string.
 */
function wrap(start: string, maybeString: $Maybe<string>, end: string = ''): string {
  return maybeString != null && maybeString !== '' ? start + maybeString + end : '';
}

function indent(str: string): string {
  return wrap('  ', str.replace(/\n/g, '\n  '));
}

function genericPrint<T extends PrinterDocumentNode>(
  path: FastPath<T>,
  options: ParserOptions<T>,
  print: (path: FastPath<T>) => Doc,
): Doc | string {
  const node = path.getValue();
  if (!node) {
    return '';
  }

  if (typeof node === 'string') {
    return node;
  }

  return 'qweqw';
}

function hasPrettierIgnore<T extends PrinterDocumentNode>(path: FastPath<T>) {
  const node = path.getValue();
  return (
    node &&
    Array.isArray(node.comments) &&
    node.comments.some((comment) => comment.value.trim() === 'prettier-ignore')
  );
}

function canAttachComment(node: any) {
  return node.kind && node.kind !== 'Comment';
}

function printComment(commentPath: any) {
  const comment = commentPath.getValue();
  if (comment.kind === 'Comment') {
    return '#' + comment.value.trimEnd();
  }

  /* istanbul ignore next */
  throw new Error('Not a comment: ' + JSON.stringify(comment));
}

function clean(/*node, newNode , parent*/) {}
clean.ignoredProperties = new Set(['loc', 'comments']);

export const printer: Printer<PrinterDocumentNode> = {
  print: genericPrint,
  massageAstNode: clean,
  hasPrettierIgnore,
  printComment,
  canAttachComment,
};
