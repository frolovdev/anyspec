import { ILexer } from './lexer';
import { syntaxError } from '../error';
import { Token, TokenKind } from './token';
import { createToken } from './createToken';

export class IndentReader {
  private indents: number[] = [0];
  private isEnabled: boolean;
  private remaining: Token[] = [];

  constructor({ isEnabled }: { isEnabled: boolean }) {
    this.isEnabled = isEnabled;
  }

  readRemaining(): Token | undefined {
    return this.remaining.pop();
  }

  // we need this to emit remaining DEDENT at EOF
  eofHandler(lexer: ILexer, start: number, end: number) {
    while (this.indents.length > 1) {
      this.remaining.push(createToken(lexer, TokenKind.DEDENT, start, end));
      this.indents.pop();
    }
  }

  readInsideIndent(lexer: ILexer, start: number): Token | undefined {
    const { source } = lexer;
    // return if not endpoints
    if (!this.isEnabled) {
      return;
    }

    const body = source.body;
    const bodyLength = body.length;
    let position = start + 1;

    let code = 0;
    let column = 0;

    while (
      position !== bodyLength &&
      !isNaN((code = body.charCodeAt(position))) &&
      code === 32 /* <space> */
    ) {
      column += 1;
      ++position;
    }

    // ignore line with only spaces
    if (body.charCodeAt(position) === 10) {
      return;
    }

    // emit INDENT tokens if spaces at start line more then spaces at prev line
    if (column > this.indents[this.indents.length - 1]) {
      this.indents.push(column);
      return createToken(lexer, TokenKind.INDENT, start, position);
    }
    let tokens: Token[] = [];

    // if spaces at start line less then prev line create array of all DEDENT tokens
    while (column < this.indents[this.indents.length - 1]) {
      if (!this.indents.includes(column)) {
        throw syntaxError(source, position, 'unindent does not match any outer indentation level');
      }
      this.indents.pop();

      tokens.push(createToken(lexer, TokenKind.DEDENT, start, position));
    }

    // store remaining tokens and return first
    if (tokens.length > 0) {
      this.remaining = tokens;
      return this.remaining.pop();
    }

    return; // same indentation level
  }
}
