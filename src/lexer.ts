import { Token, TokenKind, TokenKindEnum } from './token';
import { Source } from './source';
import { syntaxError } from './error/syntaxError';

export class Lexer {
  source: Source;

  /**
   * The previously focused non-ignored token.
   */
  lastToken: Token;

  /**
   * The currently focused non-ignored token.
   */
  token: Token;

  /**
   * The (1-indexed) line containing the current token.
   */
  line: number;

  /**
   * The character offset at which the current line begins.
   */
  lineStart: number;

  constructor(source: Source) {
    const startOfFileToken = new Token(TokenKind.SOF, 0, 0, 0, 0, null);

    this.source = source;
    this.lastToken = startOfFileToken;
    this.token = startOfFileToken;
    this.line = 1;
    this.lineStart = 0;
  }

  /**
   * Advances the token stream to the next non-ignored token.
   */
  advance(): Token {
    this.lastToken = this.token;
    this.token = this.lookahead();
    return this.token;
  }

  /**
   * Looks ahead and returns the next non-ignored token, but does not change
   * the state of Lexer.
   */
  lookahead(): Token {
    let token = this.token;
    if (token.kind !== TokenKind.EOF) {
      do {
        // @ts-expect-error next is only mutable during parsing, so we cast to allow this.
        token = token.next ?? (token.next = readToken(this, token));
      } while (token.kind === TokenKind.COMMENT);
    }
    return token;
  }
}

// private

