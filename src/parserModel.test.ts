import {
  ASTNode,
  ASTNodeKind,
  EnumTypeDefinitionNode,
  ModelTypeDefinitionNode,
  parse as defaultParse,
  Source,
} from './language';
import { AnySpecError } from './error/AnySpecError';
import { toJSONDeep, log } from './utils';

const parse = (source: string | Source) => defaultParse(source, { noLocation: true });

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
            description: { kind: ASTNodeKind.DESCRIPTION, value: 'лул\nkek' },
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

    it('correctly parse field multi arrays', () => {
      const model = `
          AcDocument {
            surname: b[][],
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
                  value: 'surname',
                },
                type: {
                  kind: ASTNodeKind.LIST_TYPE,
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

    it('correctly parse field multi arrays v2', () => {
      const model = `
          AcDocument {
            surname: b[][][],
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
                  value: 'surname',
                },
                type: {
                  kind: ASTNodeKind.LIST_TYPE,
                  type: {
                    kind: ASTNodeKind.LIST_TYPE,
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
                  strict: false,
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
                          strict: false,
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

    it('should parse strict nested types coorectly', () => {
      const model = `
      AcDocument < Kek, Lel !{
            pathParameters: !{
              pathParameters: !{}
            }
          }
        `;

      const ast = parse(model);

      const expected: ASTNode = {
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
                  value: 'pathParameters',
                },
                type: {
                  strict: true,
                  kind: ASTNodeKind.OBJECT_TYPE_DEFINITION,
                  fields: [
                    {
                      kind: ASTNodeKind.FIELD_DEFINITION,
                      omitted: false,
                      optional: false,
                      name: { kind: ASTNodeKind.NAME, value: 'pathParameters' },
                      type: {
                        strict: true,
                        kind: ASTNodeKind.OBJECT_TYPE_DEFINITION,
                        fields: [],
                      },
                    },
                  ],
                },
              },
            ],
            kind: ASTNodeKind.MODEL_TYPE_DEFINITION,
            strict: true,
            description: undefined,
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
            name: {
              kind: ASTNodeKind.NAME,
              value: 'AcDocument',
            },
          },
        ],
      };

      expect(toJSONDeep(ast)).toEqual(expected);
    });
  });

  describe('enum', () => {
    it('correctly parse model with named enum', () => {
      const model = `
          A (
            f | b | 
          )
        `;

      const EnumA: EnumTypeDefinitionNode = {
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
        name: {
          kind: ASTNodeKind.NAME,
          value: 'A',
        },
        kind: ASTNodeKind.ENUM_TYPE_DEFINITION,
      };

      const ast = parse(model);
      expect(toJSONDeep(ast)).toEqual({
        kind: ASTNodeKind.DOCUMENT,
        definitions: [EnumA],
      });
    });

    it('correctly parse model with named enum and  " " ', () => {
      const model = `
          A (
            "f" | "b" | 
          )
        `;

      const EnumA: EnumTypeDefinitionNode = {
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
        name: {
          kind: ASTNodeKind.NAME,
          value: 'A',
        },
        kind: ASTNodeKind.ENUM_TYPE_DEFINITION,
      };

      const ast = parse(model);
      expect(toJSONDeep(ast)).toEqual({
        kind: ASTNodeKind.DOCUMENT,
        definitions: [EnumA],
      });
    });

    it('correctly parse model that uses named enum', () => {
      const model = `
          A (
            f |
            b
          )

          MyModel {color: A}

          B (c | d)
        `;
      const EnumA: EnumTypeDefinitionNode = {
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
        name: {
          kind: ASTNodeKind.NAME,
          value: 'A',
        },
        kind: ASTNodeKind.ENUM_TYPE_DEFINITION,
      };

      const EnumB: EnumTypeDefinitionNode = {
        values: [
          {
            kind: ASTNodeKind.ENUM_VALUE_DEFINITION,
            name: {
              kind: ASTNodeKind.NAME,
              value: 'c',
            },
          },
          {
            kind: ASTNodeKind.ENUM_VALUE_DEFINITION,
            name: {
              kind: ASTNodeKind.NAME,
              value: 'd',
            },
          },
        ],
        name: {
          kind: ASTNodeKind.NAME,
          value: 'B',
        },
        kind: ASTNodeKind.ENUM_TYPE_DEFINITION,
      };

      const MyModel: ModelTypeDefinitionNode = {
        fields: [
          {
            omitted: false,
            optional: false,
            kind: ASTNodeKind.FIELD_DEFINITION,
            name: {
              kind: ASTNodeKind.NAME,
              value: 'color',
            },
            type: {
              kind: ASTNodeKind.NAMED_TYPE,
              name: {
                kind: ASTNodeKind.NAME,
                value: 'A',
              },
            },
          },
        ],
        name: {
          kind: ASTNodeKind.NAME,
          value: 'MyModel',
        },
        strict: false,
        kind: ASTNodeKind.MODEL_TYPE_DEFINITION,
        description: undefined,
        extendsModels: [],
      };

      const ast = parse(model);
      expect(toJSONDeep(ast)).toEqual({
        kind: ASTNodeKind.DOCUMENT,
        definitions: [EnumA, MyModel, EnumB],
      });
    });

    it('correctly parse model with named with complicated values', () => {
      const model = `
          CompanyType = (
            Branch Office Singapore |
            Private Company 'Limited' by Shares (Pte. Ltd.) |
            + amount | 
            b-office-singapore
          )
        `;

      const EnumA: EnumTypeDefinitionNode = {
        values: [
          {
            kind: ASTNodeKind.ENUM_VALUE_DEFINITION,
            name: {
              kind: ASTNodeKind.NAME,
              value: 'Branch Office Singapore',
            },
          },
          {
            kind: ASTNodeKind.ENUM_VALUE_DEFINITION,
            name: {
              kind: ASTNodeKind.NAME,
              value: "Private Company 'Limited' by Shares (Pte. Ltd.)",
            },
          },
          {
            kind: ASTNodeKind.ENUM_VALUE_DEFINITION,
            name: {
              kind: ASTNodeKind.NAME,
              value: '+ amount',
            },
          },
          {
            kind: ASTNodeKind.ENUM_VALUE_DEFINITION,
            name: {
              kind: ASTNodeKind.NAME,
              value: 'b-office-singapore',
            },
          },
        ],
        name: {
          kind: ASTNodeKind.NAME,
          value: 'CompanyType',
        },
        kind: ASTNodeKind.ENUM_TYPE_DEFINITION,
      };

      const ast = parse(model);
      expect(toJSONDeep(ast)).toEqual({
        kind: ASTNodeKind.DOCUMENT,
        definitions: [EnumA],
      });
    });

    it('correctly parse model with complicated inline enums', () => {
      const model = `
          AcDocument < Kek, Lel !{
            -name?: s[],
            type?: ( + amount | - amount | summ + | Private Company 'Limited' by Shares (Pte. Ltd.) ),
            kek: { conversationId: i, users: { id: i, nickname, avatar? }[] },
            surname: b[],
          }
    
        `;

      const Model: ModelTypeDefinitionNode = {
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
                  name: { kind: ASTNodeKind.NAME, value: '+ amount' },
                },
                {
                  kind: ASTNodeKind.ENUM_VALUE_DEFINITION,
                  name: { kind: ASTNodeKind.NAME, value: '- amount' },
                },
                {
                  kind: ASTNodeKind.ENUM_VALUE_DEFINITION,
                  name: { kind: ASTNodeKind.NAME, value: 'summ +' },
                },
                {
                  kind: ASTNodeKind.ENUM_VALUE_DEFINITION,
                  name: {
                    kind: ASTNodeKind.NAME,
                    value: "Private Company 'Limited' by Shares (Pte. Ltd.)",
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
              value: 'kek',
            },
            type: {
              strict: false,
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
                      strict: false,
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
      };

      const ast = parse(model);
      expect(toJSONDeep(ast)).toEqual({
        kind: ASTNodeKind.DOCUMENT,
        definitions: [Model],
      });
    });
  });

  describe('enum with parenthesis errors', () => {
    // We cant cath all parenthesis errors in Lexer, so some cases can leaks to parser

    it('unbalanced parenthesis not allowed', () => {
      const enumString = `CompanyType (
        Limited Partnership (LP)) |
        exempt-private |
      )
      
      Model {}

      A (b | c)
      `;

      expect(() => parse(enumString)).toThrow();
    });

    it('unbalanced parenthesis not allowed 2', () => {
      const enumString = `CompanyType (
        )Limited Partnership |
        exempt-private
      )
      Model {}
      `;

      expect(() => parse(enumString)).toThrow();
    });

    it('unbalanced parenthesis not allowed 3', () => {
      const enumString = `CompanyType (
        )Limited Partnership( |
        exempt-private
      )
      Model {}
      `;

      expect(() => parse(enumString)).toThrow();
    });

    it('unbalanced parenthesis not allowed 4', () => {
      const enumString = `CompanyType (
        Limited Partnership |
        exempt-private) |
      )
      
      Model {}
      `;

      expect(() => parse(enumString)).toThrow();
    });

    it('unbalanced parenthesis not allowed 5', () => {
      const enumString = `CompanyType (
        Limited Partnership |
        )exempt-private( |
      )
      
      Model {}
      `;

      expect(() => parse(enumString)).toThrow();
    });

    it('unbalanced parenthesis not allowed 6', () => {
      const enumString = `CompanyType (
        Limited Partnership (LP)( |
        exempt-private
      )
      
      Model {}

      A (b | c)
      `;

      expect(() => parse(enumString)).toThrow(
        'Syntax Error: parenthesis should be balanced inside enum definition',
      );
    });

    it('unbalanced parenthesis not allowed 7', () => {
      const enumString = `CompanyType (
        (Limited Partnership |
        exempt-private
      )
      
      Model {}

      A (b | c)
      `;

      expect(() => parse(enumString)).toThrow(
        'Syntax Error: parenthesis should be balanced inside enum definition',
      );
    });

    it('unbalanced parenthesis not allowed 8', () => {
      const enumString = `CompanyType (
        Limited Partnership |
        exempt-private(
      )
      
      Model {}

      A (b | c)
      `;

      expect(() => parse(enumString)).toThrow(
        'Syntax Error: parenthesis should be balanced inside enum definition',
      );
    });

    it('unbalanced parenthesis not allowed 9', () => {
      const enumString = `CompanyType (
        Limited Partnership |
        exempt-private( |
      )
      
      Model {}

      A (b | c)
      `;

      expect(() => parse(enumString)).toThrow(
        'Syntax Error: parenthesis should be balanced inside enum definition',
      );
    });

    it('unbalanced parenthesis not allowed 10', () => {
      const enumString = `CompanyType (
        Limited Partnership |
        (exempt-private( 
      )
      Model {}

      A (b | c)
      `;

      expect(() => parse(enumString)).toThrow(
        'Syntax Error: parenthesis should be balanced inside enum definition',
      );
    });
  });
});
