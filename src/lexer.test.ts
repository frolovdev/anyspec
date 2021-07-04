import { Source } from './source';
import { Lexer, isPunctuatorTokenKind } from './lexer';
import { Token, TokenKind } from './token';
import { inspect } from 'util';
import { dedent } from './__testsUtils__/dedent';
import { AnySpecError } from './error/AnySpecError';

function lexFirst(str: string) {
  const lexer = new Lexer(new Source(str));
  return lexer.advance();
}

function lexSecond(str: string) {
  const lexer = new Lexer(new Source(str));
  lexer.advance();
  return lexer.advance();
}

const getFullTokenList = (source: Source) => {
  const lexer = new Lexer(source);

  let tokenList = [];

  while (lexer.lookahead().kind !== TokenKind.EOF) {
    let current = lexer.advance();
    tokenList.push(
      current.kind === TokenKind.NAME || current.kind === TokenKind.NUMBER
        ? current.value
        : current.kind,
    );
  }

  return tokenList;
};

function expectSyntaxErrorFirst(text: string, expectedError: any) {
  let error = null;
  try {
    lexFirst(text);
  } catch (e) {
    error = e;
  }

  expect(error).toEqual(expectedError);
}

function expectSyntaxErrorSecond(text: string, expectedError: any) {
  let error = null;
  try {
    lexSecond(text);
  } catch (e) {
    error = e;
  }

  expect(error).toEqual(expectedError);
}

