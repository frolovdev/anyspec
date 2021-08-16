import { Parser, ParserOptions } from 'prettier';
import { AnySpecError } from '../error';
import { ASTNode, DocumentNode, SourceLocation } from '../language';
import { parse as anyspecParse } from '../language/parser';
import { printerName } from './consts';

import { locStart, locEnd } from './loc';
import { PrinterAstNode, PrinterDocumentNode } from './types';

function parseComments(ast: DocumentNode) {
  const comments = [];
  const startToken = ast?.loc?.startToken;
  let next = startToken?.next;
  while (next?.kind !== '<EOF>') {
    if (next?.kind === 'Comment') {
      Object.assign(next, {
        // The Comment token's column starts _after_ the `#`,
        // but we need to make sure the node captures the `#`
        column: next.column - 1,
      });
      comments.push(next);
    }
    next = next?.next;
  }

  return comments;
}

function removeTokens(node: any) {
  if (node && typeof node === 'object') {
    delete node.startToken;
    delete node.endToken;
    delete node.prev;
    delete node.next;
    for (const key in node) {
      removeTokens(node[key]);
    }
  }
  return node;
}

// copypast from prettier codebase
function createError(message: string, loc: { start?: SourceLocation }) {
  // Construct an error similar to the ones thrown by Babel.
  const error = new SyntaxError(message + ' (' + loc.start?.line + ':' + loc.start?.column + ')');
  // @ts-ignore - TBD (...)
  error.loc = loc;
  return error;
}

function createParseError(error: unknown) {
  if (error instanceof AnySpecError) {
    const { message } = error;

    const start = error?.locations?.[0];

    return createError(message, { start });
  }

  /* istanbul ignore next */
  return error;
}

function parse(text: string) {
  try {
    const ast = anyspecParse(text) as PrinterDocumentNode;

    ast.comments = parseComments(ast);

    removeTokens(ast);
    return ast;
  } catch (error) {
    throw createParseError(error);
  }
}

export const parser: Parser = {
  parse,
  astFormat: printerName,
  locStart,
  locEnd,
};
