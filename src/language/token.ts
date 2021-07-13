export class Token {
  /**
   * The kind of Token.
   */
  readonly kind: TokenKindEnum;

  /**
   * The character offset at which this Node begins.
   */
  readonly start: number;

  /**
   * The character offset at which this Node ends.
   */
  readonly end: number;

  /**
   * The 1-indexed line number on which this Token appears.
   */
  readonly line: number;

  /**
   * The 1-indexed column number at which this Token begins.
   */
  readonly column: number;

  /**
   * For non-punctuation tokens, represents the interpreted value of the token.
   *
   * Note: is undefined for punctuation tokens, but typed as string for
   * convenience in the parser.
   */
  readonly value: string;

  /**
   * Tokens exist as nodes in a double-linked-list amongst all tokens
   * including ignored tokens. <SOF> is always the first node and <EOF>
   * the last.
   */
  readonly prev: Token | null;
  readonly next: Token | null;

  constructor(
    kind: TokenKindEnum,
    start: number,
    end: number,
    line: number,
    column: number,
    prev: Token | null,
    value?: string,
  ) {
    this.kind = kind;
    this.start = start;
    this.end = end;
    this.line = line;
    this.column = column;
    this.value = value as string;
    this.prev = prev;
    this.next = null;
  }

  toJSON(): {
    kind: TokenKindEnum;
    value?: string;
    line: number;
    column: number;
    start: number;
    end: number;
  } {
    return {
      end: this.end,
      start: this.start,
      kind: this.kind,
      value: this.value,
      line: this.line,
      column: this.column,
    };
  }
}

/**
 * An exported enum describing the different kinds of tokens that the
 * lexer emits.
 */
export const TokenKind = {
  // start of the file
  SOF: '<SOF>',
  // end of the file
  EOF: '<EOF>',
  BANG: '!',
  DOLLAR: '$',
  AMP: '&',
  PAREN_L: '(',
  PAREN_R: ')',
  COLON: ':',
  EQUALS: '=',
  AT: '@',
  BRACKET_L: '[',
  BRACKET_R: ']',
  BRACE_L: '{',
  PIPE: '|',
  BRACE_R: '}',
  NAME: 'Name',
  COMMENT: 'Comment',
  EXTENDS: '<',
  QUESTION_MARK: '?',
  DESCRIPTION: 'Description',
  RETURN: '=>',
  INDENT: '<INDENT>', // https://riptutorial.com/python/example/8674/how-indentation-is-parsed
  DEDENT: '<DEDENT>', // https://github.com/python/cpython/blob/3.9/Lib/tokenize.py#L507
  NUMBER: 'Number',
} as const;

/**
 * The enum type representing the token kinds values.
 */
export type TokenKindEnum = typeof TokenKind[keyof typeof TokenKind];
