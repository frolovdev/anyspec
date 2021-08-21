import { Doc, FastPath, ParserOptions, Printer, doc, util } from 'prettier';
import { PrinterAstNode, PrinterDocumentNode } from './types';
import { locEnd } from './loc';

const {
  builders: { hardline, indent, join },
} = doc;

const { isNextLineEmpty } = util;

function genericPrint(
  path: FastPath<PrinterAstNode>,
  options: ParserOptions<PrinterAstNode>,
  print: (path?: string) => Doc,
) {
  const node = path.getValue();
  if (!node) {
    return '';
  }

  if (typeof node === 'string') {
    return node;
  }

  switch (node.kind) {
    case 'Document': {
      const parts: Doc[] = [];
      // @ts-ignore
      path.each((pathChild, index, definitions) => {
        parts.push(print());
        if (index !== definitions.length - 1) {
          parts.push(hardline);
          parts.push(hardline);
        }
      }, 'definitions');
      return [...parts, hardline];
    }

    case 'Description': {
      const descriptions = node.value.split('\n');
      return descriptions.map((description) => ['//', ' ', description, hardline]);
    }

    case 'ModelTypeDefinition': {
      const extendsModels =
        node.extendsModels.length > 0
          ? ` < ${node.extendsModels.map((v) => v.name.value).join(', ')}`
          : '';
      const strict = node.strict ? '!' : '';

      return [
        print('description'),
        print('name'),
        extendsModels,
        node.fields.length > 0
          ? [
              ` ${strict}{`,
              indent([
                // @ts-expect-error prettier has incompatible types
                hardline,
                // @ts-expect-error prettier has incompatible types
                join(
                  hardline,
                  // @ts-expect-error prettier has incompatible types
                  path.call((fieldsPath) => printSequence(fieldsPath, options, print), 'fields'),
                ),
              ]),
              hardline,
              '}',
            ]
          : [` ${strict}{}`],
      ];
    }

    case 'FieldDefinition': {
      const omittedSymbol = node.omitted ? '-' : '';
      const opt = node.optional ? '?' : '';
      const isBlank = node.type.kind === 'NamedType' && typeof node.type.name.value === 'undefined';
      return [omittedSymbol, print('name'), opt].concat(
        isBlank ? [','] : [': ', print('type'), ', '],
      );
    }

    case 'Name': {
      return node.value ?? '';
    }

    case 'NamedType': {
      return [print('name')];
    }

    case 'ListType': {
      return [print('type'), '[]'];
    }

    case 'ObjectTypeDefinition': {
      const strict = node.strict ? '!' : '';

      return [
        print('name'),
        node.fields.length > 0
          ? [
              `${strict}{`,
              indent([
                // @ts-expect-error prettier has incompatible types
                hardline,
                // @ts-expect-error prettier has incompatible types
                join(
                  hardline,
                  // @ts-expect-error prettier has incompatible types
                  path.call((fieldsPath) => printSequence(fieldsPath, options, print), 'fields'),
                ),
              ]),
              hardline,
              '}',
            ]
          : `${strict}{}`,
      ];
    }

    case 'EnumInlineTypeDefinition': {
      return [
        print('name'),
        node.values.length > 0
          ? [
              '( ',
              indent([
                // @ts-expect-error prettier has incompatible types
                path.call(
                  (valuesPath) => printInlineEnumValues(valuesPath, options, print),
                  'values',
                ),
              ]),
              ' )',
            ]
          : [' ', '()'],
      ];
    }

    case 'EnumTypeDefinition': {
      return [
        print('description'),
        print('name'),
        node.values.length > 0
          ? [
              ' (',
              indent([
                // @ts-expect-error prettier has incompatible types
                hardline,
                // @ts-expect-error prettier has incompatible types
                join(
                  hardline,
                  // @ts-expect-error prettier has incompatible types
                  path.call((valuesPath) => printEnumValues(valuesPath, options, print), 'values'),
                ),
              ]),
              hardline,
              ')',
            ]
          : [' ', '()'],
      ];
    }

    case 'EnumValueDefinition': {
      return [print('name')];
    }
  }
}

function printSequence(
  sequencePath: FastPath<PrinterAstNode>,
  options: ParserOptions<PrinterAstNode>,
  print: (path?: string) => Doc,
) {
  // TODO: check what is sequencePath really
  // @ts-expect-error
  const count = sequencePath.getValue().length;

  return sequencePath.map((path, i) => {
    const printed = print();

    if (isNextLineEmpty(options.originalText, path.getValue(), locEnd) && i < count - 1) {
      return [printed, hardline];
    }

    return printed;
  });
}

// AcDoc { lol: (standard | type) }
function printInlineEnumValues(
  sequencePath: FastPath<PrinterAstNode>,
  options: ParserOptions<PrinterAstNode>,
  print: (path?: string) => Doc,
) {
  // @ts-expect-error
  const count = sequencePath.getValue().length;

  return sequencePath.map((path, i) => {
    const printed = print();

    if (i < count - 1) {
      return [printed, ' | '];
    }

    return [printed];
  });
}

// Enum (
//  standard |
//  type
// )
function printEnumValues(
  sequencePath: FastPath<PrinterAstNode>,
  options: ParserOptions<PrinterAstNode>,
  print: (path?: string) => Doc,
) {
  // @ts-expect-error
  const count = sequencePath.getValue().length;

  return sequencePath.map((path, i) => {
    const printed = print();

    if (i < count - 1) {
      return [printed, ' |'];
    }

    return [printed];
  });
}

function hasPrettierIgnore<T extends PrinterDocumentNode>(path: FastPath<T>) {
  const node = path.getValue();

  const result =
    node &&
    Array.isArray(node.comments) &&
    node.comments.some((comment) => comment.value.trim() === 'prettier-ignore');

  return result;
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

export const printer: Printer = {
  // @ts-expect-error incompatible types and implementation in prettier
  print: genericPrint,
  massageAstNode: clean,
  hasPrettierIgnore,
  printComment,
  canAttachComment,
};