function readToken(lexer: Lexer, prev: Token): Token {
  const source = lexer.source;
  const body = source.body;
  const bodyLength = body.length;

  let pos = prev.end;
  while (pos < bodyLength) {
    // getting char code
    const code = body.charCodeAt(pos);

    const line = lexer.line;
    const col = 1 + pos - lexer.lineStart;

    // SourceCharacter
    switch (code) {
      case 0xfeff: // <BOM> Short for byte order mark, BOM
      case 9: //   \t
      case 32: //  <space>
      case 44: //  ,
        ++pos;
        continue;
      case 10: //  \n
        ++pos;
        ++lexer.line;
        lexer.lineStart = pos;
        continue;
      case 13: //  \r
        // \n
        if (body.charCodeAt(pos + 1) === 10) {
          pos += 2;
        } else {
          ++pos;
        }
        ++lexer.line;
        lexer.lineStart = pos;
        continue;
      case 33: //  !
        return new Token(TokenKind.BANG, pos, pos + 1, line, col, prev);
      case 35: //  #
        return readComment(source, pos, line, col, prev);
      case 36: //  $
        return new Token(TokenKind.DOLLAR, pos, pos + 1, line, col, prev);
      case 38: //  &
        return new Token(TokenKind.AMP, pos, pos + 1, line, col, prev);
      case 40: //  (
        return new Token(TokenKind.PAREN_L, pos, pos + 1, line, col, prev);
      case 41: //  )
        return new Token(TokenKind.PAREN_R, pos, pos + 1, line, col, prev);
      case 46: //  .
        // if (body.charCodeAt(pos + 1) === 46 && body.charCodeAt(pos + 2) === 46) {
        //   return new Token(TokenKind.SPREAD, pos, pos + 3, line, col, prev);
        // }
        throw syntaxError(source, pos, unexpectedCharacterMessage(code));
        break;
      case 47: // /
        return readModelDescription(source, pos, line, col, prev);
      case 58: //  :
        return new Token(TokenKind.COLON, pos, pos + 1, line, col, prev);
      case 61: //  =
        return new Token(TokenKind.EQUALS, pos, pos + 1, line, col, prev);
      case 64: //  @
        return new Token(TokenKind.AT, pos, pos + 1, line, col, prev);
      case 91: //  [
        return new Token(TokenKind.BRACKET_L, pos, pos + 1, line, col, prev);
      case 93: //  ]
        return new Token(TokenKind.BRACKET_R, pos, pos + 1, line, col, prev);
      case 123: // {
        return new Token(TokenKind.BRACE_L, pos, pos + 1, line, col, prev);
      case 124: // |
        return new Token(TokenKind.PIPE, pos, pos + 1, line, col, prev);
      case 125: // }
        return new Token(TokenKind.BRACE_R, pos, pos + 1, line, col, prev);
      case 34: //  "
        // if (
        //   body.charCodeAt(pos + 1) === 34 &&
        //   body.charCodeAt(pos + 2) === 34
        // ) {
        //   return readBlockString(source, pos, line, col, prev, lexer);
        // }
        // return readString(source, pos, line, col, prev);
        // for now we dont support strings
        throw syntaxError(source, pos, unexpectedCharacterMessage(code));

      case 45: //  - for now we allow dashes to in words
        return readName(source, pos, line, col, prev);
      case 48: //  0
      case 49: //  1
      case 50: //  2
      case 51: //  3
      case 52: //  4
      case 53: //  5
      case 54: //  6
      case 55: //  7
      case 56: //  8
      case 57: //  9
        // we dont support numbers
        throw syntaxError(source, pos, unexpectedCharacterMessage(code));
      // return readNumber(source, pos, code, line, col, prev);

      case 60: // <
        return new Token(TokenKind.EXTENDS, pos, pos + 1, line, col, prev);

      case 63: // ?
        return new Token(TokenKind.QUESTION_MARK, pos, pos + 1, line, col, prev);
      case 65: //  A
      case 66: //  B
      case 67: //  C
      case 68: //  D
      case 69: //  E
      case 70: //  F
      case 71: //  G
      case 72: //  H
      case 73: //  I
      case 74: //  J
      case 75: //  K
      case 76: //  L
      case 77: //  M
      case 78: //  N
      case 79: //  O
      case 80: //  P
      case 81: //  Q
      case 82: //  R
      case 83: //  S
      case 84: //  T
      case 85: //  U
      case 86: //  V
      case 87: //  W
      case 88: //  X
      case 89: //  Y
      case 90: //  Z
      case 95: //  _
      case 97: //  a
      case 98: //  b
      case 99: //  c
      case 100: // d
      case 101: // e
      case 102: // f
      case 103: // g
      case 104: // h
      case 105: // i
      case 106: // j
      case 107: // k
      case 108: // l
      case 109: // m
      case 110: // n
      case 111: // o
      case 112: // p
      case 113: // q
      case 114: // r
      case 115: // s
      case 116: // t
      case 117: // u
      case 118: // v
      case 119: // w
      case 120: // x
      case 121: // y
      case 122: // z
        return readName(source, pos, line, col, prev);
    }

    throw syntaxError(source, pos, unexpectedCharacterMessage(code));
  }

  const line = lexer.line;
  const col = 1 + pos - lexer.lineStart;

  return new Token(TokenKind.EOF, bodyLength, bodyLength, line, col, prev);
}

/**
 * Reads a comment token from the source file.
 *
 * #[\u0009\u0020-\uFFFF]*
 */
function readComment(
  source: Source,
  start: number,
  line: number,
  col: number,
  prev: Token | null,
): Token {
  const body = source.body;
  let code;
  let position = start;

  do {
    code = body.charCodeAt(++position);
  } while (
    !isNaN(code) &&
    // SourceCharacter but not LineTerminator
    (code > 0x001f || code === 0x0009)
  );

  return new Token(
    TokenKind.COMMENT,
    start,
    position,
    line,
    col,
    prev,
    body.slice(start + 1, position),
  );
}

/**
 * Report a message that an unexpected character was encountered.
 */
function unexpectedCharacterMessage(code: number): string {
  if (code < 0x0020 && code !== 0x0009 && code !== 0x000a && code !== 0x000d) {
    return `Cannot contain the invalid character ${printCharCode(code)}.`;
  }

  // TODO: add support for accent

  if (code === 34) {
    return 'Cannot parse the unexpected character (").';
    // return 'Unexpected double quote character (\"), did you mean to use a grave accent (`)?';
  }

  if (code === 39) {
    return "Cannot parse the unexpected character (').";
    // return 'Unexpected single quote character (\'), did you mean to use a grave accent (`)?';
  }

  return `Cannot parse the unexpected character ${printCharCode(code)}.`;
}