describe(__filename, () => {
  it('disallows uncommon control characters', () => {
    expectSyntaxErrorFirst('\u0007', {
      message: 'Syntax Error: Cannot contain the invalid character "\\u0007".',
      locations: [{ line: 1, column: 1 }],
    });
  });

  // https://en.wikipedia.org/wiki/Byte_order_mark
  it('accepts BOM header', () => {
    expect(lexFirst('\uFEFF foo').toJSON()).toEqual({
      kind: TokenKind.NAME,
      start: 2,
      end: 5,
      line: 1,
      column: 3,
      value: 'foo',
    });
  });

  it('tracks line breaks', () => {
    expect(lexFirst('foo').toJSON()).toStrictEqual({
      kind: TokenKind.NAME,
      start: 0,
      end: 3,
      line: 1,
      column: 1,
      value: 'foo',
    });
    expect(lexFirst('\nfoo').toJSON()).toStrictEqual({
      kind: TokenKind.NAME,
      start: 1,
      end: 4,
      line: 2,
      column: 1,
      value: 'foo',
    });
    expect(lexFirst('\rfoo').toJSON()).toStrictEqual({
      kind: TokenKind.NAME,
      start: 1,
      end: 4,
      line: 2,
      column: 1,
      value: 'foo',
    });
    expect(lexFirst('\r\nfoo').toJSON()).toStrictEqual({
      kind: TokenKind.NAME,
      start: 2,
      end: 5,
      line: 2,
      column: 1,
      value: 'foo',
    });
    expect(lexFirst('\n\rfoo').toJSON()).toStrictEqual({
      kind: TokenKind.NAME,
      start: 2,
      end: 5,
      line: 3,
      column: 1,
      value: 'foo',
    });
    expect(lexFirst('\r\r\n\nfoo').toJSON()).toStrictEqual({
      kind: TokenKind.NAME,
      start: 4,
      end: 7,
      line: 4,
      column: 1,
      value: 'foo',
    });
    expect(lexFirst('\n\n\r\rfoo').toJSON()).toStrictEqual({
      kind: TokenKind.NAME,
      start: 4,
      end: 7,
      line: 5,
      column: 1,
      value: 'foo',
    });
  });

  it('records line and column', () => {
    expect(lexFirst('\n \r\n \r  foo\n').toJSON()).toStrictEqual({
      kind: TokenKind.NAME,
      start: 8,
      end: 11,
      line: 4,
      column: 3,
      value: 'foo',
    });
  });

  it('can be JSON.stringified, util.inspected or jsutils.inspect', () => {
    const token = lexFirst('foo');
    expect(JSON.stringify(token)).toEqual(
      '{"end":3,"start":0,"kind":"Name","value":"foo","line":1,"column":1}',
    );
    expect(inspect(token.toJSON())).toEqual(
      "{ end: 3, start: 0, kind: 'Name', value: 'foo', line: 1, column: 1 }",
    );
  });

  it('skips whitespace and comments', () => {
    expect(
      lexFirst(`

    foo


`).toJSON(),
    ).toEqual({
      column: 5,
      line: 3,
      kind: TokenKind.NAME,
      start: 6,
      end: 9,
      value: 'foo',
    });

    expect(
      lexFirst(`
    #comment
    foo#comment
`).toJSON(),
    ).toEqual({
      column: 5,
      kind: TokenKind.NAME,
      line: 3,
      start: 18,
      end: 21,
      value: 'foo',
    });

    expect(lexFirst(',,,foo,,,').toJSON()).toEqual({
      column: 4,
      line: 1,
      kind: TokenKind.NAME,
      start: 3,
      end: 6,
      value: 'foo',
    });
  });

  it('errors respect whitespace', () => {
    let caughtError;
    try {
      lexFirst(['', '', '    >', ''].join('\n'));
    } catch (error) {
      caughtError = error;
    }
    expect(String(caughtError)).toEqual(dedent`
      Syntax Error: Cannot parse the unexpected character ">".

      Tinyspec code:3:5
      2 |
      3 |     >
        |     ^
      4 |
    `);
  });

  it('updates line numbers in error for file context', () => {
    let caughtError;
    try {
      const str = ['', '', '     >', ''].join('\n');
      const source = new Source(str, 'foo.js', { line: 11, column: 12 });
      new Lexer(source).advance();
    } catch (error) {
      caughtError = error;
    }
    expect(String(caughtError)).toEqual(dedent`
      Syntax Error: Cannot parse the unexpected character ">".

      foo.js:13:6
      12 |
      13 |      >
         |      ^
      14 |
    `);
  });

  it('updates column numbers in error for file context', () => {
    let caughtError;
    try {
      const source = new Source('>', 'foo.js', { line: 1, column: 5 });
      new Lexer(source).advance();
    } catch (error) {
      caughtError = error;
    }
    expect(String(caughtError)).toEqual(dedent`
      Syntax Error: Cannot parse the unexpected character ">".

      foo.js:1:5
      1 |     >
        |     ^
    `);
  });

  // TODO: add logic to parse `` controllers string
  it('respects `` string in controllers specs', () => {});

  it('doesnt lex strings - it should throws error', () => {
    expectSyntaxErrorFirst('""', {
      message: 'Syntax Error: Cannot parse the unexpected character (").',
      locations: [{ line: 1, column: 1 }],
    });

    expectSyntaxErrorFirst('"simple"', {
      message: 'Syntax Error: Cannot parse the unexpected character (").',
      locations: [{ line: 1, column: 1 }],
    });

    expectSyntaxErrorFirst("'", {
      message: "Syntax Error: Cannot parse the unexpected character (').",
      locations: [{ line: 1, column: 1 }],
    });

    expectSyntaxErrorFirst('`', {
      message: 'Syntax Error: Cannot parse the unexpected character "`".',
      locations: [{ line: 1, column: 1 }],
    });
  });

  it(`doesn't lexes numbers`, () => {
    expectSyntaxErrorFirst('0', {
      message: 'Syntax Error: Cannot parse the unexpected character "0".',
      locations: [{ line: 1, column: 1 }],
    });

    expectSyntaxErrorFirst('1', {
      message: 'Syntax Error: Cannot parse the unexpected character "1".',
      locations: [{ line: 1, column: 1 }],
    });

    expectSyntaxErrorFirst('2', {
      message: 'Syntax Error: Cannot parse the unexpected character "2".',
      locations: [{ line: 1, column: 1 }],
    });

    expectSyntaxErrorFirst('3', {
      message: 'Syntax Error: Cannot parse the unexpected character "3".',
      locations: [{ line: 1, column: 1 }],
    });
    expectSyntaxErrorFirst('4', {
      message: 'Syntax Error: Cannot parse the unexpected character "4".',
      locations: [{ line: 1, column: 1 }],
    });

    expectSyntaxErrorFirst('5', {
      message: 'Syntax Error: Cannot parse the unexpected character "5".',
      locations: [{ line: 1, column: 1 }],
    });

    // expectSyntaxErrorFirst('-5', {
    //   message: 'Syntax Error: Cannot parse the unexpected character "-".',
    //   locations: [{ line: 1, column: 1 }],
    // });
  });

  it('lexes punctuation', () => {
    expect(lexFirst('!').toJSON()).toMatchObject({
      kind: TokenKind.BANG,
      start: 0,
      end: 1,
      value: undefined,
    });

    expect(lexFirst('$').toJSON()).toMatchObject({
      kind: TokenKind.DOLLAR,
      start: 0,
      end: 1,
      value: undefined,
    });

    expect(lexFirst('(').toJSON()).toMatchObject({
      kind: TokenKind.PAREN_L,
      start: 0,
      end: 1,
      value: undefined,
    });

    expect(lexFirst(')').toJSON()).toMatchObject({
      kind: TokenKind.PAREN_R,
      start: 0,
      end: 1,
      value: undefined,
    });

    expect(lexFirst(':').toJSON()).toMatchObject({
      kind: TokenKind.COLON,
      start: 0,
      end: 1,
      value: undefined,
    });

    expect(lexFirst('=').toJSON()).toMatchObject({
      kind: TokenKind.EQUALS,
      start: 0,
      end: 1,
      value: undefined,
    });

    expect(lexFirst('@').toJSON()).toMatchObject({
      kind: TokenKind.AT,
      start: 0,
      end: 1,
      value: undefined,
    });

    expect(lexFirst('[').toJSON()).toMatchObject({
      kind: TokenKind.BRACKET_L,
      start: 0,
      end: 1,
      value: undefined,
    });

    expect(lexFirst(']').toJSON()).toMatchObject({
      kind: TokenKind.BRACKET_R,
      start: 0,
      end: 1,
      value: undefined,
    });

    expect(lexFirst('{').toJSON()).toMatchObject({
      kind: TokenKind.BRACE_L,
      start: 0,
      end: 1,
      value: undefined,
    });

    expect(lexFirst('|').toJSON()).toMatchObject({
      kind: TokenKind.PIPE,
      start: 0,
      end: 1,
      value: undefined,
    });

    expect(lexFirst('}').toJSON()).toMatchObject({
      kind: TokenKind.BRACE_R,
      start: 0,
      end: 1,
      value: undefined,
    });

    expect(lexFirst('<').toJSON()).toMatchObject({
      kind: TokenKind.EXTENDS,
      start: 0,
      end: 1,
      value: undefined,
    });

    expect(lexFirst('?').toJSON()).toMatchObject({
      kind: TokenKind.QUESTION_MARK,
      start: 0,
      end: 1,
      value: undefined,
    });
  });

  it('lex reports useful unknown character error', () => {
    expectSyntaxErrorFirst('..', {
      message: 'Syntax Error: Cannot parse the unexpected character ".".',
      locations: [{ line: 1, column: 1 }],
    });

    expectSyntaxErrorFirst('>', {
      message: 'Syntax Error: Cannot parse the unexpected character ">".',
      locations: [{ line: 1, column: 1 }],
    });

    expectSyntaxErrorFirst('\u203B', {
      message: 'Syntax Error: Cannot parse the unexpected character "\\u203B".',
      locations: [{ line: 1, column: 1 }],
    });

    expectSyntaxErrorFirst('\u200b', {
      message: 'Syntax Error: Cannot parse the unexpected character "\\u200B".',
      locations: [{ line: 1, column: 1 }],
    });
  });

  it('lexer respects dashes in names', () => {
    const source = new Source('a-b');
    const lexer = new Lexer(source);
    const firstToken = lexer.advance();
    expect(firstToken.toJSON()).toMatchObject({
      kind: TokenKind.NAME,
      start: 0,
      end: 3,
      value: 'a-b',
    });

    const source2 = new Source('-a-b');
    const lexer2 = new Lexer(source2);
    const firstToken2 = lexer2.advance();
    expect(firstToken2.toJSON()).toMatchObject({
      kind: TokenKind.NAME,
      start: 0,
      end: 4,
      value: '-a-b',
    });

    const source3 = new Source('-5-b');
    const lexer3 = new Lexer(source3);
    const firstToken3 = lexer3.advance();
    expect(firstToken3.toJSON()).toMatchObject({
      kind: TokenKind.NAME,
      start: 0,
      end: 4,
      value: '-5-b',
    });
  });

  it('produces double linked list of tokens, including comments', () => {
    const source = new Source(`
      {
        #comment
        field
      }
    `);

    const lexer = new Lexer(source);
    const startToken = lexer.token;
    let endToken;
    do {
      endToken = lexer.advance();
      // Lexer advances over ignored comment tokens to make writing parsers
      // easier, but will include them in the linked list result.
      expect(endToken.kind).not.toEqual(TokenKind.COMMENT);
    } while (endToken.kind !== TokenKind.EOF);

    expect(startToken.prev).toEqual(null);
    expect(endToken.next).toEqual(null);

    const tokens = [];
    for (let tok: Token | null = startToken; tok; tok = tok.next) {
      if (tokens.length) {
        // Tokens are double-linked, prev should point to last seen token.
        expect(tok.prev).toEqual(tokens[tokens.length - 1]);
      }
      tokens.push(tok);
    }

    expect(tokens.map((tok) => tok.kind)).toEqual([
      TokenKind.SOF,
      TokenKind.BRACE_L,
      TokenKind.COMMENT,
      TokenKind.NAME,
      TokenKind.BRACE_R,
      TokenKind.EOF,
    ]);
  });

  it('throws errors in wrong description syntax', () => {});

  it('respects descriptions', () => {
    expect(lexFirst('// qweqweqweqweqw qwe').toJSON()).toMatchObject({
      kind: TokenKind.DESCRIPTION,
      start: 0,
      end: 21,
      value: 'qweqweqweqweqw qwe',
    });

    expect(lexFirst('// qweqw///eqweqweqw qwe').toJSON()).toMatchObject({
      kind: TokenKind.DESCRIPTION,
      start: 0,
      end: 24,
      value: 'qweqw///eqweqweqw qwe',
    });
  });

  it('respects multiline description', () => {
    expect(lexFirst('// hi \n // kek').toJSON()).toMatchObject({
      kind: TokenKind.DESCRIPTION,
      start: 0,
      end: 6,
      value: 'hi',
    });

    expect(lexSecond('// hi \n // kek').toJSON()).toMatchObject({
      kind: TokenKind.DESCRIPTION,
      start: 8,
      end: 14,
      value: 'kek',
    });
  });
});

