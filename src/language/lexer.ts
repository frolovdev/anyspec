import { Token, TokenKind, TokenKindEnum } from './token';
import { Source } from './source';
import { syntaxError } from '../error';
import { IndentReader } from './indentReader';
import { createToken } from './createToken';

export interface ILexer {
  source: Source;
  lastToken: Token;
  token: Token;
  line: number;
  lineStart: number;
  isInsideEnum: boolean;
  indentReader: IndentReader;
}

export class Lexer implements ILexer {
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

  /**
   * is Lexer read insides of Enum?.
   */
  isInsideEnum = false;

  /**
   * for endpoints only
   */
  indentReader: IndentReader;

  constructor(source: Source) {
    const startOfFileToken = new Token(TokenKind.SOF, 0, 0, 0, 0);

    this.source = source;
    this.lastToken = startOfFileToken;
    this.token = startOfFileToken;
    this.line = 1;
    this.lineStart = 0;
    this.indentReader = new IndentReader({
      isEnabled: source.sourceType === 'endpoints',
    });
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
        if (token.next) {
          token = token.next;
        } else {
          // Read the next token and form a link in the token linked-list.
          const nextToken = readToken(this, token.end);
          // @ts-expect-error next is only mutable during parsing.
          token.next = nextToken;
          // @ts-expect-error prev is only mutable during parsing.
          nextToken.prev = token;
          token = nextToken;
        }
      } while (token.kind === TokenKind.COMMENT);
    }

    return token;
  }
}

// private

