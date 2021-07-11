import { TokenKind } from './token';
import { Lexer } from './lexer';
import { Source } from './source';

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

describe('lexer can understand endpoints', () => {
  it('lexer can understand endpoints with sudden EOF', () => {
    const sourceString = `
\`/analytics_events\`:
    // **Create**
    @token POST /analytics_events AnalyticsEventNewRequest
        => AnalyticsEventNewResponse
    POST /analytics_events AnalyticsEventNewRequest
        => AnalyticsEventNewResponse`;

    const enumString = new Source({
      body: sourceString,
      name: 'Endpoints code',
      locationOffset: { line: 1, column: 1 },
      sourceType: 'endpoints',
    });

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
  it('lexer can understand endpoints basic', () => {
    const sourceString = `
\`/analytics_events\`:
    // **Create**
    @token POST /analytics_events AnalyticsEventNewRequest
        => AnalyticsEventNewResponse
    POST /analytics_events AnalyticsEventNewRequest
        => AnalyticsEventNewResponse

`;
    const enumString = new Source({
      body: sourceString,
      name: 'Endpoints code',
      locationOffset: { line: 1, column: 1 },
      sourceType: 'endpoints',
    });
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
    const enumString = new Source({
      body: sourceString,
      name: 'Endpoints code',
      locationOffset: { line: 1, column: 1 },
      sourceType: 'endpoints',
    });

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
    const enumString = new Source({
      body: sourceString,
      name: 'Endpoints code',
      locationOffset: { line: 1, column: 1 },
      sourceType: 'endpoints',
    });
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
    => {}`;

    const enumString = new Source({
      body: sourceString,
      name: 'Endpoints code',
      locationOffset: { line: 1, column: 1 },
      sourceType: 'endpoints',
    });

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
    const enumString = new Source({
      body: sourceString,
      name: 'Endpoints code',
      locationOffset: { line: 1, column: 1 },
      sourceType: 'endpoints',
    });

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

  it('lexer can understand endpoints basic with inline enums', () => {
    const sourceString = `
\`/analytics_events\`:
    // **Create**
    @token POST /analytics_events ( a | b )
        => AnalyticsEventNewResponse
                
  
    POST /analytics_events AnalyticsEventNewRequest
        => ( a | b | )
`;
    const enumString = new Source({
      body: sourceString,
      name: 'Endpoints code',
      locationOffset: { line: 1, column: 1 },
      sourceType: 'endpoints',
    });

    const expectedTokens = [
      '/analytics_events',
      ':',
      '<INDENT>',
      'Description',
      '@',
      'token',
      'POST',
      '/analytics_events',
      '(',
      'a',
      '|',
      'b',
      ')',
      '<INDENT>',
      '=>',
      'AnalyticsEventNewResponse',
      '<DEDENT>',
      'POST',
      '/analytics_events',
      'AnalyticsEventNewRequest',
      '<INDENT>',
      '=>',
      '(',
      'a',
      '|',
      'b',
      '|',
      ')',
      '<DEDENT>',
      '<DEDENT>',
    ];

    expect(getFullTokenList(enumString)).toEqual(expectedTokens);
  });

  it('lexer can understand endpoints with odd syntax', () => {
    const sourceString = `
\`/industries\`:
  $L /industries ?branch?
`;
    const enumString = new Source({
      body: sourceString,
      name: 'Endpoints code',
      locationOffset: { line: 1, column: 1 },
      sourceType: 'endpoints',
    });

    const expectedTokens = [
      '/industries',
      ':',
      '<INDENT>',
      '$',
      'L',
      '/industries',
      '?',
      'branch',
      '?',
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
        => 204`;
    const enumString = new Source({
      body: sourceString,
      name: 'Endpoints code',
      locationOffset: { line: 1, column: 1 },
      sourceType: 'endpoints',
    });

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
    const enumString = new Source({
      body: sourceString,
      name: 'Endpoints code',
      locationOffset: { line: 1, column: 1 },
      sourceType: 'endpoints',
    });

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
    const enumString = new Source({
      body: sourceString,
      name: 'Endpoints code',
      locationOffset: { line: 1, column: 1 },
      sourceType: 'endpoints',
    });
    expect(() => getFullTokenList(enumString)).toThrow(
      'Syntax Error: unindent does not match any outer indentation level',
    );
  });
});