describe('isPunctuatorTokenKind', () => {
  function isPunctuatorToken(text: string) {
    return isPunctuatorTokenKind(lexFirst(text).kind);
  }

  it('returns true for punctuator tokens', () => {
    expect(isPunctuatorToken('!')).toEqual(true);
    expect(isPunctuatorToken('$')).toEqual(true);
    expect(isPunctuatorToken('&')).toEqual(true);
    expect(isPunctuatorToken('(')).toEqual(true);
    expect(isPunctuatorToken(')')).toEqual(true);
    expect(isPunctuatorToken(':')).toEqual(true);
    expect(isPunctuatorToken('=')).toEqual(true);
    expect(isPunctuatorToken('@')).toEqual(true);
    expect(isPunctuatorToken('[')).toEqual(true);
    expect(isPunctuatorToken(']')).toEqual(true);
    expect(isPunctuatorToken('{')).toEqual(true);
    expect(isPunctuatorToken('|')).toEqual(true);
    expect(isPunctuatorToken('}')).toEqual(true);
  });

  // it('returns false for non-punctuator tokens', () => {
  // expect(isPunctuatorToken('')).toEqual(false);
  // expect(isPunctuatorToken('name')).toEqual(false);
  // // expect(isPunctuatorToken('1')).toEqual(false);
  // // expect(isPunctuatorToken('3.14')).toEqual(false);
  // expect(isPunctuatorToken('"str"')).toEqual(false);
  // expect(isPunctuatorToken('"""str"""')).toEqual(false);
  // });
});

