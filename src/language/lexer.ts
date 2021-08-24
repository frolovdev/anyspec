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
      case 0x0009: //   \t
      case 0x0020: //  <space>
      case 0x002c: //  ,
        ++position;
        continue;
      case 0x000a:
        //  \n

        const token = lexer.indentReader.readInsideIndent(lexer, position);

        if (token) {
          return token;
        }

        ++position;
        ++lexer.line;
        lexer.lineStart = position;

        continue;

      case 0x000d: //  \r
        // \n
        if (body.charCodeAt(position + 1) === 0x000a) {
          position += 2;
        } else {
          ++position;
        }
        ++lexer.line;
        lexer.lineStart = position;
        continue;
      case 0x0021: //  !
        if (lexer.isInsideEnum) {
          return readName(lexer, position, lexer.isInsideEnum);
        }
        return createToken(lexer, TokenKind.BANG, position, position + 1);
      case 0x0023: //  #
        return readComment(lexer, position);
      case 0x0024: //  $
        if (lexer.isInsideEnum) {
          return readName(lexer, position, lexer.isInsideEnum);
        }
        return createToken(lexer, TokenKind.DOLLAR, position, position + 1);
      case 0x0026: //  &
        if (lexer.isInsideEnum) {
          return readName(lexer, position, lexer.isInsideEnum);
        }
        return createToken(lexer, TokenKind.AMP, position, position + 1);
      case 0x0028: {
        //  (

        if (lexer.isInsideEnum) {
          return readName(lexer, position, lexer.isInsideEnum);
        }

        lexer.isInsideEnum = true;
        return createToken(lexer, TokenKind.PAREN_L, position, position + 1);
      }

      case 0x0029: //  )
        lexer.isInsideEnum = false;

        return createToken(lexer, TokenKind.PAREN_R, position, position + 1);
      case 0x002e: //  .
        if (lexer.isInsideEnum) {
          return readName(lexer, position, lexer.isInsideEnum);
        }
        throw syntaxError(lexer.source, position, unexpectedCharacterMessage(code));
      case 0x002f: // /
        if (body.charCodeAt(position + 1) === 0x002f) {
          return readDescription(lexer, position);
        }
        if (lexer.source.sourceType === 'endpoints') {
          return readNameAfterSlash(lexer, position);
        }

      case 0x003a: //  :
        if (lexer.isInsideEnum) {
          return readName(lexer, position, lexer.isInsideEnum);
        }
        return createToken(lexer, TokenKind.COLON, position, position + 1);
      case 0x003d: //  =
        if (body.charCodeAt(position + 1) === 0x003e) {
          // =>
          return createToken(lexer, TokenKind.RETURN, position, position + 2);
        }
        return createToken(lexer, TokenKind.EQUALS, position, position + 1);
      case 0x0040: //  @
        return createToken(lexer, TokenKind.AT, position, position + 1);
      case 0x005b: //  [
        return createToken(lexer, TokenKind.BRACKET_L, position, position + 1);
      case 0x005d: //  ]
        return createToken(lexer, TokenKind.BRACKET_R, position, position + 1);
      case 0x007b: // {
        return createToken(lexer, TokenKind.BRACE_L, position, position + 1);
      case 0x007c: // |
        return createToken(lexer, TokenKind.PIPE, position, position + 1);
      case 0x007d: // }
        return createToken(lexer, TokenKind.BRACE_R, position, position + 1);
      case 0x0022: //  "
        // for now we dont support strings
        if (lexer.isInsideEnum) {
          return readName(lexer, position, lexer.isInsideEnum);
        }

        throw syntaxError(lexer.source, position, unexpectedCharacterMessage(code));

      case 0x002b: {
        // +
        if (lexer.isInsideEnum) {
          return readName(lexer, position, lexer.isInsideEnum);
        }
        throw syntaxError(lexer.source, position, unexpectedCharacterMessage(code));
      }

      case 0x0060: {
        // `
        if (lexer.source.sourceType === 'endpoints') {
          return readNameWithGraveAccentMarks(lexer, position);
        }
        throw syntaxError(lexer.source, position, unexpectedCharacterMessage(code));
      }

      case 0x002d: //  - for now we allow dashes to in words
        return readName(lexer, position, lexer.isInsideEnum);
      case 0x0030: //  0
      case 0x0031: //  1
      case 0x0032: //  2
      case 0x0033: //  3
      case 0x0034: //  4
      case 0x0035: //  5
      case 0x0036: //  6
      case 0x0037: //  7
      case 0x0038: //  8
      case 0x0039: //  9
        if (lexer.source.sourceType === 'endpoints') {
          return readNumber(lexer, position);
        } else {
          // we don't support numbers in models files
          throw syntaxError(lexer.source, position, unexpectedCharacterMessage(code));
        }

      case 0x003c: // <
        return createToken(lexer, TokenKind.EXTENDS, position, position + 1);

      case 0x003f: // ?
        if (lexer.isInsideEnum) {
          return readName(lexer, position, lexer.isInsideEnum);
        }
        return createToken(lexer, TokenKind.QUESTION_MARK, position, position + 1);
      case 0x0041: //  A
      case 0x0042: //  B
      case 0x0043: //  C
      case 0x0044: //  D
      case 0x0045: //  E
      case 0x0046: //  F
      case 0x0047: //  G
      case 0x0048: //  H
      case 0x0049: //  I
      case 0x004a: //  J
      case 0x004b: //  K
      case 0x004c: //  L
      case 0x004d: //  M
      case 0x004e: //  N
      case 0x004f: //  O
      case 0x0050: //  P
      case 0x0051: //  Q
      case 0x0052: //  R
      case 0x0053: //  S
      case 0x0054: //  T
      case 0x0055: //  U
      case 0x0056: //  V
      case 0x0057: //  W
      case 0x0058: //  X
      case 0x0059: //  Y
      case 0x005a: //  Z
      case 0x005f: //  _
      case 0x0061: //  a
      case 0x0062: //  b
      case 0x0063: //  c
      case 0x0064: // d
      case 0x0065: // e
      case 0x0066: // f
      case 0x0067: // g
      case 0x0068: // h
      case 0x0069: // i
      case 0x006a: // j
      case 0x006b: // k
      case 0x006d: // l
      case 0x006d: // m
      case 0x006e: // n
      case 0x006f: // o
      case 0x0070: // p
      case 0x0071: // q
      case 0x0072: // r
      case 0x0073: // s
      case 0x0074: // t
      case 0x0075: // u
      case 0x0076: // v
      case 0x0077: // w
      case 0x0078: // x
      case 0x0079: // y
      case 0x007a: // z
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
