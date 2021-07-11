import { ASTNode, ASTNodeKind } from './language/ast';
import { AnySpecError } from './error/AnySpecError';
import { parse as defaultParse } from './parser';
import { toJSONDeep, log } from './utils';
import { Source } from './source';

const parse = (source: string | Source) => defaultParse(source, { noLocation: true });

describe(__filename, () => {
  it('can parse endpoint with query param', () => {
    const sourceString = `
POST /endpoint?RequestQuery
    => ResponseModel
`;

    const expectedAST: ASTNode = {
      kind: ASTNodeKind.DOCUMENT,
      definitions: [
        {
          kind: ASTNodeKind.ENDPOINT_NAMESPACE_TYPE_DEFINITION,
          endpoints: [
            {
              kind: ASTNodeKind.ENDPOINT_TYPE_DEFINITION,
              verb: {
                kind: ASTNodeKind.ENDPOINT_VERB,
                name: { kind: ASTNodeKind.NAME, value: 'POST' },
              },
              url: {
                kind: ASTNodeKind.ENDPOINT_URL,
                name: { kind: ASTNodeKind.NAME, value: '/endpoint' },
                parameters: [
                  {
                    kind: ASTNodeKind.ENDPOINT_PARAMETER,
                    type: {
                      kind: ASTNodeKind.ENDPOINT_PARAMETER_QUERY,
                      name: { kind: ASTNodeKind.NAME, value: 'RequestQuery' },
                    },
                  },
                ],
              },
              responses: [
                {
                  kind: ASTNodeKind.ENDPOINT_RESPONSE,
                  type: {
                    kind: ASTNodeKind.NAMED_TYPE,
                    name: {
                      kind: ASTNodeKind.NAME,
                      value: 'ResponseModel',
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const source = new Source({
      body: sourceString,
      name: 'Endpoints code',
      locationOffset: { line: 1, column: 1 },
      sourceType: 'endpoints',
    });

    const ast = parse(source);

    expect(toJSONDeep(ast)).toEqual(expectedAST);
  });
  it('can parse endpoint with query param and request argument', () => {
    const sourceString = `
POST /endpoint?RequestQuery RequestModel
    => ResponseModel
`;

    const expectedAST: ASTNode = {
      kind: ASTNodeKind.DOCUMENT,
      definitions: [
        {
          kind: ASTNodeKind.ENDPOINT_NAMESPACE_TYPE_DEFINITION,
          endpoints: [
            {
              kind: ASTNodeKind.ENDPOINT_TYPE_DEFINITION,
              verb: {
                kind: ASTNodeKind.ENDPOINT_VERB,
                name: { kind: ASTNodeKind.NAME, value: 'POST' },
              },
              url: {
                kind: ASTNodeKind.ENDPOINT_URL,
                name: { kind: ASTNodeKind.NAME, value: '/endpoint' },
                parameters: [
                  {
                    kind: ASTNodeKind.ENDPOINT_PARAMETER,
                    type: {
                      kind: ASTNodeKind.ENDPOINT_PARAMETER_BODY,
                      type: {
                        kind: ASTNodeKind.NAMED_TYPE,
                        name: { kind: ASTNodeKind.NAME, value: 'RequestModel' },
                      },
                    },
                  },
                  {
                    kind: ASTNodeKind.ENDPOINT_PARAMETER,
                    type: {
                      kind: ASTNodeKind.ENDPOINT_PARAMETER_QUERY,
                      name: { kind: ASTNodeKind.NAME, value: 'RequestQuery' },
                    },
                  },
                ],
              },
              responses: [
                {
                  kind: ASTNodeKind.ENDPOINT_RESPONSE,
                  type: {
                    kind: ASTNodeKind.NAMED_TYPE,
                    name: {
                      kind: ASTNodeKind.NAME,
                      value: 'ResponseModel',
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const source = new Source({
      body: sourceString,
      name: 'Endpoints code',
      locationOffset: { line: 1, column: 1 },
      sourceType: 'endpoints',
    });

    const ast = parse(source);

    expect(toJSONDeep(ast)).toEqual(expectedAST);
  });
  it('can parse endpoint with query param', () => {
    const sourceString = `
POST /endpoint?RequestQuery
    => ResponseModel
`;

    const expectedAST: ASTNode = {
      kind: ASTNodeKind.DOCUMENT,
      definitions: [
        {
          kind: ASTNodeKind.ENDPOINT_NAMESPACE_TYPE_DEFINITION,
          endpoints: [
            {
              kind: ASTNodeKind.ENDPOINT_TYPE_DEFINITION,
              verb: {
                kind: ASTNodeKind.ENDPOINT_VERB,
                name: { kind: ASTNodeKind.NAME, value: 'POST' },
              },
              url: {
                kind: ASTNodeKind.ENDPOINT_URL,
                name: { kind: ASTNodeKind.NAME, value: '/endpoint' },
                parameters: [
                  {
                    kind: ASTNodeKind.ENDPOINT_PARAMETER,
                    type: {
                      kind: ASTNodeKind.ENDPOINT_PARAMETER_QUERY,
                      name: { kind: ASTNodeKind.NAME, value: 'RequestQuery' },
                    },
                  },
                ],
              },
              responses: [
                {
                  kind: ASTNodeKind.ENDPOINT_RESPONSE,
                  type: {
                    kind: ASTNodeKind.NAMED_TYPE,
                    name: {
                      kind: ASTNodeKind.NAME,
                      value: 'ResponseModel',
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const source = new Source({
      body: sourceString,
      name: 'Endpoints code',
      locationOffset: { line: 1, column: 1 },
      sourceType: 'endpoints',
    });

    const ast = parse(source);

    expect(toJSONDeep(ast)).toEqual(expectedAST);
  });
  it('can parse endpoint with single path param', () => {
    const sourceString = `
POST /endpoint/:entryType
    => ResponseModel
`;

    const expectedAST: ASTNode = {
      kind: ASTNodeKind.DOCUMENT,
      definitions: [
        {
          kind: ASTNodeKind.ENDPOINT_NAMESPACE_TYPE_DEFINITION,
          endpoints: [
            {
              kind: ASTNodeKind.ENDPOINT_TYPE_DEFINITION,
              verb: {
                kind: ASTNodeKind.ENDPOINT_VERB,
                name: { kind: ASTNodeKind.NAME, value: 'POST' },
              },
              url: {
                kind: ASTNodeKind.ENDPOINT_URL,
                name: { kind: ASTNodeKind.NAME, value: '/endpoint/:entryType' },
                parameters: [
                  {
                    kind: ASTNodeKind.ENDPOINT_PARAMETER,
                    type: {
                      kind: ASTNodeKind.ENDPOINT_PARAMETER_PATH,
                      name: { kind: ASTNodeKind.NAME, value: 'entryType' },
                      type: {
                        kind: ASTNodeKind.ENDPOINT_PARAMETER_PATH_TYPE,
                      },
                    },
                  },
                ],
              },
              responses: [
                {
                  kind: ASTNodeKind.ENDPOINT_RESPONSE,
                  type: {
                    kind: ASTNodeKind.NAMED_TYPE,
                    name: {
                      kind: ASTNodeKind.NAME,
                      value: 'ResponseModel',
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const source = new Source({
      body: sourceString,
      name: 'Endpoints code',
      locationOffset: { line: 1, column: 1 },
      sourceType: 'endpoints',
    });

    const ast = parse(source);

    expect(toJSONDeep(ast)).toEqual(expectedAST);
  });
  it('can parse endpoint with multiple path param', () => {
    const sourceString = `
POST /endpoint/:entryType/:entryType2
    => ResponseModel
`;

    const expectedAST: ASTNode = {
      kind: ASTNodeKind.DOCUMENT,
      definitions: [
        {
          kind: ASTNodeKind.ENDPOINT_NAMESPACE_TYPE_DEFINITION,
          endpoints: [
            {
              kind: ASTNodeKind.ENDPOINT_TYPE_DEFINITION,
              verb: {
                kind: ASTNodeKind.ENDPOINT_VERB,
                name: { kind: ASTNodeKind.NAME, value: 'POST' },
              },
              url: {
                kind: ASTNodeKind.ENDPOINT_URL,
                name: { kind: ASTNodeKind.NAME, value: '/endpoint/:entryType/:entryType2' },
                parameters: [
                  {
                    kind: ASTNodeKind.ENDPOINT_PARAMETER,
                    type: {
                      kind: ASTNodeKind.ENDPOINT_PARAMETER_PATH,
                      name: { kind: ASTNodeKind.NAME, value: 'entryType' },
                      type: {
                        kind: ASTNodeKind.ENDPOINT_PARAMETER_PATH_TYPE,
                      },
                    },
                  },
                  {
                    kind: ASTNodeKind.ENDPOINT_PARAMETER,
                    type: {
                      kind: ASTNodeKind.ENDPOINT_PARAMETER_PATH,
                      name: { kind: ASTNodeKind.NAME, value: 'entryType2' },
                      type: {
                        kind: ASTNodeKind.ENDPOINT_PARAMETER_PATH_TYPE,
                      },
                    },
                  },
                ],
              },
              responses: [
                {
                  kind: ASTNodeKind.ENDPOINT_RESPONSE,
                  type: {
                    kind: ASTNodeKind.NAMED_TYPE,
                    name: {
                      kind: ASTNodeKind.NAME,
                      value: 'ResponseModel',
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const source = new Source({
      body: sourceString,
      name: 'Endpoints code',
      locationOffset: { line: 1, column: 1 },
      sourceType: 'endpoints',
    });

    const ast = parse(source);

    expect(toJSONDeep(ast)).toEqual(expectedAST);
  });
  it('can parse endpoint with multiple path param separated by url parts', () => {
    const sourceString = `
POST /endpoint/:entryType/api/v2/:entryType2
    => ResponseModel
`;

    const expectedAST: ASTNode = {
      kind: ASTNodeKind.DOCUMENT,
      definitions: [
        {
          kind: ASTNodeKind.ENDPOINT_NAMESPACE_TYPE_DEFINITION,
          endpoints: [
            {
              kind: ASTNodeKind.ENDPOINT_TYPE_DEFINITION,
              verb: {
                kind: ASTNodeKind.ENDPOINT_VERB,
                name: { kind: ASTNodeKind.NAME, value: 'POST' },
              },
              url: {
                kind: ASTNodeKind.ENDPOINT_URL,
                name: { kind: ASTNodeKind.NAME, value: '/endpoint/:entryType/api/v2/:entryType2' },
                parameters: [
                  {
                    kind: ASTNodeKind.ENDPOINT_PARAMETER,
                    type: {
                      kind: ASTNodeKind.ENDPOINT_PARAMETER_PATH,
                      name: { kind: ASTNodeKind.NAME, value: 'entryType' },
                      type: {
                        kind: ASTNodeKind.ENDPOINT_PARAMETER_PATH_TYPE,
                      },
                    },
                  },
                  {
                    kind: ASTNodeKind.ENDPOINT_PARAMETER,
                    type: {
                      kind: ASTNodeKind.ENDPOINT_PARAMETER_PATH,
                      name: { kind: ASTNodeKind.NAME, value: 'entryType2' },
                      type: {
                        kind: ASTNodeKind.ENDPOINT_PARAMETER_PATH_TYPE,
                      },
                    },
                  },
                ],
              },
              responses: [
                {
                  kind: ASTNodeKind.ENDPOINT_RESPONSE,
                  type: {
                    kind: ASTNodeKind.NAMED_TYPE,
                    name: {
                      kind: ASTNodeKind.NAME,
                      value: 'ResponseModel',
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const source = new Source({
      body: sourceString,
      name: 'Endpoints code',
      locationOffset: { line: 1, column: 1 },
      sourceType: 'endpoints',
    });

    const ast = parse(source);

    expect(toJSONDeep(ast)).toEqual(expectedAST);
  });
  it('can parse endpoint with multiple path param separated by url parts with type', () => {
    const sourceString = `
POST /endpoint/:entryType:a/api/v2/:entryType2:b/name
    => ResponseModel
`;

    const expectedAST: ASTNode = {
      kind: ASTNodeKind.DOCUMENT,
      definitions: [
        {
          kind: ASTNodeKind.ENDPOINT_NAMESPACE_TYPE_DEFINITION,
          endpoints: [
            {
              kind: ASTNodeKind.ENDPOINT_TYPE_DEFINITION,
              verb: {
                kind: ASTNodeKind.ENDPOINT_VERB,
                name: { kind: ASTNodeKind.NAME, value: 'POST' },
              },
              url: {
                kind: ASTNodeKind.ENDPOINT_URL,
                name: {
                  kind: ASTNodeKind.NAME,
                  value: '/endpoint/:entryType:a/api/v2/:entryType2:b/name',
                },
                parameters: [
                  {
                    kind: ASTNodeKind.ENDPOINT_PARAMETER,
                    type: {
                      kind: ASTNodeKind.ENDPOINT_PARAMETER_PATH,
                      name: { kind: ASTNodeKind.NAME, value: 'entryType' },
                      type: {
                        kind: ASTNodeKind.ENDPOINT_PARAMETER_PATH_TYPE,
                        name: { kind: ASTNodeKind.NAME, value: 'a' },
                      },
                    },
                  },
                  {
                    kind: ASTNodeKind.ENDPOINT_PARAMETER,
                    type: {
                      kind: ASTNodeKind.ENDPOINT_PARAMETER_PATH,
                      name: { kind: ASTNodeKind.NAME, value: 'entryType2' },
                      type: {
                        kind: ASTNodeKind.ENDPOINT_PARAMETER_PATH_TYPE,
                        name: { kind: ASTNodeKind.NAME, value: 'b' },
                      },
                    },
                  },
                ],
              },
              responses: [
                {
                  kind: ASTNodeKind.ENDPOINT_RESPONSE,
                  type: {
                    kind: ASTNodeKind.NAMED_TYPE,
                    name: {
                      kind: ASTNodeKind.NAME,
                      value: 'ResponseModel',
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const source = new Source({
      body: sourceString,
      name: 'Endpoints code',
      locationOffset: { line: 1, column: 1 },
      sourceType: 'endpoints',
    });

    const ast = parse(source);

    expect(toJSONDeep(ast)).toEqual(expectedAST);
  });
  it('can parse endpoint with multiple path param separated by url parts with type and query and request model', () => {
    const sourceString = `
POST /endpoint/:entryType:a/api/v2/:entryType2:b/name?RequestQuery RequestModel
    => ResponseModel
`;

    const expectedAST: ASTNode = {
      kind: ASTNodeKind.DOCUMENT,
      definitions: [
        {
          kind: ASTNodeKind.ENDPOINT_NAMESPACE_TYPE_DEFINITION,
          endpoints: [
            {
              kind: ASTNodeKind.ENDPOINT_TYPE_DEFINITION,
              verb: {
                kind: ASTNodeKind.ENDPOINT_VERB,
                name: { kind: ASTNodeKind.NAME, value: 'POST' },
              },
              url: {
                kind: ASTNodeKind.ENDPOINT_URL,
                name: {
                  kind: ASTNodeKind.NAME,
                  value: '/endpoint/:entryType:a/api/v2/:entryType2:b/name',
                },
                parameters: [
                  {
                    kind: ASTNodeKind.ENDPOINT_PARAMETER,
                    type: {
                      kind: ASTNodeKind.ENDPOINT_PARAMETER_BODY,
                      type: {
                        kind: ASTNodeKind.NAMED_TYPE,
                        name: { kind: ASTNodeKind.NAME, value: 'RequestModel' },
                      },
                    },
                  },
                  {
                    kind: ASTNodeKind.ENDPOINT_PARAMETER,
                    type: {
                      kind: ASTNodeKind.ENDPOINT_PARAMETER_QUERY,
                      name: { kind: ASTNodeKind.NAME, value: 'RequestQuery' },
                    },
                  },
                  {
                    kind: ASTNodeKind.ENDPOINT_PARAMETER,
                    type: {
                      kind: ASTNodeKind.ENDPOINT_PARAMETER_PATH,
                      name: { kind: ASTNodeKind.NAME, value: 'entryType' },
                      type: {
                        kind: ASTNodeKind.ENDPOINT_PARAMETER_PATH_TYPE,
                        name: { kind: ASTNodeKind.NAME, value: 'a' },
                      },
                    },
                  },
                  {
                    kind: ASTNodeKind.ENDPOINT_PARAMETER,
                    type: {
                      kind: ASTNodeKind.ENDPOINT_PARAMETER_PATH,
                      name: { kind: ASTNodeKind.NAME, value: 'entryType2' },
                      type: {
                        kind: ASTNodeKind.ENDPOINT_PARAMETER_PATH_TYPE,
                        name: { kind: ASTNodeKind.NAME, value: 'b' },
                      },
                    },
                  },
                ],
              },
              responses: [
                {
                  kind: ASTNodeKind.ENDPOINT_RESPONSE,
                  type: {
                    kind: ASTNodeKind.NAMED_TYPE,
                    name: {
                      kind: ASTNodeKind.NAME,
                      value: 'ResponseModel',
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const source = new Source({
      body: sourceString,
      name: 'Endpoints code',
      locationOffset: { line: 1, column: 1 },
      sourceType: 'endpoints',
    });

    const ast = parse(source);

    expect(toJSONDeep(ast)).toEqual(expectedAST);
  });
});
