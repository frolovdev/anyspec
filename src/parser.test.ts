import { ASTNodeKind } from './ast';
import { AnySpecError } from './error/AnySpecError';
import { parse } from './parser';
import { toJSONDeep, log } from './utils';

describe(__filename, () => {
  describe('model', () => {
    it('throws an error when parse oneline description without model', () => {
      const description = `
          // лул
        `;

      const ast = () => parse(description);
      expect(ast).toThrowError(AnySpecError);
    });

    it('throws an error when parse multiline description without model', () => {
      const description = `
          // лул
          // kek
        `;

      const ast = () => parse(description);
      expect(ast).toThrowError(AnySpecError);
    });

    it('correctly parse empty model with description', () => {
      const model = `
          // лул
          // kek
          AcDocument {}
        `;

      const ast = parse(model);

      expect(toJSONDeep(ast)).toEqual({
        kind: ASTNodeKind.DOCUMENT,
        definitions: [
          {
            fields: [],
            name: {
              kind: ASTNodeKind.NAME,
              value: 'AcDocument',
            },
            kind: ASTNodeKind.MODEL_TYPE_DEFINITION,
            strict: false,
            description: { kind: ASTNodeKind.MODEL_DESCRIPTION, value: 'лул\nkek' },
            extendsModels: [],
          },
        ],
      });
    });

    it('correctly parse empty model without description', () => {
      const model = `
          AcDocument {}
        `;

      const ast = parse(model);
      expect(toJSONDeep(ast)).toEqual({
        kind: ASTNodeKind.DOCUMENT,
        definitions: [
          {
            fields: [],
            name: {
              kind: ASTNodeKind.NAME,
              value: 'AcDocument',
            },
            strict: false,
            kind: ASTNodeKind.MODEL_TYPE_DEFINITION,
            description: undefined,
            extendsModels: [],
          },
        ],
      });
    });

    it('correctly parse model fields', () => {
      const model = `
          AcDocument {
            name
          }
        `;

      const ast = parse(model);
      expect(toJSONDeep(ast)).toEqual({
        kind: ASTNodeKind.DOCUMENT,
        definitions: [
          {
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
                    value: undefined,
                  },
                },
              },
            ],
            name: {
              kind: ASTNodeKind.NAME,
              value: 'AcDocument',
            },
            strict: false,
            kind: ASTNodeKind.MODEL_TYPE_DEFINITION,
            description: undefined,
            extendsModels: [],
          },
        ],
      });
    });

    it('correctly parse model fields with trailing comma', () => {
      const model = `
          AcDocument {
            name,
            surname,
          }
        `;

      // surname,
      const ast = parse(model);
      expect(toJSONDeep(ast)).toEqual({
        kind: ASTNodeKind.DOCUMENT,
        definitions: [
          {
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
                    value: undefined,
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
            name: {
              kind: ASTNodeKind.NAME,
              value: 'AcDocument',
            },
            strict: false,
            kind: ASTNodeKind.MODEL_TYPE_DEFINITION,
            description: undefined,
            extendsModels: [],
          },
        ],
      });
    });

    it('correctly parse model fields with s', () => {
      const model = `
          AcDocument {
            name: s,
            surname,
          }
        `;

      const ast = parse(model);
      expect(toJSONDeep(ast)).toEqual({
        kind: ASTNodeKind.DOCUMENT,
        definitions: [
          {
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
            name: {
              kind: ASTNodeKind.NAME,
              value: 'AcDocument',
            },
            strict: false,
            kind: ASTNodeKind.MODEL_TYPE_DEFINITION,
            description: undefined,
            extendsModels: [],
          },
        ],
      });
    });

    it('correctly parse optional model fields', () => {
      const model = `
          AcDocument {
            name?: s,
            surname,
          }
        `;

      const ast = parse(model);

      expect(toJSONDeep(ast)).toEqual({
        kind: ASTNodeKind.DOCUMENT,
        definitions: [
          {
            fields: [
              {
                omitted: false,
                optional: true,
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
            name: {
              kind: ASTNodeKind.NAME,
              value: 'AcDocument',
            },
            strict: false,
            kind: ASTNodeKind.MODEL_TYPE_DEFINITION,
            description: undefined,
            extendsModels: [],
          },
        ],
      });
    });

    it('correctly parse optional model fields without type', () => {
      const model = `
          AcDocument {
            name?,
            surname,
          }
        `;

      const ast = parse(model);
      expect(toJSONDeep(ast)).toEqual({
        kind: ASTNodeKind.DOCUMENT,
        definitions: [
          {
            fields: [
              {
                omitted: false,
                optional: true,
                kind: ASTNodeKind.FIELD_DEFINITION,
                name: {
                  kind: ASTNodeKind.NAME,
                  value: 'name',
                },
                type: {
                  kind: ASTNodeKind.NAMED_TYPE,
                  name: {
                    kind: ASTNodeKind.NAME,
                    value: undefined,
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
            name: {
              kind: ASTNodeKind.NAME,
              value: 'AcDocument',
            },
            strict: false,
            kind: ASTNodeKind.MODEL_TYPE_DEFINITION,
            description: undefined,
            extendsModels: [],
          },
        ],
      });
    });

    it('correctly parse field array type', () => {
      const model = `
          AcDocument {
            name?: s[],
            surname: b[],
          }
        `;

      const ast = parse(model);
      expect(toJSONDeep(ast)).toEqual({
        kind: ASTNodeKind.DOCUMENT,
        definitions: [
          {
            fields: [
              {
                omitted: false,
                optional: true,
                kind: ASTNodeKind.FIELD_DEFINITION,
                name: {
                  kind: ASTNodeKind.NAME,
                  value: 'name',
                },
                type: {
                  kind: ASTNodeKind.LIST_TYPE,
                  type: {
                    kind: ASTNodeKind.NAMED_TYPE,
                    name: {
                      kind: ASTNodeKind.NAME,
                      value: 's',
                    },
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
                  kind: ASTNodeKind.LIST_TYPE,
                  type: {
                    kind: ASTNodeKind.NAMED_TYPE,
                    name: {
                      kind: ASTNodeKind.NAME,
                      value: 'b',
                    },
                  },
                },
              },
            ],
            name: {
              kind: ASTNodeKind.NAME,
              value: 'AcDocument',
            },
            strict: false,
            kind: ASTNodeKind.MODEL_TYPE_DEFINITION,
            description: undefined,
            extendsModels: [],
          },
        ],
      });
    });

    it('correctly parse strict mode models', () => {
      const model = `
          AcDocument !{
            name?: s[],
            surname: b[],
          }
        `;

      const ast = parse(model);
      expect(toJSONDeep(ast)).toEqual({
        kind: ASTNodeKind.DOCUMENT,
        definitions: [
          {
            fields: [
              {
                omitted: false,
                optional: true,
                kind: ASTNodeKind.FIELD_DEFINITION,
                name: {
                  kind: ASTNodeKind.NAME,
                  value: 'name',
                },
                type: {
                  kind: ASTNodeKind.LIST_TYPE,
                  type: {
                    kind: ASTNodeKind.NAMED_TYPE,
                    name: {
                      kind: ASTNodeKind.NAME,
                      value: 's',
                    },
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
                  kind: ASTNodeKind.LIST_TYPE,
                  type: {
                    kind: ASTNodeKind.NAMED_TYPE,
                    name: {
                      kind: ASTNodeKind.NAME,
                      value: 'b',
                    },
                  },
                },
              },
            ],
            name: {
              kind: ASTNodeKind.NAME,
              value: 'AcDocument',
            },
            kind: ASTNodeKind.MODEL_TYPE_DEFINITION,
            strict: true,
            description: undefined,
            extendsModels: [],
          },
        ],
      });
    });

    it('correctly parse extends model', () => {
      const model = `
          AcDocument < Kek {
            name?: s[],
            surname: b[],
          }
        `;

      const ast = parse(model);
      expect(toJSONDeep(ast)).toEqual({
        kind: ASTNodeKind.DOCUMENT,
        definitions: [
          {
            fields: [
              {
                omitted: false,
                optional: true,
                kind: ASTNodeKind.FIELD_DEFINITION,
                name: {
                  kind: ASTNodeKind.NAME,
                  value: 'name',
                },
                type: {
                  kind: ASTNodeKind.LIST_TYPE,
                  type: {
                    kind: ASTNodeKind.NAMED_TYPE,
                    name: {
                      kind: ASTNodeKind.NAME,
                      value: 's',
                    },
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
                  kind: ASTNodeKind.LIST_TYPE,
                  type: {
                    kind: ASTNodeKind.NAMED_TYPE,
                    name: {
                      kind: ASTNodeKind.NAME,
                      value: 'b',
                    },
                  },
                },
              },
            ],
            name: {
              kind: ASTNodeKind.NAME,
              value: 'AcDocument',
            },
            extendsModels: [
              {
                kind: ASTNodeKind.NAMED_TYPE,
                name: { kind: ASTNodeKind.NAME, value: 'Kek' },
              },
            ],
            kind: ASTNodeKind.MODEL_TYPE_DEFINITION,
            strict: false,
            description: undefined,
          },
        ],
      });
    });

    it('correctly parse with extends model and strict model', () => {
      const model = `
      AcDocument < Kek !{
            name?: s[],
            surname: b[],
          }
        `;

      const ast = parse(model);
      expect(toJSONDeep(ast)).toEqual({
        kind: ASTNodeKind.DOCUMENT,
        definitions: [
          {
            fields: [
              {
                omitted: false,
                optional: true,
                kind: ASTNodeKind.FIELD_DEFINITION,
                name: {
                  kind: ASTNodeKind.NAME,
                  value: 'name',
                },
                type: {
                  kind: ASTNodeKind.LIST_TYPE,
                  type: {
                    kind: ASTNodeKind.NAMED_TYPE,
                    name: {
                      kind: ASTNodeKind.NAME,
                      value: 's',
                    },
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
                  kind: ASTNodeKind.LIST_TYPE,
                  type: {
                    kind: ASTNodeKind.NAMED_TYPE,
                    name: {
                      kind: ASTNodeKind.NAME,
                      value: 'b',
                    },
                  },
                },
              },
            ],
            name: {
              kind: ASTNodeKind.NAME,
              value: 'AcDocument',
            },
            extendsModels: [
              {
                kind: ASTNodeKind.NAMED_TYPE,
                name: { kind: ASTNodeKind.NAME, value: 'Kek' },
              },
            ],
            kind: ASTNodeKind.MODEL_TYPE_DEFINITION,
            strict: true,
            description: undefined,
          },
        ],
      });
    });

    it('correctly parse with multiple extends model and strict model', () => {
      const model = `
      AcDocument < Kek, Lel !{
            name?: s[],
            surname: b[],
          }
        `;

      const ast = parse(model);
      expect(toJSONDeep(ast)).toEqual({
        kind: ASTNodeKind.DOCUMENT,
        definitions: [
          {
            fields: [
              {
                omitted: false,
                optional: true,
                kind: ASTNodeKind.FIELD_DEFINITION,
                name: {
                  kind: ASTNodeKind.NAME,
                  value: 'name',
                },
                type: {
                  kind: ASTNodeKind.LIST_TYPE,
                  type: {
                    kind: ASTNodeKind.NAMED_TYPE,
                    name: {
                      kind: ASTNodeKind.NAME,
                      value: 's',
                    },
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
                  kind: ASTNodeKind.LIST_TYPE,
                  type: {
                    kind: ASTNodeKind.NAMED_TYPE,
                    name: {
                      kind: ASTNodeKind.NAME,
                      value: 'b',
                    },
                  },
                },
              },
            ],
            name: {
              kind: ASTNodeKind.NAME,
              value: 'AcDocument',
            },
            extendsModels: [
              {
                kind: ASTNodeKind.NAMED_TYPE,
                name: { kind: ASTNodeKind.NAME, value: 'Kek' },
              },
              {
                kind: ASTNodeKind.NAMED_TYPE,
                name: { kind: ASTNodeKind.NAME, value: 'Lel' },
              },
            ],
            kind: ASTNodeKind.MODEL_TYPE_DEFINITION,
            strict: true,
            description: undefined,
          },
        ],
      });
    });

    it('correctly parse models with - mark', () => {
      const model = `
      AcDocument < Kek, Lel !{
            -name?: s[],
            surname: b[],
          }
        `;

      const ast = parse(model);
      expect(toJSONDeep(ast)).toEqual({
        kind: ASTNodeKind.DOCUMENT,
        definitions: [
          {
            fields: [
              {
                omitted: true,
                optional: true,
                kind: ASTNodeKind.FIELD_DEFINITION,
                name: {
                  kind: ASTNodeKind.NAME,
                  value: 'name',
                },
                type: {
                  kind: ASTNodeKind.LIST_TYPE,
                  type: {
                    kind: ASTNodeKind.NAMED_TYPE,
                    name: {
                      kind: ASTNodeKind.NAME,
                      value: 's',
                    },
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
                  kind: ASTNodeKind.LIST_TYPE,
                  type: {
                    kind: ASTNodeKind.NAMED_TYPE,
                    name: {
                      kind: ASTNodeKind.NAME,
                      value: 'b',
                    },
                  },
                },
              },
            ],
            name: {
              kind: ASTNodeKind.NAME,
              value: 'AcDocument',
            },
            extendsModels: [
              {
                kind: ASTNodeKind.NAMED_TYPE,
                name: { kind: ASTNodeKind.NAME, value: 'Kek' },
              },
              {
                kind: ASTNodeKind.NAMED_TYPE,
                name: { kind: ASTNodeKind.NAME, value: 'Lel' },
              },
            ],
            kind: ASTNodeKind.MODEL_TYPE_DEFINITION,
            strict: true,
            description: undefined,
          },
        ],
      });
    });

    it('correctly parse model with inline enum', () => {
      const model = `
      AcDocument < Kek, Lel !{
            -name?: s[],
            type?: ( standard | service ),
            surname: b[],
          }
        `;

      const ast = parse(model);
      expect(toJSONDeep(ast)).toEqual({
        kind: ASTNodeKind.DOCUMENT,
        definitions: [
          {
            fields: [
              {
                omitted: true,
                optional: true,
                kind: ASTNodeKind.FIELD_DEFINITION,
                name: {
                  kind: ASTNodeKind.NAME,
                  value: 'name',
                },
                type: {
                  kind: ASTNodeKind.LIST_TYPE,
                  type: {
                    kind: ASTNodeKind.NAMED_TYPE,
                    name: {
                      kind: ASTNodeKind.NAME,
                      value: 's',
                    },
                  },
                },
              },
              {
                omitted: false,
                optional: true,
                kind: ASTNodeKind.FIELD_DEFINITION,
                name: {
                  kind: ASTNodeKind.NAME,
                  value: 'type',
                },
                type: {
                  kind: ASTNodeKind.ENUM_INLINE_TYPE_DEFINITION,
                  values: [
                    {
                      kind: ASTNodeKind.ENUM_VALUE_DEFINITION,
                      name: { kind: ASTNodeKind.NAME, value: 'standard' },
                    },
                    {
                      kind: ASTNodeKind.ENUM_VALUE_DEFINITION,
                      name: { kind: ASTNodeKind.NAME, value: 'service' },
                    },
                  ],
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
                  kind: ASTNodeKind.LIST_TYPE,
                  type: {
                    kind: ASTNodeKind.NAMED_TYPE,
                    name: {
                      kind: ASTNodeKind.NAME,
                      value: 'b',
                    },
                  },
                },
              },
            ],
            name: {
              kind: ASTNodeKind.NAME,
              value: 'AcDocument',
            },
            extendsModels: [
              {
                kind: ASTNodeKind.NAMED_TYPE,
                name: { kind: ASTNodeKind.NAME, value: 'Kek' },
              },
              {
                kind: ASTNodeKind.NAMED_TYPE,
                name: { kind: ASTNodeKind.NAME, value: 'Lel' },
              },
            ],
            kind: ASTNodeKind.MODEL_TYPE_DEFINITION,
            strict: true,
            description: undefined,
          },
        ],
      });
    });

    it('correctly parse model with inline type definitions', () => {
      const model = `
      AcDocument < Kek, Lel !{
            -name?: s[],
            type?: ( standard | service ),
            kek: { conversationId: i, users: { id: i, nickname, avatar? }[] },
            surname: b[],
          }
        `;

      const ast = parse(model);
      expect(toJSONDeep(ast)).toEqual({
        kind: ASTNodeKind.DOCUMENT,
        definitions: [
          {
            fields: [
              {
                omitted: true,
                optional: true,
                kind: ASTNodeKind.FIELD_DEFINITION,
                name: {
                  kind: ASTNodeKind.NAME,
                  value: 'name',
                },
                type: {
                  kind: ASTNodeKind.LIST_TYPE,
                  type: {
                    kind: ASTNodeKind.NAMED_TYPE,
                    name: {
                      kind: ASTNodeKind.NAME,
                      value: 's',
                    },
                  },
                },
              },
              {
                omitted: false,
                optional: true,
                kind: ASTNodeKind.FIELD_DEFINITION,
                name: {
                  kind: ASTNodeKind.NAME,
                  value: 'type',
                },
                type: {
                  kind: ASTNodeKind.ENUM_INLINE_TYPE_DEFINITION,
                  values: [
                    {
                      kind: ASTNodeKind.ENUM_VALUE_DEFINITION,
                      name: { kind: ASTNodeKind.NAME, value: 'standard' },
                    },
                    {
                      kind: ASTNodeKind.ENUM_VALUE_DEFINITION,
                      name: { kind: ASTNodeKind.NAME, value: 'service' },
                    },
                  ],
                },
              },
              {
                omitted: false,
                optional: false,
                kind: ASTNodeKind.FIELD_DEFINITION,
                name: {
                  kind: ASTNodeKind.NAME,
                  value: 'kek',
                },
                type: {
                  kind: ASTNodeKind.OBJECT_TYPE_DEFINITION,
                  fields: [
                    {
                      kind: ASTNodeKind.FIELD_DEFINITION,
                      name: {
                        kind: ASTNodeKind.NAME,
                        value: 'conversationId',
                      },
                      omitted: false,
                      optional: false,
                      type: {
                        kind: ASTNodeKind.NAMED_TYPE,
                        name: {
                          kind: ASTNodeKind.NAME,
                          value: 'i',
                        },
                      },
                    },
                    {
                      kind: ASTNodeKind.FIELD_DEFINITION,
                      name: {
                        kind: ASTNodeKind.NAME,
                        value: 'users',
                      },
                      omitted: false,
                      optional: false,
                      type: {
                        kind: ASTNodeKind.LIST_TYPE,
                        type: {
                          kind: ASTNodeKind.OBJECT_TYPE_DEFINITION,
                          fields: [
                            {
                              kind: ASTNodeKind.FIELD_DEFINITION,
                              name: {
                                kind: ASTNodeKind.NAME,
                                value: 'id',
                              },
                              omitted: false,
                              optional: false,
                              type: {
                                kind: ASTNodeKind.NAMED_TYPE,
                                name: {
                                  kind: ASTNodeKind.NAME,
                                  value: 'i',
                                },
                              },
                            },
                            {
                              kind: ASTNodeKind.FIELD_DEFINITION,
                              name: {
                                kind: ASTNodeKind.NAME,
                                value: 'nickname',
                              },
                              omitted: false,
                              optional: false,
                              type: {
                                kind: ASTNodeKind.NAMED_TYPE,
                                name: {
                                  kind: ASTNodeKind.NAME,
                                  value: undefined,
                                },
                              },
                            },
                            {
                              kind: ASTNodeKind.FIELD_DEFINITION,
                              name: {
                                kind: ASTNodeKind.NAME,
                                value: 'avatar',
                              },
                              omitted: false,
                              optional: true,
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
                  kind: ASTNodeKind.LIST_TYPE,
                  type: {
                    kind: ASTNodeKind.NAMED_TYPE,
                    name: {
                      kind: ASTNodeKind.NAME,
                      value: 'b',
                    },
                  },
                },
              },
            ],
            name: {
              kind: ASTNodeKind.NAME,
              value: 'AcDocument',
            },
            extendsModels: [
              {
                kind: ASTNodeKind.NAMED_TYPE,
                name: { kind: ASTNodeKind.NAME, value: 'Kek' },
              },
              {
                kind: ASTNodeKind.NAMED_TYPE,
                name: { kind: ASTNodeKind.NAME, value: 'Lel' },
              },
            ],
            kind: ASTNodeKind.MODEL_TYPE_DEFINITION,
            strict: true,
            description: undefined,
          },
        ],
      });
    });
  });

  describe('enum', () => {});
});