function readToken(lexer: Lexer, start: number): Token {
  const body = lexer.source.body;
  const bodyLength = body.length;

  let position = start;

  // if indentReader has `remaining` we cant advance until we exhaust it
  const possibleRemaining = lexer.indentReader.readRemaining();

  if (possibleRemaining) {
    return possibleRemaining;
  }

  while (position < bodyLength) {
    // getting char code
    const code = body.charCodeAt(position);

    const line = lexer.line;
    const col = 1 + position - lexer.lineStart;

    // SourceCharacter
    switch (code) {
      // Ignored ::
      //   - UnicodeBOM
      //   - WhiteSpace
      //   - LineTerminator
      //   - Comment
      //   - Comma
      //
      // UnicodeBOM :: "Byte Order Mark (U+FEFF)"
      //
      // WhiteSpace ::
      //   - "Horizontal Tab (U+0009)"
      //   - "Space (U+0020)"
      //
      // Comma :: ,
      case 0xfeff: // <BOM> Short for byte order mark, BOM
      case 9: //   \t
      case 32: //  <space>
      case 44: //  ,
        ++position;
        continue;
      case 10:
        //  \n

        const token = lexer.indentReader.readInsideIndent(lexer, position);

        if (token) {
          return token;
        }

        ++position;
        ++lexer.line;
        lexer.lineStart = position;

        continue;

      case 13: //  \r
        // \n
        if (body.charCodeAt(position + 1) === 10) {
          position += 2;
        } else {
          ++position;
        }
        ++lexer.line;
        lexer.lineStart = position;
        continue;
      case 33: //  !
        if (lexer.isInsideEnum) {
          return readName(lexer, position, lexer.isInsideEnum);
        }
        return createToken(lexer, TokenKind.BANG, position, position + 1);
      case 35: //  #
        return readComment(lexer, position);
      case 36: //  $
        if (lexer.isInsideEnum) {
          return readName(lexer, position, lexer.isInsideEnum);
        }
        return createToken(lexer, TokenKind.DOLLAR, position, position + 1);
      case 38: //  &
        if (lexer.isInsideEnum) {
          return readName(lexer, position, lexer.isInsideEnum);
        }
        return createToken(lexer, TokenKind.AMP, position, position + 1);
      case 40: {
        //  (
        if (lexer.isInsideEnum) {
          return readName(lexer, position, lexer.isInsideEnum);
        }

        lexer.isInsideEnum = true;
        return createToken(lexer, TokenKind.PAREN_L, position, position + 1);
      }

      case 41: //  )
        lexer.isInsideEnum = false;

        return createToken(lexer, TokenKind.PAREN_R, position, position + 1);
      case 46: //  .
        if (lexer.isInsideEnum) {
          return readName(lexer, position, lexer.isInsideEnum);
        }
        throw syntaxError(lexer.source, position, unexpectedCharacterMessage(code));
      case 47: // /
        if (body.charCodeAt(position + 1) === 47) {
          return readDescription(lexer, position);
        }
        if (lexer.source.sourceType === 'endpoints') {
          return readNameAfterSlash(lexer, position);
        }

      case 58: //  :
        if (lexer.isInsideEnum) {
          return readName(lexer, position, lexer.isInsideEnum);
        }
        return createToken(lexer, TokenKind.COLON, position, position + 1);
      case 61: //  =
        if (body.charCodeAt(position + 1) === 62) {
          // =>
          return createToken(lexer, TokenKind.RETURN, position, position + 2);
        }
        return createToken(lexer, TokenKind.EQUALS, position, position + 1);
      case 64: //  @
        return createToken(lexer, TokenKind.AT, position, position + 1);
      case 91: //  [
        return createToken(lexer, TokenKind.BRACKET_L, position, position + 1);
      case 93: //  ]
        return createToken(lexer, TokenKind.BRACKET_R, position, position + 1);
      case 123: // {
        return createToken(lexer, TokenKind.BRACE_L, position, position + 1);
      case 124: // |
        return createToken(lexer, TokenKind.PIPE, position, position + 1);
      case 125: // }
        return createToken(lexer, TokenKind.BRACE_R, position, position + 1);
      case 34: //  "
        // if (
        //   body.charCodeAt(position + 1) === 34 &&
        //   body.charCodeAt(position + 2) === 34
        // ) {
        //   return readBlockString(source, position, line, col, prev, lexer);
        // }

        // for now we dont support strings
        if (lexer.isInsideEnum) {
          return readName(lexer, position, lexer.isInsideEnum);
        }

        throw syntaxError(lexer.source, position, unexpectedCharacterMessage(code));

      case 43: {
        // +
        if (lexer.isInsideEnum) {
          return readName(lexer, position, lexer.isInsideEnum);
        }
        throw syntaxError(lexer.source, position, unexpectedCharacterMessage(code));
      }

      case 96: {
        // `
        if (lexer.source.sourceType === 'endpoints') {
          return readNameWithGraveAccentMarks(lexer, position);
        }
        throw syntaxError(lexer.source, position, unexpectedCharacterMessage(code));
      }

      case 45: //  - for now we allow dashes to in words
        return readName(lexer, position, lexer.isInsideEnum);
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
        if (lexer.source.sourceType === 'endpoints') {
          return readNumber(lexer, position);
        } else {
          // we don't support numbers in models files
          throw syntaxError(lexer.source, position, unexpectedCharacterMessage(code));
        }

      case 60: // <
        return createToken(lexer, TokenKind.EXTENDS, position, position + 1);

      case 63: // ?
        if (lexer.isInsideEnum) {
          return readName(lexer, position, lexer.isInsideEnum);
        }
        return createToken(lexer, TokenKind.QUESTION_MARK, position, position + 1);
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
        return readName(lexer, position, lexer.isInsideEnum);
    }

    throw syntaxError(lexer.source, position, unexpectedCharacterMessage(code));
  }

  // at EOF before we emit <EOF> we need to check if indentReader have non empty stack
  // and create DEDENT tokens if need to
  lexer.indentReader.eofHandler(lexer, position, position + 1);
  const dedentToken = lexer.indentReader.readRemaining();
  if (dedentToken) {
    return dedentToken;
  }

  return createToken(lexer, TokenKind.EOF, bodyLength, bodyLength);
}

/**
 * Reads a comment token from the source file.
 *
 * #[\u0009\u0020-\uFFFF]*
 */
function readComment(lexer: ILexer, start: number): Token {
  const { source } = lexer;
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

  return createToken(lexer, TokenKind.COMMENT, start, position, body.slice(start + 1, position));
}

/**
 * SourceCharacter ::
 *   - U+0009 (Horizontal Tab)
 *   - U+000A (New Line)
 *   - U+000D (Carriage Return)
 *   - U+0020-U+FFFF
 */
