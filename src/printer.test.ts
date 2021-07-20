import { ASTNodeKind, parse, print } from './language';
import { dedent } from './__testsUtils__';

describe(__filename, () => {
  it('correctly print model with description', () => {
    const ast = {
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
    };

    const printed = print(ast);
    expect(printed).toEqual(dedent`
// лул
// kek
AcDocument {}
`);
  });

  it('correctly print empty model without description', () => {
    const ast = {
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
    };

    const printed = print(ast);

    expect(printed).toEqual(dedent`
AcDocument {}
`);
  });

  it('correctly print empty model without description', () => {
    const ast = {
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
    };

    const printed = print(ast);

    expect(printed).toEqual(dedent`
AcDocument {}
`);
  });

  it('correctly print model fields', () => {
    const ast = {
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
    };
    const printed = print(ast);

    expect(printed).toEqual(dedent`
AcDocument {
  name
}
`);
  });

  it('correctly print model fields with trailing comma', () => {
    const ast = {
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
    };
    const printed = print(ast);

    expect(printed).toEqual(dedent`
AcDocument {
  name,
  surname
}
`);
  });

  it('correctly print model fields with s', () => {
    const ast = {
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
    };

    const printed = print(ast);

    expect(printed).toEqual(dedent`
AcDocument {
  name: s,
  surname
}
`);
  });

  it('correctly print optional model fields', () => {
    const ast = {
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
    };

    const printed = print(ast);

    expect(printed).toEqual(dedent`
AcDocument {
  name?: s,
  surname
}
`);
  });

  it('correctly print optional model fields without type', () => {
    const ast = {
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
    };

    const printed = print(ast);
    
    expect(printed).toEqual(dedent`
AcDocument {
  name?,
  surname
}
`);
  });

  it('correctly print field array type', () => {
    const ast = {
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
    };

    const printed = print(ast);

    expect(printed).toEqual(dedent`
AcDocument {
  name?: s[],
  surname: b[][]
}
`);
  });
});
