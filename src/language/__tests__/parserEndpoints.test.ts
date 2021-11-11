import { ASTNode, ASTNodeKind, parse as defaultParse, Source } from '../../language';
import { toJSONDeep } from '../../utils';

const parse = (source: string | Source) => defaultParse(source, { noLocation: true });

describe(__filename, () => {
  describe('endpoints', () => {
    it('can parse basic endpoint with no response', () => {
      const sourceString = `
POST /endpoint RequestModel
POST /endpoint2 RequestModel2
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
                  ],
                },
                responses: [],
              },
            ],
          },
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
                  name: { kind: ASTNodeKind.NAME, value: '/endpoint2' },
                  parameters: [
                    {
                      kind: ASTNodeKind.ENDPOINT_PARAMETER,
                      type: {
                        kind: ASTNodeKind.ENDPOINT_PARAMETER_BODY,
                        type: {
                          kind: ASTNodeKind.NAMED_TYPE,
                          name: { kind: ASTNodeKind.NAME, value: 'RequestModel2' },
                        },
                      },
                    },
                  ],
                },
                responses: [],
              },
            ],
          },
        ],
      };

      const source = new Source({
        body: sourceString,
        sourceType: 'endpoints',
      });

      const ast = parse(source);

      expect(toJSONDeep(ast)).toEqual(expectedAST);
    });
    it('can parse basic endpoint', () => {
      const sourceString = `
POST /endpoint RequestModel
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
                  ],
                },
                responses: [
                  {
                    status: {
                      kind: ASTNodeKind.ENDPOINT_STATUS_CODE,
                      name: {
                        kind: ASTNodeKind.NAME,
                        value: '200',
                      },
                    },
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
        sourceType: 'endpoints',
      });

      const ast = parse(source);

      expect(toJSONDeep(ast)).toEqual(expectedAST);
    });

    it('can parse basic endpoint without request', () => {
      const sourceString = `
GET /endpoint
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
                  name: { kind: ASTNodeKind.NAME, value: 'GET' },
                },
                url: {
                  kind: ASTNodeKind.ENDPOINT_URL,
                  name: { kind: ASTNodeKind.NAME, value: '/endpoint' },
                  parameters: [],
                },
                responses: [
                  {
                    status: {
                      kind: ASTNodeKind.ENDPOINT_STATUS_CODE,
                      name: {
                        kind: ASTNodeKind.NAME,
                        value: '200',
                      },
                    },
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
        sourceType: 'endpoints',
      });

      const ast = parse(source);

      expect(toJSONDeep(ast)).toEqual(expectedAST);
    });

    it('can parse combination of endpoints', () => {
      const sourceString = `
POST /tickets/return_agent_tickets_to_group/:agentId

GET /tickets/:id:i/extended
  => TicketsExtendedResponse
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
                    value: '/tickets/return_agent_tickets_to_group/:agentId',
                  },
                  parameters: [
                    {
                      kind: ASTNodeKind.ENDPOINT_PARAMETER,
                      type: {
                        kind: ASTNodeKind.ENDPOINT_PARAMETER_PATH,
                        type: { kind: ASTNodeKind.ENDPOINT_PARAMETER_PATH_TYPE },
                        name: { kind: ASTNodeKind.NAME, value: 'agentId' },
                      },
                    },
                  ],
                },
                responses: [],
              },
            ],
          },

          {
            kind: ASTNodeKind.ENDPOINT_NAMESPACE_TYPE_DEFINITION,
            endpoints: [
              {
                kind: ASTNodeKind.ENDPOINT_TYPE_DEFINITION,
                verb: {
                  kind: ASTNodeKind.ENDPOINT_VERB,
                  name: { kind: ASTNodeKind.NAME, value: 'GET' },
                },
                url: {
                  kind: ASTNodeKind.ENDPOINT_URL,
                  name: { kind: ASTNodeKind.NAME, value: '/tickets/:id:i/extended' },
                  parameters: [
                    {
                      kind: ASTNodeKind.ENDPOINT_PARAMETER,
                      type: {
                        kind: ASTNodeKind.ENDPOINT_PARAMETER_PATH,
                        type: {
                          kind: ASTNodeKind.ENDPOINT_PARAMETER_PATH_TYPE,
                          name: { kind: ASTNodeKind.NAME, value: 'i' },
                        },
                        name: { kind: ASTNodeKind.NAME, value: 'id' },
                      },
                    },
                  ],
                },
                responses: [
                  {
                    kind: ASTNodeKind.ENDPOINT_RESPONSE,
                    type: {
                      kind: ASTNodeKind.NAMED_TYPE,
                      name: { kind: ASTNodeKind.NAME, value: 'TicketsExtendedResponse' },
                    },
                    status: {
                      kind: ASTNodeKind.ENDPOINT_STATUS_CODE,
                      name: { kind: ASTNodeKind.NAME, value: '200' },
                    },
                    description: undefined,
                  },
                ],
              },
            ],
          },
        ],
      };

      const source = new Source({
        body: sourceString,
        sourceType: 'endpoints',
      });

      const ast = parse(source);

      expect(toJSONDeep(ast)).toMatchObject(expectedAST);
    });

    it('can parse basic endpoint with empty inline model in request', () => {
      const sourceString = `
POST /endpoint {}
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
                          strict: false,
                          kind: ASTNodeKind.OBJECT_TYPE_DEFINITION,
                          fields: [],
                        },
                      },
                    },
                  ],
                },
                responses: [
                  {
                    status: {
                      kind: ASTNodeKind.ENDPOINT_STATUS_CODE,
                      name: {
                        kind: ASTNodeKind.NAME,
                        value: '200',
                      },
                    },
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
        sourceType: 'endpoints',
      });

      const ast = parse(source);

      expect(toJSONDeep(ast)).toEqual(expectedAST);
    });

    it('can parse basic endpoint with non empty inline model in request', () => {
      const sourceString = `
POST /endpoint {name: s, surname}
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
                          strict: false,
                          kind: ASTNodeKind.OBJECT_TYPE_DEFINITION,
                          fields: [
                            {
                              omitted: false,
                              optional: false,
                              kind: ASTNodeKind.FIELD_DEFINITION,
                              name: {
                                kind: ASTNodeKind.NAME,
                                value: 'name',
                              },
                              type: {
                                kind: ASTNodeKind.NAMED_TYPE,
                                name: {
                                  kind: ASTNodeKind.NAME,
                                  value: 's',
                                },
                              },
                            },
                            {
                              omitted: false,
                              optional: false,
                              kind: ASTNodeKind.FIELD_DEFINITION,
                              name: {
                                kind: ASTNodeKind.NAME,
                                value: 'surname',
                              },
                              type: {
                                kind: ASTNodeKind.NAMED_TYPE,
                                name: {
                                  kind: ASTNodeKind.NAME,
                                  value: undefined,
                                },
                              },
                            },
                          ],
                        },
                      },
                    },
                  ],
                },
                responses: [
                  {
                    status: {
                      kind: ASTNodeKind.ENDPOINT_STATUS_CODE,
                      name: {
                        kind: ASTNodeKind.NAME,
                        value: '200',
                      },
                    },
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
        sourceType: 'endpoints',
      });

      const ast = parse(source);

      expect(toJSONDeep(ast)).toEqual(expectedAST);
    });

    it('can parse basic endpoint with inline enum in request', () => {
      const sourceString = `
POST /endpoint (f | b |)
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
                          kind: ASTNodeKind.ENUM_INLINE_TYPE_DEFINITION,
                          values: [
                            {
                              kind: ASTNodeKind.ENUM_VALUE_DEFINITION,
                              name: {
                                kind: ASTNodeKind.NAME,
                                value: 'f',
                              },
                            },
                            {
                              kind: ASTNodeKind.ENUM_VALUE_DEFINITION,
                              name: {
                                kind: ASTNodeKind.NAME,
                                value: 'b',
                              },
                            },
                          ],
                        },
                      },
                    },
                  ],
                },
                responses: [
                  {
                    status: {
                      kind: ASTNodeKind.ENDPOINT_STATUS_CODE,
                      name: {
                        kind: ASTNodeKind.NAME,
                        value: '200',
                      },
                    },
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
        sourceType: 'endpoints',
      });

      const ast = parse(source);

      expect(toJSONDeep(ast)).toEqual(expectedAST);
    });

    it('can parse basic endpoint with empty model in response', () => {
      const sourceString = `
POST /endpoint RequestModel
    => {}
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
                  ],
                },
                responses: [
                  {
                    status: {
                      kind: ASTNodeKind.ENDPOINT_STATUS_CODE,
                      name: {
                        kind: ASTNodeKind.NAME,
                        value: '200',
                      },
                    },
                    kind: ASTNodeKind.ENDPOINT_RESPONSE,
                    type: {
                      strict: false,
                      kind: ASTNodeKind.OBJECT_TYPE_DEFINITION,
                      fields: [],
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
        sourceType: 'endpoints',
      });

      const ast = parse(source);

      expect(toJSONDeep(ast)).toEqual(expectedAST);
    });

    it('can parse basic endpoint with non empty model in response', () => {
      const sourceString = `
POST /endpoint RequestModel
    => {name: s, surname}
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
                  ],
                },
                responses: [
                  {
                    status: {
                      kind: ASTNodeKind.ENDPOINT_STATUS_CODE,
                      name: {
                        kind: ASTNodeKind.NAME,
                        value: '200',
                      },
                    },
                    kind: ASTNodeKind.ENDPOINT_RESPONSE,
                    type: {
                      strict: false,
                      kind: ASTNodeKind.OBJECT_TYPE_DEFINITION,
                      fields: [
                        {
                          omitted: false,
                          optional: false,
                          kind: ASTNodeKind.FIELD_DEFINITION,
                          name: {
                            kind: ASTNodeKind.NAME,
                            value: 'name',
                          },
                          type: {
                            kind: ASTNodeKind.NAMED_TYPE,
                            name: {
                              kind: ASTNodeKind.NAME,
                              value: 's',
                            },
                          },
                        },
                        {
                          omitted: false,
                          optional: false,
                          kind: ASTNodeKind.FIELD_DEFINITION,
                          name: {
                            kind: ASTNodeKind.NAME,
                            value: 'surname',
                          },
                          type: {
                            kind: ASTNodeKind.NAMED_TYPE,
                            name: {
                              kind: ASTNodeKind.NAME,
                              value: undefined,
                            },
                          },
                        },
                      ],
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
        sourceType: 'endpoints',
      });

      const ast = parse(source);

      expect(toJSONDeep(ast)).toEqual(expectedAST);
    });

    it('can parse basic endpoint with inline enum in response', () => {
      const sourceString = `
POST /endpoint RequestModel
    => (f | b )
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
                  ],
                },
                responses: [
                  {
                    status: {
                      kind: ASTNodeKind.ENDPOINT_STATUS_CODE,
                      name: {
                        kind: ASTNodeKind.NAME,
                        value: '200',
                      },
                    },
                    kind: ASTNodeKind.ENDPOINT_RESPONSE,
                    type: {
                      kind: ASTNodeKind.ENUM_INLINE_TYPE_DEFINITION,
                      values: [
                        {
                          kind: ASTNodeKind.ENUM_VALUE_DEFINITION,
                          name: {
                            kind: ASTNodeKind.NAME,
                            value: 'f',
                          },
                        },
                        {
                          kind: ASTNodeKind.ENUM_VALUE_DEFINITION,
                          name: {
                            kind: ASTNodeKind.NAME,
                            value: 'b',
                          },
                        },
                      ],
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
        sourceType: 'endpoints',
      });

      const ast = parse(source);

      expect(toJSONDeep(ast)).toEqual(expectedAST);
    });

    it('can parse basic endpoint with status code', () => {
      const sourceString = `
POST /endpoint RequestModel
    => 204
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
                  ],
                },
                responses: [
                  {
                    kind: ASTNodeKind.ENDPOINT_RESPONSE,
                    status: {
                      kind: ASTNodeKind.ENDPOINT_STATUS_CODE,
                      name: {
                        kind: ASTNodeKind.NAME,
                        value: '204',
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
        sourceType: 'endpoints',
      });

      const ast = parse(source);

      expect(toJSONDeep(ast)).toEqual(expectedAST);
    });

    it('can parse basic endpoint with @token', () => {
      const sourceString = `
@token POST /endpoint RequestModel
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
                securityDefinition: {
                  kind: ASTNodeKind.ENDPOINT_SECURITY_DEFINITION,
                  name: { kind: ASTNodeKind.NAME, value: 'token' },
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
                  ],
                },
                responses: [
                  {
                    status: {
                      kind: ASTNodeKind.ENDPOINT_STATUS_CODE,
                      name: {
                        kind: ASTNodeKind.NAME,
                        value: '200',
                      },
                    },
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
        sourceType: 'endpoints',
      });

      const ast = parse(source);

      expect(toJSONDeep(ast)).toEqual(expectedAST);
    });

    it('can parse basic endpoint with multiple returns', () => {
      const sourceString = `
@token POST /endpoint RequestModel
    => ResponseModel
    => 204
    => {}
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
                securityDefinition: {
                  kind: ASTNodeKind.ENDPOINT_SECURITY_DEFINITION,
                  name: { kind: ASTNodeKind.NAME, value: 'token' },
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
                    status: {
                      kind: ASTNodeKind.ENDPOINT_STATUS_CODE,
                      name: {
                        kind: ASTNodeKind.NAME,
                        value: '200',
                      },
                    },
                  },
                  {
                    kind: ASTNodeKind.ENDPOINT_RESPONSE,
                    status: {
                      kind: ASTNodeKind.ENDPOINT_STATUS_CODE,
                      name: {
                        kind: ASTNodeKind.NAME,
                        value: '204',
                      },
                    },
                  },
                  {
                    status: {
                      kind: ASTNodeKind.ENDPOINT_STATUS_CODE,
                      name: {
                        kind: ASTNodeKind.NAME,
                        value: '200',
                      },
                    },
                    kind: ASTNodeKind.ENDPOINT_RESPONSE,
                    type: {
                      strict: false,
                      kind: ASTNodeKind.OBJECT_TYPE_DEFINITION,
                      fields: [],
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
        sourceType: 'endpoints',
      });

      const ast = parse(source);

      expect(toJSONDeep(ast)).toEqual(expectedAST);
    });

    it('can parse basic endpoint inside namespace', () => {
      const sourceString = `
\`/analytics_events\`:
    POST /endpoint RequestModel
        => ResponseModel
`;
      const expectedAST: ASTNode = {
        kind: ASTNodeKind.DOCUMENT,
        definitions: [
          {
            kind: ASTNodeKind.ENDPOINT_NAMESPACE_TYPE_DEFINITION,
            tag: { kind: ASTNodeKind.NAME, value: '/analytics_events' },
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
                  ],
                },
                responses: [
                  {
                    status: {
                      kind: ASTNodeKind.ENDPOINT_STATUS_CODE,
                      name: {
                        kind: ASTNodeKind.NAME,
                        value: '200',
                      },
                    },
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
        sourceType: 'endpoints',
      });

      const ast = parse(source);

      expect(toJSONDeep(ast)).toEqual(expectedAST);
    });

    it('can parse basic endpoint inside namespace with multiple endpoints', () => {
      const sourceString = `
\`/analytics_events\`:
    POST /endpoint RequestModel
        => ResponseModel

    GET /endpoint
        => ResponseModel
`;
      const expectedAST: ASTNode = {
        kind: ASTNodeKind.DOCUMENT,
        definitions: [
          {
            kind: ASTNodeKind.ENDPOINT_NAMESPACE_TYPE_DEFINITION,
            tag: { kind: ASTNodeKind.NAME, value: '/analytics_events' },
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
                  ],
                },
                responses: [
                  {
                    status: {
                      kind: ASTNodeKind.ENDPOINT_STATUS_CODE,
                      name: {
                        kind: ASTNodeKind.NAME,
                        value: '200',
                      },
                    },
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
              {
                kind: ASTNodeKind.ENDPOINT_TYPE_DEFINITION,
                verb: {
                  kind: ASTNodeKind.ENDPOINT_VERB,
                  name: { kind: ASTNodeKind.NAME, value: 'GET' },
                },
                url: {
                  kind: ASTNodeKind.ENDPOINT_URL,
                  name: { kind: ASTNodeKind.NAME, value: '/endpoint' },
                  parameters: [],
                },
                responses: [
                  {
                    status: {
                      kind: ASTNodeKind.ENDPOINT_STATUS_CODE,
                      name: {
                        kind: ASTNodeKind.NAME,
                        value: '200',
                      },
                    },
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
        sourceType: 'endpoints',
      });

      const ast = parse(source);

      expect(toJSONDeep(ast)).toEqual(expectedAST);
    });

    it('can parse multiple namespaces', () => {
      const sourceString = `
\`/analytics_events\`:
    POST /endpoint RequestModel
        => ResponseModel

\`/conversations\`:
    HEAD /pechkin/mandrill/event
        => {}
`;
      const expectedAST: ASTNode = {
        kind: ASTNodeKind.DOCUMENT,
        definitions: [
          {
            kind: ASTNodeKind.ENDPOINT_NAMESPACE_TYPE_DEFINITION,
            tag: { kind: ASTNodeKind.NAME, value: '/analytics_events' },
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
                  ],
                },
                responses: [
                  {
                    status: {
                      kind: ASTNodeKind.ENDPOINT_STATUS_CODE,
                      name: {
                        kind: ASTNodeKind.NAME,
                        value: '200',
                      },
                    },
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
          {
            kind: ASTNodeKind.ENDPOINT_NAMESPACE_TYPE_DEFINITION,
            tag: { kind: ASTNodeKind.NAME, value: '/conversations' },
            endpoints: [
              {
                kind: ASTNodeKind.ENDPOINT_TYPE_DEFINITION,
                verb: {
                  kind: ASTNodeKind.ENDPOINT_VERB,
                  name: { kind: ASTNodeKind.NAME, value: 'HEAD' },
                },
                url: {
                  kind: ASTNodeKind.ENDPOINT_URL,
                  name: { kind: ASTNodeKind.NAME, value: '/pechkin/mandrill/event' },
                  parameters: [],
                },
                responses: [
                  {
                    status: {
                      kind: ASTNodeKind.ENDPOINT_STATUS_CODE,
                      name: {
                        kind: ASTNodeKind.NAME,
                        value: '200',
                      },
                    },
                    kind: ASTNodeKind.ENDPOINT_RESPONSE,
                    type: {
                      strict: false,
                      kind: ASTNodeKind.OBJECT_TYPE_DEFINITION,
                      fields: [],
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
        sourceType: 'endpoints',
      });

      const ast = parse(source);

      expect(toJSONDeep(ast)).toEqual(expectedAST);
    });

    it('can parse multiple namespaces without tag', () => {
      const sourceString = `
\`/analytics_events\`:
    POST /endpoint RequestModel
        => ResponseModel
  
HEAD /pechkin/mandrill/event
    => {}
`;
      const expectedAST: ASTNode = {
        kind: ASTNodeKind.DOCUMENT,
        definitions: [
          {
            kind: ASTNodeKind.ENDPOINT_NAMESPACE_TYPE_DEFINITION,
            tag: { kind: ASTNodeKind.NAME, value: '/analytics_events' },
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
                  ],
                },
                responses: [
                  {
                    status: {
                      kind: ASTNodeKind.ENDPOINT_STATUS_CODE,
                      name: {
                        kind: ASTNodeKind.NAME,
                        value: '200',
                      },
                    },
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
          {
            kind: ASTNodeKind.ENDPOINT_NAMESPACE_TYPE_DEFINITION,
            endpoints: [
              {
                kind: ASTNodeKind.ENDPOINT_TYPE_DEFINITION,
                verb: {
                  kind: ASTNodeKind.ENDPOINT_VERB,
                  name: { kind: ASTNodeKind.NAME, value: 'HEAD' },
                },
                url: {
                  kind: ASTNodeKind.ENDPOINT_URL,
                  name: { kind: ASTNodeKind.NAME, value: '/pechkin/mandrill/event' },
                  parameters: [],
                },
                responses: [
                  {
                    status: {
                      kind: ASTNodeKind.ENDPOINT_STATUS_CODE,
                      name: {
                        kind: ASTNodeKind.NAME,
                        value: '200',
                      },
                    },
                    kind: ASTNodeKind.ENDPOINT_RESPONSE,
                    type: {
                      strict: false,
                      kind: ASTNodeKind.OBJECT_TYPE_DEFINITION,
                      fields: [],
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
        sourceType: 'endpoints',
      });

      const ast = parse(source);

      expect(toJSONDeep(ast)).toEqual(expectedAST);
    });

    it('can parse basic endpoint with multiline description', () => {
      const sourceString = `
// lol
// kek
POST /endpoint RequestModel
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
                description: { kind: ASTNodeKind.DESCRIPTION, value: 'lol\nkek' },
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
                  ],
                },
                responses: [
                  {
                    status: {
                      kind: ASTNodeKind.ENDPOINT_STATUS_CODE,
                      name: {
                        kind: ASTNodeKind.NAME,
                        value: '200',
                      },
                    },
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
        sourceType: 'endpoints',
      });

      const ast = parse(source);

      expect(toJSONDeep(ast)).toEqual(expectedAST);
    });
    it('can parse basic endpoint with description', () => {
      const sourceString = `
// lol
POST /endpoint RequestModel
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
                description: { kind: ASTNodeKind.DESCRIPTION, value: 'lol' },
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
                  ],
                },
                responses: [
                  {
                    status: {
                      kind: ASTNodeKind.ENDPOINT_STATUS_CODE,
                      name: {
                        kind: ASTNodeKind.NAME,
                        value: '200',
                      },
                    },
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
        sourceType: 'endpoints',
      });

      const ast = parse(source);

      expect(toJSONDeep(ast)).toEqual(expectedAST);
    });
    it('can parse descriptions for endpoint inside tag', () => {
      const sourceString = `
\`/analytics_events\`:
    // kek
    POST /endpoint RequestModel
        => ResponseModel
  
\`/conversations\`:
    // lol
    // kek
    HEAD /pechkin/mandrill/event
        => {}
`;
      const expectedAST: ASTNode = {
        kind: ASTNodeKind.DOCUMENT,
        definitions: [
          {
            kind: ASTNodeKind.ENDPOINT_NAMESPACE_TYPE_DEFINITION,
            tag: { kind: ASTNodeKind.NAME, value: '/analytics_events' },
            endpoints: [
              {
                kind: ASTNodeKind.ENDPOINT_TYPE_DEFINITION,
                verb: {
                  kind: ASTNodeKind.ENDPOINT_VERB,
                  name: { kind: ASTNodeKind.NAME, value: 'POST' },
                },
                description: { kind: ASTNodeKind.DESCRIPTION, value: 'kek' },
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
                  ],
                },
                responses: [
                  {
                    status: {
                      kind: ASTNodeKind.ENDPOINT_STATUS_CODE,
                      name: {
                        kind: ASTNodeKind.NAME,
                        value: '200',
                      },
                    },
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
          {
            kind: ASTNodeKind.ENDPOINT_NAMESPACE_TYPE_DEFINITION,
            tag: { kind: ASTNodeKind.NAME, value: '/conversations' },
            endpoints: [
              {
                kind: ASTNodeKind.ENDPOINT_TYPE_DEFINITION,
                verb: {
                  kind: ASTNodeKind.ENDPOINT_VERB,
                  name: { kind: ASTNodeKind.NAME, value: 'HEAD' },
                },
                url: {
                  kind: ASTNodeKind.ENDPOINT_URL,
                  name: { kind: ASTNodeKind.NAME, value: '/pechkin/mandrill/event' },
                  parameters: [],
                },
                description: { kind: ASTNodeKind.DESCRIPTION, value: 'lol\nkek' },
                responses: [
                  {
                    status: {
                      kind: ASTNodeKind.ENDPOINT_STATUS_CODE,
                      name: {
                        kind: ASTNodeKind.NAME,
                        value: '200',
                      },
                    },
                    kind: ASTNodeKind.ENDPOINT_RESPONSE,
                    type: {
                      strict: false,
                      kind: ASTNodeKind.OBJECT_TYPE_DEFINITION,
                      fields: [],
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
        sourceType: 'endpoints',
      });

      const ast = parse(source);

      expect(toJSONDeep(ast)).toEqual(expectedAST);
    });
    it('can parse response descriptions', () => {
      const sourceString = `
\`/analytics_events\`:
    // kek
    POST /endpoint RequestModel
        // lol
        => ResponseModel
`;
      const expectedAST: ASTNode = {
        kind: ASTNodeKind.DOCUMENT,
        definitions: [
          {
            kind: ASTNodeKind.ENDPOINT_NAMESPACE_TYPE_DEFINITION,
            tag: { kind: ASTNodeKind.NAME, value: '/analytics_events' },
            endpoints: [
              {
                kind: ASTNodeKind.ENDPOINT_TYPE_DEFINITION,
                verb: {
                  kind: ASTNodeKind.ENDPOINT_VERB,
                  name: { kind: ASTNodeKind.NAME, value: 'POST' },
                },
                description: { kind: ASTNodeKind.DESCRIPTION, value: 'kek' },
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
                  ],
                },
                responses: [
                  {
                    status: {
                      kind: ASTNodeKind.ENDPOINT_STATUS_CODE,
                      name: {
                        kind: ASTNodeKind.NAME,
                        value: '200',
                      },
                    },
                    kind: ASTNodeKind.ENDPOINT_RESPONSE,
                    type: {
                      kind: ASTNodeKind.NAMED_TYPE,
                      name: {
                        kind: ASTNodeKind.NAME,
                        value: 'ResponseModel',
                      },
                    },
                    description: { kind: ASTNodeKind.DESCRIPTION, value: 'lol' },
                  },
                ],
              },
            ],
          },
        ],
      };

      const source = new Source({
        body: sourceString,
        sourceType: 'endpoints',
      });

      const ast = parse(source);

      expect(toJSONDeep(ast)).toEqual(expectedAST);
    });
  });

  it('can parse endpoint that return status and model', () => {
    const sourceString = `
\`/analytics_events\`:
  POST /endpoint RequestModel
      => 422 ResponseModel
`;
    const expectedAST: ASTNode = {
      kind: ASTNodeKind.DOCUMENT,
      definitions: [
        {
          kind: ASTNodeKind.ENDPOINT_NAMESPACE_TYPE_DEFINITION,
          tag: { kind: ASTNodeKind.NAME, value: '/analytics_events' },
          endpoints: [
            {
              kind: ASTNodeKind.ENDPOINT_TYPE_DEFINITION,
              verb: {
                kind: ASTNodeKind.ENDPOINT_VERB,
                name: { kind: ASTNodeKind.NAME, value: 'POST' },
              },
              description: undefined,
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
                ],
              },
              responses: [
                {
                  kind: ASTNodeKind.ENDPOINT_RESPONSE,
                  status: {
                    kind: ASTNodeKind.ENDPOINT_STATUS_CODE,
                    name: {
                      kind: ASTNodeKind.NAME,
                      value: '422',
                    },
                  },
                  type: {
                    kind: ASTNodeKind.NAMED_TYPE,
                    name: {
                      kind: ASTNodeKind.NAME,
                      value: 'ResponseModel',
                    },
                  },
                  description: undefined,
                },
              ],
            },
          ],
        },
      ],
    };

    const source = new Source({
      body: sourceString,
      sourceType: 'endpoints',
    });

    const ast = parse(source);

    expect(toJSONDeep(ast)).toEqual(expectedAST);
  });
});