function printCharCode(code: number): string {
  return (
    // NaN/undefined represents access beyond the end of the file.
    isNaN(code)
      ? TokenKind.EOF
      : // Trust JSON for ASCII.
      code < 0x007f
      ? JSON.stringify(String.fromCharCode(code))
      : // Otherwise print the escaped form.
        `"\\u${('00' + code.toString(16).toUpperCase()).slice(-4)}"`
  );
}

/**
 * Reads an alphanumeric + underscore name from the source.
 *
 * [_A-Za-z][_0-9A-Za-z]*
 */
function readName(
  source: Source,
  start: number,
  line: number,
  col: number,
  prev: Token | null,
): Token {
  const body = source.body;
  const bodyLength = body.length;
  let position = start + 1;

  let code = 0;
  while (
    position !== bodyLength &&
    !isNaN((code = body.charCodeAt(position))) &&
    (code === 95 || // _
      code === 45 || // -
      (code >= 48 && code <= 57) || // 0-9
      (code >= 65 && code <= 90) || // A-Z
      (code >= 97 && code <= 122)) // a-z
  ) {
    ++position;
  }
  return new Token(TokenKind.NAME, start, position, line, col, prev, body.slice(start, position));
}

function readModelDescription(
  source: Source,
  start: number,
  line: number,
  col: number,
  prev: Token | null,
) {
  const body = source.body;
  let code;
  let position = start;

  const nextPosition = position + 1;
  const nextCode = body.charCodeAt(nextPosition);
  if (nextCode !== 47) {
    throw syntaxError(source, nextPosition, unexpectedCharacterMessage(nextCode));
  }

  do {
    code = body.charCodeAt(++position);
  } while (
    !isNaN(code) &&
    // SourceCharacter but not LineTerminator
    (code > 0x001f || code === 0x0009)
  );

  return new Token(
    TokenKind.DESCRIPTION,
    start,
    position,
    line,
    col,
    prev,
    body.slice(start + 2, position).trim(),
  );
}

// _ A-Z a-z
function isNameStart(code: number): boolean {
  return code === 95 || (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
}

/**
 * Converts four hexadecimal chars to the integer that the
 * string represents. For example, uniCharCode('0','0','0','f')
 * will return 15, and uniCharCode('0','0','f','f') returns 255.
 *
 * Returns a negative number on error, if a char was invalid.
 *
 * This is implemented by noting that char2hex() returns -1 on error,
 * which means the result of ORing the char2hex() will also be negative.
 */
function uniCharCode(a: number, b: number, c: number, d: number): number {
  return (char2hex(a) << 12) | (char2hex(b) << 8) | (char2hex(c) << 4) | char2hex(d);
}

/**
 * Converts a hex character to its integer value.
 * '0' becomes 0, '9' becomes 9
 * 'A' becomes 10, 'F' becomes 15
 * 'a' becomes 10, 'f' becomes 15
 *
 * Returns -1 on error.
 */
function char2hex(a: number): number {
  return a >= 48 && a <= 57
    ? a - 48 // 0-9
    : a >= 65 && a <= 70
    ? a - 55 // A-F
    : a >= 97 && a <= 102
    ? a - 87 // a-f
    : -1;
}

/**
 * @internal
 */
export function isPunctuatorTokenKind(kind: TokenKindEnum): boolean {
  const punctuators = [
    TokenKind.BANG,
    TokenKind.DOLLAR,
    TokenKind.AMP,
    TokenKind.PAREN_L,
    TokenKind.PAREN_R,
    TokenKind.COLON,
    TokenKind.EQUALS,
    TokenKind.AT,
    TokenKind.BRACKET_L,
    TokenKind.BRACKET_R,
    TokenKind.BRACE_L,
    TokenKind.PIPE,
    TokenKind.BRACE_R,
  ];

  return punctuators.includes(kind as any);
}
