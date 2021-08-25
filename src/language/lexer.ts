import { Token, TokenKind, TokenKindEnum } from './token';
import { Source } from './source';
import { syntaxError } from '../error';
import { IndentReader } from './indentReader';
import { createToken } from './createToken';

type LexerState = 'insideEnum' | 'base';
export interface ILexer {
  source: Source;
  lastToken: Token;
  token: Token;
  line: number;
  lineStart: number;
  state: LexerState;
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
  state: LexerState;

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
    this.state = 'base';
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

    if (
      lexer.state === 'insideEnum' &&
      (code === 0x0021 ||
        code === 0x0024 ||
        code === 0x0026 ||
        code === 0x0028 ||
        code === 0x002e ||
        code === 0x003a ||
        code === 0x0022 ||
        code === 0x002b ||
        code === 0x003f)
    ) {
      return readName(lexer, position, lexer.state);
    }
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
        return createToken(lexer, TokenKind.BANG, position, position + 1);
      case 0x0023: //  #
        return readComment(lexer, position);
      case 0x0024: //  $
        return createToken(lexer, TokenKind.DOLLAR, position, position + 1);
      case 0x0026: //  &
        return createToken(lexer, TokenKind.AMP, position, position + 1);
      case 0x0028: {
        //  (

        lexer.state = 'insideEnum';
        return createToken(lexer, TokenKind.PAREN_L, position, position + 1);
      }

      case 0x0029: //  )
        lexer.state = 'base';

        return createToken(lexer, TokenKind.PAREN_R, position, position + 1);
      case 0x002e: //  .
        throw syntaxError(lexer.source, position, unexpectedCharacterMessage(code));
      case 0x002f: // /
        if (body.charCodeAt(position + 1) === 0x002f) {
          return readDescription(lexer, position);
        }
        if (lexer.source.sourceType === 'endpoints') {
          return readNameAfterSlash(lexer, position);
        }

      case 0x003a: //  :
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

        throw syntaxError(lexer.source, position, unexpectedCharacterMessage(code));

      case 0x002b: {
        // +

        throw syntaxError(lexer.source, position, unexpectedCharacterMessage(code));
      }

      case 0x0060: {
        // `
        if (lexer.source.sourceType === 'endpoints') {
          return readNameWithGraveAccentMarks(lexer, position);
        }
        throw syntaxError(lexer.source, position, unexpectedCharacterMessage(code));
      }

      case 0x003c: // <
        return createToken(lexer, TokenKind.EXTENDS, position, position + 1);
      case 0x003f: // ?
        return createToken(lexer, TokenKind.QUESTION_MARK, position, position + 1);
    }

    if (isNameStart(code)) {
      return readName(lexer, position, lexer.state);
    }

    // IntValue | FloatValue (Digit | -)
    if (isDigit(code) || code === 0x002d) {
      //  - for now we allow dashes to in words
      if (code === 0x002d) {
        return readName(lexer, position, lexer.state);
      }

      if (lexer.source.sourceType === 'endpoints') {
        return readNumber(lexer, position);
      } else {
        // we don't support numbers in models files
        throw syntaxError(lexer.source, position, unexpectedCharacterMessage(code));
      }
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
  const body = lexer.source.body;
  const bodyLength = body.length;
  let position = start + 1;

  while (position < bodyLength) {
    const code = body.charCodeAt(position);

    // LineTerminator (\n | \r)
    if (code === 0x000a || code === 0x000d) {
      break;
    }

    // SourceCharacter
    if (isSourceCharacter(code)) {
      ++position;
    } else {
      break;
    }
  }

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
function readName(lexer: ILexer, start: number, state?: LexerState): Token {
  if (state === 'insideEnum') {
    return readNameInsideEnum(lexer, start);
  }

  const body = lexer.source.body;
  const bodyLength = body.length;
  let position = start + 1;

  while (position < bodyLength) {
    const code = body.charCodeAt(position);
    // NameContinue
    if (isLetter(code) || isDigit(code) || code === 0x005f || code === 0x002d) {
      ++position;
    } else {
      break;
    }
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

  while (position < bodyLength) {
    const code = body.charCodeAt(position);

    if (isDigit(code)) {
      ++position;
    } else {
      break;
    }
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

  while (position < bodyLength) {
    const code = body.charCodeAt(position);

    // LineTerminator (\n | \r)  | (`)
    if (code === 0x000a || code === 0x000d || code === 0x0060) {
      break;
    }

    // SourceCharacter
    if (isSourceCharacter(code)) {
      ++position;
    } else {
      break;
    }
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

  while (position < bodyLength) {
    const code = body.charCodeAt(position);

    // LineTerminator (\n | \r)  | space
    if (code === 0x000a || code === 0x000d || code === 0x0020) {
      break;
    }

    // SourceCharacter
    if (isSourceCharacter(code)) {
      ++position;
    } else {
      break;
    }
  }

  return createToken(lexer, TokenKind.NAME, start, position, body.slice(start, position));
}

function readDescription(lexer: ILexer, start: number) {
  const { source } = lexer;
  const body = source.body;
  const bodyLength = body.length;
  // let code;
  let position = start;

  const nextPosition = position + 1;
  const nextCode = body.charCodeAt(nextPosition);
  if (nextCode !== 0x002f) {
    // /
    throw syntaxError(source, nextPosition, unexpectedCharacterMessage(nextCode));
  }

  while (position < bodyLength) {
    const code = body.charCodeAt(position);

    // LineTerminator (\n | \r)  | space
    if (code === 0x000a || code === 0x000d) {
      break;
    }

    // SourceCharacter
    if (isSourceCharacter(code)) {
      ++position;
    } else {
      break;
    }
  }

  return createToken(
    lexer,
    TokenKind.DESCRIPTION,
    start,
    position,
    body.slice(start + 2, position).trim(),
  );
}

/**
 * Digit :: one of
 *   - `0` `1` `2` `3` `4` `5` `6` `7` `8` `9`
 */
function isDigit(code: number): boolean {
  return code >= 0x0030 && code <= 0x0039;
}

function isNameStart(code: number): boolean {
  const downDash = 0x005f; // _
  const dash = 0x002d;
  return isLetter(code) || code === downDash || code === dash;
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
 * Letter :: one of
 *   - `A` `B` `C` `D` `E` `F` `G` `H` `I` `J` `K` `L` `M`
 *   - `N` `O` `P` `Q` `R` `S` `T` `U` `V` `W` `X` `Y` `Z`
 *   - `a` `b` `c` `d` `e` `f` `g` `h` `i` `j` `k` `l` `m`
 *   - `n` `o` `p` `q` `r` `s` `t` `u` `v` `w` `x` `y` `z`
 */
function isLetter(code: number): boolean {
  return (
    (code >= 0x0061 && code <= 0x007a) || // A-Z
    (code >= 0x0041 && code <= 0x005a) // a-z
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