describe('lexer understands enums', () => {
  it('lexer understand normal enum', () => {
    const enumString = new Source(`A (f | b)`);

    const tokens = getFullTokenList(enumString);

    expect(tokens).toEqual(['A', '(', 'f', '|', 'b', ')']);
  });

  it('lexer understand enum with spaces and symbols', () => {
    const enumString = new Source(`A 
      (f f |
        b (a, d+))`);

    const tokens = getFullTokenList(enumString);

    expect(tokens).toEqual(['A', '(', 'f f', '|', 'b (a, d+)', ')']);
  });

  it('lexer understand complex enum with spaces and symbols', () => {
    const enumString = new Source(`CompanyType (
      Branch Office Singapore |
      Exempt Private Company Limited by Shares (Pte. Ltd.) |
      Limited Liability Partnership (LLP) |
      Limited Partnership (LP) |
      Private Company Limited by Shares (Pte. Ltd.) |
    
      Private Limited Company, use of 'Limited' exemption |
      Converted / closed |
      Protected cell company |
      Assurance company |
    )`);

    const tokens = getFullTokenList(enumString);

    expect(tokens).toEqual([
      'CompanyType',
      '(',
      'Branch Office Singapore',
      '|',
      'Exempt Private Company Limited by Shares (Pte. Ltd.)',
      '|',
      'Limited Liability Partnership (LLP)',
      '|',
      'Limited Partnership (LP)',
      '|',
      'Private Company Limited by Shares (Pte. Ltd.)',
      '|',
      "Private Limited Company, use of 'Limited' exemption",
      '|',
      'Converted / closed',
      '|',
      'Protected cell company',
      '|',
      'Assurance company',
      '|',
      ')',
    ]);
  });

  it('lexer understand enum with symbols', () => {
    const enumString = new Source(`BankAccountStatus (
      -amount |
      amount |
      + amount |
    )`);

    const tokens = getFullTokenList(enumString);

    expect(tokens).toEqual([
      'BankAccountStatus',
      '(',
      '-amount',
      '|',
      'amount',
      '|',
      '+ amount',
      '|',
      ')',
    ]);
  });

  it('lexer understand enum with dashes', () => {
    const enumString = new Source(`CompanyType (
      b-office-singapore |
      exempt-private
    )`);

    const tokens = getFullTokenList(enumString);

    expect(tokens).toEqual(['CompanyType', '(', 'b-office-singapore', '|', 'exempt-private', ')']);
  });
});