function isSourceCharacter(code: number): boolean {
  return code >= 0x0020 || code === 0x0009 || code === 0x000a || code === 0x000d;
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
function readName(lexer: ILexer, start: number, isInsideEnum?: boolean): Token {
  const { source } = lexer;

  if (isInsideEnum) {
    return readNameInsideEnum(lexer, start);
  }

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
  return createToken(lexer, TokenKind.NAME, start, position, body.slice(start, position));
}

/**
 * Reads a number.
 */
function readNumber(lexer: ILexer, start: number): Token {
  const { source } = lexer;
  const body = source.body;
  const bodyLength = body.length;
  let position = start + 1;

  let code = 0;
  while (
    position !== bodyLength &&
    !isNaN((code = body.charCodeAt(position))) &&
    code >= 48 &&
    code <= 57
  ) {
    // 0-9
    ++position;
  }
  return createToken(lexer, TokenKind.NUMBER, start, position, body.slice(start, position));
}

/**
 * Reads Name token inside Enum context
 */
function readNameInsideEnum(lexer: ILexer, start: number): Token {
  const { source } = lexer;
  const body = source.body;
  const bodyLength = body.length;
  let position = start;
  let parenthesisCount = 0;
  let code = 0;

  while (
    position !== bodyLength &&
    !isNaN((code = body.charCodeAt(position))) &&
    (code === 95 || // _
      code === 45 || // -
      (code >= 48 && code <= 57) || // 0-9
      (code >= 65 && code <= 90) || // A-Z
      (code >= 97 && code <= 122) || // a-z
      code === 32 || //  <space>
      code === 44 || //  ,
      code === 33 || //  !
      code === 36 || //  $
      code === 38 || //  &
      code === 39 || // '
      code === 58 || // :
      code === 40 || // (
      code === 41 || // )
      code === 46 || //  .
      code === 47 || // /
      code === 34 || // "
      code === 43) // +
  ) {
    // )
    if (code === 41 && parenthesisCount === 0) {
      break;
    }

    // (
    if (code === 40) {
      parenthesisCount++;
    }

    // )
    if (code === 41) {
      parenthesisCount--;
    }

    ++position;
  }

  if (parenthesisCount !== 0) {
    // no unbalanced parenthesis
    throw syntaxError(source, position, 'parenthesis should be balanced inside enum definition');
  }

  let value = body.slice(start, position).trim();

  // TODO: delete after get rid of this case
  // for covering "own:companies:write"
  if (value.charCodeAt(0) === 34 && value.charCodeAt(value.length - 1) === 34) {
    value = value.substring(1, value.length - 1);
  }

  return createToken(lexer, TokenKind.NAME, start, position, value);
}

/**
 * Reads an any symbol inside `...` name from the source.
 *
 */
function readNameWithGraveAccentMarks(lexer: ILexer, start: number) {
  const { source } = lexer;
  const body = source.body;
  const bodyLength = body.length;
  let position = start + 1;

  let code = 0;
  while (
    position !== bodyLength &&
    !isNaN((code = body.charCodeAt(position))) &&
    code !== 96 // `
  ) {
    ++position;
  }
  return createToken(lexer, TokenKind.NAME, start, position + 1, body.slice(start + 1, position));
}

/**
 * Reads an any symbol after '/' from the source.
 *
 */
function readNameAfterSlash(lexer: ILexer, start: number) {
  const { source } = lexer;
  const body = source.body;
  const bodyLength = body.length;
  let position = start + 1;

  let code = 0;

  while (
    position !== bodyLength &&
    !isNaN((code = body.charCodeAt(position))) &&
    !(code === 32 || code === (10 as number))
  ) {
    ++position;
  }
  return createToken(lexer, TokenKind.NAME, start, position, body.slice(start, position));
}

function readDescription(lexer: ILexer, start: number) {
  const { source } = lexer;
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

  return createToken(
    lexer,
    TokenKind.DESCRIPTION,
    start,
    position,
    body.slice(start + 2, position).trim(),
  );
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
