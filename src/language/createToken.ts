import { ILexer } from './lexer';
import { Token, TokenKind } from './token';

/**
 * Create a token with line and column location information.
 */
export function createToken(
  lexer: ILexer,
  kind: TokenKind,
  start: number,
  end: number,
  value?: string,
): Token {
  const line = lexer.line;
  const col = getCol(lexer, start);
  return new Token(kind, start, end, line, col, value);
}

function getCol(lexer: ILexer, start: number) {
  return 1 + start - lexer.lineStart;
}