describe('lexer can catch some parenthesis errors inside enums', () => {
  it('unbalanced parenthesis not allowed 1', () => {
    const enumString = new Source(`CompanyType (
      Limited Partnership (LP)( |
      exempt-private
    )`);

    expect(() => getFullTokenList(enumString)).toThrow(
      'Syntax Error: parenthesis should be balanced inside enum definition',
    );
  });

  it('unbalanced parenthesis not allowed 2', () => {
    const enumString = new Source(`CompanyType (
      (Limited Partnership |
      exempt-private
    )`);

    expect(() => getFullTokenList(enumString)).toThrow(
      'Syntax Error: parenthesis should be balanced inside enum definition',
    );
  });

  it('unbalanced parenthesis not allowed 3', () => {
    const enumString = new Source(`CompanyType (
      Limited Partnership |
      exempt-private(
    )`);

    expect(() => getFullTokenList(enumString)).toThrow(
      'Syntax Error: parenthesis should be balanced inside enum definition',
    );
  });

  it('unbalanced parenthesis not allowed 4', () => {
    const enumString = new Source(`CompanyType (
      Limited Partnership |
      exempt-private( |
    )`);

    expect(() => getFullTokenList(enumString)).toThrow(
      'Syntax Error: parenthesis should be balanced inside enum definition',
    );
  });

  it('unbalanced parenthesis not allowed 5', () => {
    const enumString = new Source(`CompanyType (
      Limited Partnership |
      (exempt-private( 
    )`);

    expect(() => getFullTokenList(enumString)).toThrow(
      'Syntax Error: parenthesis should be balanced inside enum definition',
    );
  });
});

describe('lexer can understand endpoints', () => {
  it('lexer can understand endpoints basic', () => {
    const sourceString = `
\`/analytics_events\`:
    // **Create**
    @token POST /analytics_events AnalyticsEventNewRequest
      => AnalyticsEventNewResponse
    POST /analytics_events AnalyticsEventNewRequest
      => AnalyticsEventNewResponse
`;
    const enumString = new Source(
      sourceString,
      'Tinyspec endpoints code',
      { line: 1, column: 1 },
      'endpoints',
    );

    const expectedTokens = [
      '/analytics_events',
      ':',
      '<INDENT>',
      'Description',
      '@',
      'token',
      'POST',
      '/analytics_events',
      'AnalyticsEventNewRequest',
      '<INDENT>',
      '=>',
      'AnalyticsEventNewResponse',
      '<DEDENT>',
      'POST',
      '/analytics_events',
      'AnalyticsEventNewRequest',
      '<INDENT>',
      '=>',
      'AnalyticsEventNewResponse',
      '<DEDENT>',
      '<DEDENT>',
    ];

    expect(getFullTokenList(enumString)).toEqual(expectedTokens);
  });

  it('lexer can understand endpoints basic, should ignore empty lines', () => {
    const sourceString = `
\`/analytics_events\`:
  // **Create**
  @token POST /analytics_events AnalyticsEventNewRequest
    => AnalyticsEventNewResponse
              


  POST /analytics_events AnalyticsEventNewRequest
    => AnalyticsEventNewResponse
`;
    const enumString = new Source(
      sourceString,
      'Tinyspec endpoints code',
      { line: 1, column: 1 },
      'endpoints',
    );

    const expectedTokens = [
      '/analytics_events',
      ':',
      '<INDENT>',
      'Description',
      '@',
      'token',
      'POST',
      '/analytics_events',
      'AnalyticsEventNewRequest',
      '<INDENT>',
      '=>',
      'AnalyticsEventNewResponse',
      '<DEDENT>',
      'POST',
      '/analytics_events',
      'AnalyticsEventNewRequest',
      '<INDENT>',
      '=>',
      'AnalyticsEventNewResponse',
      '<DEDENT>',
      '<DEDENT>',
    ];

    expect(getFullTokenList(enumString)).toEqual(expectedTokens);
  });

  it('lexer can understand endpoints basic v2', () => {
    const sourceString = `
\`/analytics_events\`:
  // **Create**
  @token POST /analytics_events AnalyticsEventNewRequest
    => AnalyticsEventNewResponse
    
POST /analytics_events AnalyticsEventNewRequest
  => AnalyticsEventNewResponse
`;
    const enumString = new Source(
      sourceString,
      'Tinyspec endpoints code',
      { line: 1, column: 1 },
      'endpoints',
    );

    const expectedTokens = [
      '/analytics_events',
      ':',
      '<INDENT>',
      'Description',
      '@',
      'token',
      'POST',
      '/analytics_events',
      'AnalyticsEventNewRequest',
      '<INDENT>',
      '=>',
      'AnalyticsEventNewResponse',
      '<DEDENT>',
      '<DEDENT>',
      'POST',
      '/analytics_events',
      'AnalyticsEventNewRequest',
      '<INDENT>',
      '=>',
      'AnalyticsEventNewResponse',
      '<DEDENT>',
    ];

    expect(getFullTokenList(enumString)).toEqual(expectedTokens);
  });

  it('lexer can understand endpoints basic v3', () => {
    const sourceString = `
GET /hero/exchangeRates?HrGetExchangeRateRequestQuery
  => HrGetExchangeRateListResponse
  
  
\`/roles\`:
  @token $CRUDL /roles
  
HEAD /pechkin/mandrill/event
  => {}
`;
    const enumString = new Source(
      sourceString,
      'Tinyspec endpoints code',
      { line: 1, column: 1 },
      'endpoints',
    );

    const expectedTokens = [
      'GET',
      '/hero/exchangeRates?HrGetExchangeRateRequestQuery',
      '<INDENT>',
      '=>',
      'HrGetExchangeRateListResponse',
      '<DEDENT>',
      '/roles',
      ':',
      '<INDENT>',
      '@',
      'token',
      '$',
      'CRUDL',
      '/roles',
      '<DEDENT>',
      'HEAD',
      '/pechkin/mandrill/event',
      '<INDENT>',
      '=>',
      '{',
      '}',
      '<DEDENT>',
    ];

    expect(getFullTokenList(enumString)).toEqual(expectedTokens);
  });
  it('lexer can understand endpoints basic v4', () => {
    const sourceString = `

HEAD /pechkin/mandrill/event
    => {}
  
// **Delete**
      // Permissions: \`companies:write\`
      @token DELETE /accounting/bank_accounts/:id:i
          => 204
`;
    const enumString = new Source(
      sourceString,
      'Tinyspec endpoints code',
      { line: 1, column: 1 },
      'endpoints',
    );

    const expectedTokens = [
      'HEAD',
      '/pechkin/mandrill/event',
      '<INDENT>',
      '=>',
      '{',
      '}',
      '<DEDENT>',
      'Description',
      '<INDENT>',
      'Description',
      '@',
      'token',
      'DELETE',
      '/accounting/bank_accounts/:id:i',
      '<INDENT>',
      '=>',
      '204',
      '<DEDENT>',
      '<DEDENT>',
    ];

    expect(getFullTokenList(enumString)).toEqual(expectedTokens);
  });
  it('lexer can understand endpoints complex', () => {
    const sourceString = `

HEAD /pechkin/mandrill/event {messageSenderId?: i, conversationId?: i, ticketId?: i, taskId?: i, isNewTicketRequired?: b }
    => {tigerDocument: TigerDocument, pandaDocument: PandaDocument, messageIds: i[]}
  
// **Delete**
      // Permissions: \`companies:write\`
      @token DELETE /accounting/bank_accounts/:id:i
          => 204
`;
    const enumString = new Source(
      sourceString,
      'Tinyspec endpoints code',
      { line: 1, column: 1 },
      'endpoints',
    );

    const expectedTokens = [
      'HEAD',
      '/pechkin/mandrill/event',
      '{',
      'messageSenderId',
      '?',
      ':',
      'i',
      'conversationId',
      '?',
      ':',
      'i',
      'ticketId',
      '?',
      ':',
      'i',
      'taskId',
      '?',
      ':',
      'i',
      'isNewTicketRequired',
      '?',
      ':',
      'b',
      '}',
      '<INDENT>',
      '=>',
      '{',
      'tigerDocument',
      ':',
      'TigerDocument',
      'pandaDocument',
      ':',
      'PandaDocument',
      'messageIds',
      ':',
      'i',
      '[',
      ']',
      '}',
      '<DEDENT>',
      'Description',
      '<INDENT>',
      'Description',
      '@',
      'token',
      'DELETE',
      '/accounting/bank_accounts/:id:i',
      '<INDENT>',
      '=>',
      '204',
      '<DEDENT>',
      '<DEDENT>',
    ];

    expect(getFullTokenList(enumString)).toEqual(expectedTokens);
  });
});

describe('lexer can catch errors in endpoints', () => {
  it('unbalanced indentation not allowed', () => {
    const sourceString = `
  \`/analytics_events\`:
  // **Create**
 @token POST /analytics_events AnalyticsEventNewRequest
    => AnalyticsEventNewResponse
     POST /analytics_events AnalyticsEventNewRequest
    => AnalyticsEventNewResponse
`;
    const enumString = new Source(
      sourceString,
      'Tinyspec endpoints code',
      { line: 1, column: 1 },
      'endpoints',
    );

    expect(() => getFullTokenList(enumString)).toThrow(
      'Syntax Error: unindent does not match any outer indentation level',
    );
  });
  it('unbalanced indentation not allowed 1', () => {
    const sourceString = `
  \`/analytics_events\`:
  // **Create**
  @token POST /analytics_events AnalyticsEventNewRequest
    => AnalyticsEventNewResponse

   POST /analytics_events AnalyticsEventNewRequest
    => AnalyticsEventNewResponse
`;
    const enumString = new Source(
      sourceString,
      'Tinyspec endpoints code',
      { line: 1, column: 1 },
      'endpoints',
    );

    expect(() => getFullTokenList(enumString)).toThrow(
      'Syntax Error: unindent does not match any outer indentation level',
    );
  });
});
