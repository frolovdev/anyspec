import { ASTNodeKind, EnumTypeDefinitionNode, ModelTypeDefinitionNode } from '../../language';
import { print } from '../index';
import { dedent, dedentString } from '../../__testsUtils__';
import { visualizeEndOfLine } from '../../__testsUtils__/visualizeEndOfLine';

describe(__filename, () => {
  describe('models', () => {
    it('correctly print model with description', () => {
      const source = `
      // лул


// kek



AcDocument {      }`;

      const printed = print(source);

      expect(printed).toEqual(
        `// лул
// kek
AcDocument {}\n`,
      );
    });

    it('correctly print empty model without description', () => {
      const source = `AcDocument {}`;

      const printed = print(source);

      expect(printed).toEqual(`AcDocument {}\n`);
    });

    it('correctly print model fields', () => {
      const source = `AcDocument {name}`;
      const printed = print(source);

      expect(dedentString(printed)).toEqual(dedent`
    AcDocument {
      name,
    }\n`);
    });

    it('correctly print model fields with trailing comma', () => {
      const source = `AcDocument {
        name, surname,
      }`;
      const printed = print(source);

      expect(dedentString(printed)).toEqual(dedent`
    AcDocument {
      name,
      surname,
    }\n`);
    });

    it('correctly print model fields with s', () => {
      const source = `AcDocument {
        name: s,
        surname,
      }
      
      
      
      `;

      const source2 = `AcDocument {
        surname,
        name: s,
      }
      
      
      
      `;

      const printed = print(source);
      const printed2 = print(source2);

      expect(dedentString(printed)).toEqual(dedent`
    AcDocument {
      name: s,
      surname,
    }
    `);

      expect(dedentString(printed2)).toEqual(dedent`
    AcDocument {
      surname,
      name: s,
    }
    `);
    });

    it('correctly print optional model fields', () => {
      const source = `AcDocument {
        name?: s,
        surname,
      }`;

      const printed = print(source);

      expect(dedentString(printed)).toEqual(dedent`
    AcDocument {
      name?: s,
      surname,
    }
    `);
    });

    it('correctly print optional model fields without type', () => {
      const source = `AcDocument {
        name?,
        surname,
      }`;

      const printed = print(source);

      expect(dedentString(printed)).toEqual(dedent`
    AcDocument {
      name?,
      surname,
    }
    `);
    });

    it('correctly print field array type', () => {
      const source = `AcDocument {
        name?: s[],
        surname: b[][],
      }`;

      const printed = print(source);

      expect(dedentString(printed)).toEqual(dedent`
    AcDocument {
      name?: s[],
      surname: b[][],
    }
    `);
    });

    //     it('correctly print strict mode models', () => {
    //       const ast = {
    //         kind: ASTNodeKind.DOCUMENT,
    //         definitions: [
    //           {
    //             fields: [
    //               {
    //                 omitted: false,
    //                 optional: true,
    //                 kind: ASTNodeKind.FIELD_DEFINITION,
    //                 name: {
    //                   kind: ASTNodeKind.NAME,
    //                   value: 'name',
    //                 },
    //                 type: {
    //                   kind: ASTNodeKind.LIST_TYPE,
    //                   type: {
    //                     kind: ASTNodeKind.NAMED_TYPE,
    //                     name: {
    //                       kind: ASTNodeKind.NAME,
    //                       value: 's',
    //                     },
    //                   },
    //                 },
    //               },
    //               {
    //                 omitted: false,
    //                 optional: false,
    //                 kind: ASTNodeKind.FIELD_DEFINITION,
    //                 name: {
    //                   kind: ASTNodeKind.NAME,
    //                   value: 'surname',
    //                 },
    //                 type: {
    //                   kind: ASTNodeKind.LIST_TYPE,
    //                   type: {
    //                     kind: ASTNodeKind.NAMED_TYPE,
    //                     name: {
    //                       kind: ASTNodeKind.NAME,
    //                       value: 'b',
    //                     },
    //                   },
    //                 },
    //               },
    //             ],
    //             name: {
    //               kind: ASTNodeKind.NAME,
    //               value: 'AcDocument',
    //             },
    //             kind: ASTNodeKind.MODEL_TYPE_DEFINITION,
    //             strict: true,
    //             description: undefined,
    //             extendsModels: [],
    //           },
    //         ],
    //       };

    //       const printed = print(ast);

    //       expect(printed).toEqual(dedent`
    // AcDocument !{
    //   name?: s[],
    //   surname: b[],
    // }
    // `);
    //     });

    //     it('correctly print extends model', () => {
    //       const ast = {
    //         kind: ASTNodeKind.DOCUMENT,
    //         definitions: [
    //           {
    //             fields: [
    //               {
    //                 omitted: false,
    //                 optional: true,
    //                 kind: ASTNodeKind.FIELD_DEFINITION,
    //                 name: {
    //                   kind: ASTNodeKind.NAME,
    //                   value: 'name',
    //                 },
    //                 type: {
    //                   kind: ASTNodeKind.LIST_TYPE,
    //                   type: {
    //                     kind: ASTNodeKind.NAMED_TYPE,
    //                     name: {
    //                       kind: ASTNodeKind.NAME,
    //                       value: 's',
    //                     },
    //                   },
    //                 },
    //               },
    //               {
    //                 omitted: false,
    //                 optional: false,
    //                 kind: ASTNodeKind.FIELD_DEFINITION,
    //                 name: {
    //                   kind: ASTNodeKind.NAME,
    //                   value: 'surname',
    //                 },
    //                 type: {
    //                   kind: ASTNodeKind.LIST_TYPE,
    //                   type: {
    //                     kind: ASTNodeKind.NAMED_TYPE,
    //                     name: {
    //                       kind: ASTNodeKind.NAME,
    //                       value: 'b',
    //                     },
    //                   },
    //                 },
    //               },
    //             ],
    //             name: {
    //               kind: ASTNodeKind.NAME,
    //               value: 'AcDocument',
    //             },
    //             extendsModels: [
    //               {
    //                 kind: ASTNodeKind.NAMED_TYPE,
    //                 name: { kind: ASTNodeKind.NAME, value: 'Kek' },
    //               },
    //             ],
    //             kind: ASTNodeKind.MODEL_TYPE_DEFINITION,
    //             strict: false,
    //             description: undefined,
    //           },
    //         ],
    //       };
    //       const printed = print(ast);

    //       expect(printed).toEqual(dedent`
    // AcDocument < Kek {
    //   name?: s[],
    //   surname: b[],
    // }
    // `);
    //     });

    //     it('correctly print with multiple extends model and strict model', () => {
    //       const ast = {
    //         kind: ASTNodeKind.DOCUMENT,
    //         definitions: [
    //           {
    //             fields: [
    //               {
    //                 omitted: false,
    //                 optional: true,
    //                 kind: ASTNodeKind.FIELD_DEFINITION,
    //                 name: {
    //                   kind: ASTNodeKind.NAME,
    //                   value: 'name',
    //                 },
    //                 type: {
    //                   kind: ASTNodeKind.LIST_TYPE,
    //                   type: {
    //                     kind: ASTNodeKind.NAMED_TYPE,
    //                     name: {
    //                       kind: ASTNodeKind.NAME,
    //                       value: 's',
    //                     },
    //                   },
    //                 },
    //               },
    //               {
    //                 omitted: false,
    //                 optional: false,
    //                 kind: ASTNodeKind.FIELD_DEFINITION,
    //                 name: {
    //                   kind: ASTNodeKind.NAME,
    //                   value: 'surname',
    //                 },
    //                 type: {
    //                   kind: ASTNodeKind.LIST_TYPE,
    //                   type: {
    //                     kind: ASTNodeKind.NAMED_TYPE,
    //                     name: {
    //                       kind: ASTNodeKind.NAME,
    //                       value: 'b',
    //                     },
    //                   },
    //                 },
    //               },
    //             ],
    //             name: {
    //               kind: ASTNodeKind.NAME,
    //               value: 'AcDocument',
    //             },
    //             extendsModels: [
    //               {
    //                 kind: ASTNodeKind.NAMED_TYPE,
    //                 name: { kind: ASTNodeKind.NAME, value: 'Kek' },
    //               },
    //               {
    //                 kind: ASTNodeKind.NAMED_TYPE,
    //                 name: { kind: ASTNodeKind.NAME, value: 'Lel' },
    //               },
    //             ],
    //             kind: ASTNodeKind.MODEL_TYPE_DEFINITION,
    //             strict: true,
    //             description: undefined,
    //           },
    //         ],
    //       };
    //       const printed = print(ast);

    //       expect(printed).toEqual(dedent`
    // AcDocument < Kek, Lel !{
    //   name?: s[],
    //   surname: b[],
    // }
    // `);
    //     });

    //     it('correctly print model with inline enum', () => {
    //       const ast = {
    //         kind: ASTNodeKind.DOCUMENT,
    //         definitions: [
    //           {
    //             fields: [
    //               {
    //                 omitted: true,
    //                 optional: true,
    //                 kind: ASTNodeKind.FIELD_DEFINITION,
    //                 name: {
    //                   kind: ASTNodeKind.NAME,
    //                   value: 'name',
    //                 },
    //                 type: {
    //                   kind: ASTNodeKind.LIST_TYPE,
    //                   type: {
    //                     kind: ASTNodeKind.NAMED_TYPE,
    //                     name: {
    //                       kind: ASTNodeKind.NAME,
    //                       value: 's',
    //                     },
    //                   },
    //                 },
    //               },
    //               {
    //                 omitted: false,
    //                 optional: true,
    //                 kind: ASTNodeKind.FIELD_DEFINITION,
    //                 name: {
    //                   kind: ASTNodeKind.NAME,
    //                   value: 'type',
    //                 },
    //                 type: {
    //                   kind: ASTNodeKind.ENUM_INLINE_TYPE_DEFINITION,
    //                   values: [
    //                     {
    //                       kind: ASTNodeKind.ENUM_VALUE_DEFINITION,
    //                       name: { kind: ASTNodeKind.NAME, value: 'standard' },
    //                     },
    //                     {
    //                       kind: ASTNodeKind.ENUM_VALUE_DEFINITION,
    //                       name: { kind: ASTNodeKind.NAME, value: 'service' },
    //                     },
    //                   ],
    //                 },
    //               },
    //               {
    //                 omitted: false,
    //                 optional: false,
    //                 kind: ASTNodeKind.FIELD_DEFINITION,
    //                 name: {
    //                   kind: ASTNodeKind.NAME,
    //                   value: 'surname',
    //                 },
    //                 type: {
    //                   kind: ASTNodeKind.LIST_TYPE,
    //                   type: {
    //                     kind: ASTNodeKind.NAMED_TYPE,
    //                     name: {
    //                       kind: ASTNodeKind.NAME,
    //                       value: 'b',
    //                     },
    //                   },
    //                 },
    //               },
    //             ],
    //             name: {
    //               kind: ASTNodeKind.NAME,
    //               value: 'AcDocument',
    //             },
    //             extendsModels: [
    //               {
    //                 kind: ASTNodeKind.NAMED_TYPE,
    //                 name: { kind: ASTNodeKind.NAME, value: 'Kek' },
    //               },
    //               {
    //                 kind: ASTNodeKind.NAMED_TYPE,
    //                 name: { kind: ASTNodeKind.NAME, value: 'Lel' },
    //               },
    //             ],
    //             kind: ASTNodeKind.MODEL_TYPE_DEFINITION,
    //             strict: true,
    //             description: undefined,
    //           },
    //         ],
    //       };
    //       const printed = print(ast);
    //       expect(printed).toEqual(dedent`
    // AcDocument < Kek, Lel !{
    //   -name?: s[],
    //   type?: ( standard | service ),
    //   surname: b[],
    // }
    // `);
    //     });
    //     it('correctly print model with inline type definitions', () => {
    //       const ast = {
    //         kind: ASTNodeKind.DOCUMENT,
    //         definitions: [
    //           {
    //             fields: [
    //               {
    //                 omitted: true,
    //                 optional: true,
    //                 kind: ASTNodeKind.FIELD_DEFINITION,
    //                 name: {
    //                   kind: ASTNodeKind.NAME,
    //                   value: 'name',
    //                 },
    //                 type: {
    //                   kind: ASTNodeKind.LIST_TYPE,
    //                   type: {
    //                     kind: ASTNodeKind.NAMED_TYPE,
    //                     name: {
    //                       kind: ASTNodeKind.NAME,
    //                       value: 's',
    //                     },
    //                   },
    //                 },
    //               },
    //               {
    //                 omitted: false,
    //                 optional: true,
    //                 kind: ASTNodeKind.FIELD_DEFINITION,
    //                 name: {
    //                   kind: ASTNodeKind.NAME,
    //                   value: 'type',
    //                 },
    //                 type: {
    //                   kind: ASTNodeKind.ENUM_INLINE_TYPE_DEFINITION,
    //                   values: [
    //                     {
    //                       kind: ASTNodeKind.ENUM_VALUE_DEFINITION,
    //                       name: { kind: ASTNodeKind.NAME, value: 'standard' },
    //                     },
    //                     {
    //                       kind: ASTNodeKind.ENUM_VALUE_DEFINITION,
    //                       name: { kind: ASTNodeKind.NAME, value: 'service' },
    //                     },
    //                   ],
    //                 },
    //               },
    //               {
    //                 omitted: false,
    //                 optional: false,
    //                 kind: ASTNodeKind.FIELD_DEFINITION,
    //                 name: {
    //                   kind: ASTNodeKind.NAME,
    //                   value: 'kek',
    //                 },
    //                 type: {
    //                   strict: false,
    //                   kind: ASTNodeKind.OBJECT_TYPE_DEFINITION,
    //                   fields: [
    //                     {
    //                       kind: ASTNodeKind.FIELD_DEFINITION,
    //                       name: {
    //                         kind: ASTNodeKind.NAME,
    //                         value: 'conversationId',
    //                       },
    //                       omitted: false,
    //                       optional: false,
    //                       type: {
    //                         kind: ASTNodeKind.NAMED_TYPE,
    //                         name: {
    //                           kind: ASTNodeKind.NAME,
    //                           value: 'i',
    //                         },
    //                       },
    //                     },
    //                     {
    //                       kind: ASTNodeKind.FIELD_DEFINITION,
    //                       name: {
    //                         kind: ASTNodeKind.NAME,
    //                         value: 'users',
    //                       },
    //                       omitted: false,
    //                       optional: false,
    //                       type: {
    //                         kind: ASTNodeKind.LIST_TYPE,
    //                         type: {
    //                           strict: false,
    //                           kind: ASTNodeKind.OBJECT_TYPE_DEFINITION,
    //                           fields: [
    //                             {
    //                               kind: ASTNodeKind.FIELD_DEFINITION,
    //                               name: {
    //                                 kind: ASTNodeKind.NAME,
    //                                 value: 'id',
    //                               },
    //                               omitted: false,
    //                               optional: false,
    //                               type: {
    //                                 kind: ASTNodeKind.NAMED_TYPE,
    //                                 name: {
    //                                   kind: ASTNodeKind.NAME,
    //                                   value: 'i',
    //                                 },
    //                               },
    //                             },
    //                             {
    //                               kind: ASTNodeKind.FIELD_DEFINITION,
    //                               name: {
    //                                 kind: ASTNodeKind.NAME,
    //                                 value: 'nickname',
    //                               },
    //                               omitted: false,
    //                               optional: false,
    //                               type: {
    //                                 kind: ASTNodeKind.NAMED_TYPE,
    //                                 name: {
    //                                   kind: ASTNodeKind.NAME,
    //                                   value: undefined,
    //                                 },
    //                               },
    //                             },
    //                             {
    //                               kind: ASTNodeKind.FIELD_DEFINITION,
    //                               name: {
    //                                 kind: ASTNodeKind.NAME,
    //                                 value: 'avatar',
    //                               },
    //                               omitted: false,
    //                               optional: true,
    //                               type: {
    //                                 kind: ASTNodeKind.NAMED_TYPE,
    //                                 name: {
    //                                   kind: ASTNodeKind.NAME,
    //                                   value: undefined,
    //                                 },
    //                               },
    //                             },
    //                           ],
    //                         },
    //                       },
    //                     },
    //                   ],
    //                 },
    //               },
    //               {
    //                 omitted: false,
    //                 optional: false,
    //                 kind: ASTNodeKind.FIELD_DEFINITION,
    //                 name: {
    //                   kind: ASTNodeKind.NAME,
    //                   value: 'surname',
    //                 },
    //                 type: {
    //                   kind: ASTNodeKind.LIST_TYPE,
    //                   type: {
    //                     kind: ASTNodeKind.NAMED_TYPE,
    //                     name: {
    //                       kind: ASTNodeKind.NAME,
    //                       value: 'b',
    //                     },
    //                   },
    //                 },
    //               },
    //             ],
    //             name: {
    //               kind: ASTNodeKind.NAME,
    //               value: 'AcDocument',
    //             },
    //             extendsModels: [
    //               {
    //                 kind: ASTNodeKind.NAMED_TYPE,
    //                 name: { kind: ASTNodeKind.NAME, value: 'Kek' },
    //               },
    //               {
    //                 kind: ASTNodeKind.NAMED_TYPE,
    //                 name: { kind: ASTNodeKind.NAME, value: 'Lel' },
    //               },
    //             ],
    //             kind: ASTNodeKind.MODEL_TYPE_DEFINITION,
    //             strict: true,
    //             description: undefined,
    //           },
    //         ],
    //       };
    //       const printed = print(ast);
    //       expect(printed).toEqual(dedent`
    // AcDocument < Kek, Lel !{
    //   -name?: s[],
    //   type?: ( standard | service ),
    //   kek: {
    //     conversationId: i,
    //     users: {
    //       id: i,
    //       nickname,
    //       avatar?,
    //     }[],
    //   },
    //   surname: b[],
    // }
    // `);
    //     });
    //     it('should print strict nested types correctly', () => {
    //       const ast = {
    //         kind: ASTNodeKind.DOCUMENT,

    //         definitions: [
    //           {
    //             fields: [
    //               {
    //                 omitted: false,
    //                 optional: false,
    //                 kind: ASTNodeKind.FIELD_DEFINITION,
    //                 name: {
    //                   kind: ASTNodeKind.NAME,
    //                   value: 'pathParameters',
    //                 },
    //                 type: {
    //                   strict: true,
    //                   kind: ASTNodeKind.OBJECT_TYPE_DEFINITION,
    //                   fields: [
    //                     {
    //                       kind: ASTNodeKind.FIELD_DEFINITION,
    //                       omitted: false,
    //                       optional: false,
    //                       name: { kind: ASTNodeKind.NAME, value: 'pathParameters' },
    //                       type: {
    //                         strict: true,
    //                         kind: ASTNodeKind.OBJECT_TYPE_DEFINITION,
    //                         fields: [],
    //                       },
    //                     },
    //                   ],
    //                 },
    //               },
    //             ],
    //             kind: ASTNodeKind.MODEL_TYPE_DEFINITION,
    //             strict: true,
    //             description: undefined,
    //             extendsModels: [
    //               {
    //                 kind: ASTNodeKind.NAMED_TYPE,
    //                 name: { kind: ASTNodeKind.NAME, value: 'Kek' },
    //               },
    //               {
    //                 kind: ASTNodeKind.NAMED_TYPE,
    //                 name: { kind: ASTNodeKind.NAME, value: 'Lel' },
    //               },
    //             ],
    //             name: {
    //               kind: ASTNodeKind.NAME,
    //               value: 'AcDocument',
    //             },
    //           },
    //         ],
    //       };
    //       const printed = print(ast);

    //       expect(printed).toEqual(dedent`
    // AcDocument < Kek, Lel !{
    //   pathParameters: !{
    //     pathParameters: !{},
    //   },
    // }
    // `);
    //     });

    //     it('correctly print multiple models', () => {
    //       const ast = {
    //         kind: ASTNodeKind.DOCUMENT,
    //         definitions: [
    //           {
    //             fields: [],
    //             name: {
    //               kind: ASTNodeKind.NAME,
    //               value: 'AcDocument',
    //             },
    //             strict: false,
    //             kind: ASTNodeKind.MODEL_TYPE_DEFINITION,
    //             description: undefined,
    //             extendsModels: [],
    //           },
    //           {
    //             fields: [
    //               {
    //                 omitted: false,
    //                 optional: false,
    //                 kind: ASTNodeKind.FIELD_DEFINITION,
    //                 name: {
    //                   kind: ASTNodeKind.NAME,
    //                   value: 'name',
    //                 },
    //                 type: {
    //                   kind: ASTNodeKind.NAMED_TYPE,
    //                   name: {
    //                     kind: ASTNodeKind.NAME,
    //                     value: undefined,
    //                   },
    //                 },
    //               },
    //             ],
    //             name: {
    //               kind: ASTNodeKind.NAME,
    //               value: 'AcDocument2',
    //             },
    //             strict: false,
    //             kind: ASTNodeKind.MODEL_TYPE_DEFINITION,
    //             description: undefined,
    //             extendsModels: [],
    //           },
    //         ],
    //       };

    //       const printed = print(ast);

    //       expect(printed).toEqual(dedent`
    // AcDocument {}

    // AcDocument2 {
    //   name,
    // }
    // `);
    //     });
    //   });
    //   describe('enums', () => {
    //     it('correctly print model with short named enum and description', () => {
    //       const ast = {
    //         kind: ASTNodeKind.DOCUMENT,
    //         definitions: [
    //           {
    //             values: [
    //               {
    //                 kind: ASTNodeKind.ENUM_VALUE_DEFINITION,
    //                 name: {
    //                   kind: ASTNodeKind.NAME,
    //                   value: 'f',
    //                 },
    //               },
    //               {
    //                 kind: ASTNodeKind.ENUM_VALUE_DEFINITION,
    //                 name: {
    //                   kind: ASTNodeKind.NAME,
    //                   value: 'b',
    //                 },
    //               },
    //             ],
    //             name: {
    //               kind: ASTNodeKind.NAME,
    //               value: 'A',
    //             },
    //             kind: ASTNodeKind.ENUM_TYPE_DEFINITION,
    //             description: { kind: ASTNodeKind.DESCRIPTION, value: 'лул\nkek' },
    //           },
    //         ],
    //       };
    //       const printed = print(ast);

    //       expect(printed).toEqual(dedent`
    //       // лул
    //       // kek
    //       A (
    //         f |
    //         b
    //       )
    // `);
    //     });
    //     it('correctly print model with long named enum', () => {
    //       const ast = {
    //         kind: ASTNodeKind.DOCUMENT,
    //         definitions: [
    //           {
    //             values: [
    //               {
    //                 kind: ASTNodeKind.ENUM_VALUE_DEFINITION,
    //                 name: {
    //                   kind: ASTNodeKind.NAME,
    //                   value: 'Branch Office Singapore',
    //                 },
    //               },
    //               {
    //                 kind: ASTNodeKind.ENUM_VALUE_DEFINITION,
    //                 name: {
    //                   kind: ASTNodeKind.NAME,
    //                   value: "Private Company 'Limited' by Shares (Pte. Ltd.)",
    //                 },
    //               },
    //               {
    //                 kind: ASTNodeKind.ENUM_VALUE_DEFINITION,
    //                 name: {
    //                   kind: ASTNodeKind.NAME,
    //                   value: '+ amount',
    //                 },
    //               },
    //               {
    //                 kind: ASTNodeKind.ENUM_VALUE_DEFINITION,
    //                 name: {
    //                   kind: ASTNodeKind.NAME,
    //                   value: 'b-office-singapore',
    //                 },
    //               },
    //             ],
    //             name: {
    //               kind: ASTNodeKind.NAME,
    //               value: 'CompanyType',
    //             },
    //             kind: ASTNodeKind.ENUM_TYPE_DEFINITION,
    //           },
    //         ],
    //       };
    //       const printed = print(ast);

    //       expect(printed).toEqual(dedent`
    // CompanyType (
    //   Branch Office Singapore |
    //   Private Company 'Limited' by Shares (Pte. Ltd.) |
    //   + amount |
    //   b-office-singapore
    // )
    // `);
    //     });
    //     it('correctly print model with complicated inline enums', () => {
    //       const ast = {
    //         kind: ASTNodeKind.DOCUMENT,
    //         definitions: [
    //           {
    //             fields: [
    //               {
    //                 omitted: true,
    //                 optional: true,
    //                 kind: ASTNodeKind.FIELD_DEFINITION,
    //                 name: {
    //                   kind: ASTNodeKind.NAME,
    //                   value: 'name',
    //                 },
    //                 type: {
    //                   kind: ASTNodeKind.LIST_TYPE,
    //                   type: {
    //                     kind: ASTNodeKind.NAMED_TYPE,
    //                     name: {
    //                       kind: ASTNodeKind.NAME,
    //                       value: 's',
    //                     },
    //                   },
    //                 },
    //               },
    //               {
    //                 omitted: false,
    //                 optional: true,
    //                 kind: ASTNodeKind.FIELD_DEFINITION,
    //                 name: {
    //                   kind: ASTNodeKind.NAME,
    //                   value: 'type',
    //                 },
    //                 type: {
    //                   kind: ASTNodeKind.ENUM_INLINE_TYPE_DEFINITION,
    //                   values: [
    //                     {
    //                       kind: ASTNodeKind.ENUM_VALUE_DEFINITION,
    //                       name: { kind: ASTNodeKind.NAME, value: '+ amount' },
    //                     },
    //                     {
    //                       kind: ASTNodeKind.ENUM_VALUE_DEFINITION,
    //                       name: { kind: ASTNodeKind.NAME, value: '- amount' },
    //                     },
    //                     {
    //                       kind: ASTNodeKind.ENUM_VALUE_DEFINITION,
    //                       name: { kind: ASTNodeKind.NAME, value: 'summ +' },
    //                     },
    //                     {
    //                       kind: ASTNodeKind.ENUM_VALUE_DEFINITION,
    //                       name: {
    //                         kind: ASTNodeKind.NAME,
    //                         value: "Private Company 'Limited' by Shares (Pte. Ltd.)",
    //                       },
    //                     },
    //                   ],
    //                 },
    //               },
    //               {
    //                 omitted: false,
    //                 optional: false,
    //                 kind: ASTNodeKind.FIELD_DEFINITION,
    //                 name: {
    //                   kind: ASTNodeKind.NAME,
    //                   value: 'kek',
    //                 },
    //                 type: {
    //                   strict: false,
    //                   kind: ASTNodeKind.OBJECT_TYPE_DEFINITION,
    //                   fields: [
    //                     {
    //                       kind: ASTNodeKind.FIELD_DEFINITION,
    //                       name: {
    //                         kind: ASTNodeKind.NAME,
    //                         value: 'conversationId',
    //                       },
    //                       omitted: false,
    //                       optional: false,
    //                       type: {
    //                         kind: ASTNodeKind.NAMED_TYPE,
    //                         name: {
    //                           kind: ASTNodeKind.NAME,
    //                           value: 'i',
    //                         },
    //                       },
    //                     },
    //                     {
    //                       kind: ASTNodeKind.FIELD_DEFINITION,
    //                       name: {
    //                         kind: ASTNodeKind.NAME,
    //                         value: 'users',
    //                       },
    //                       omitted: false,
    //                       optional: false,
    //                       type: {
    //                         kind: ASTNodeKind.LIST_TYPE,
    //                         type: {
    //                           strict: false,
    //                           kind: ASTNodeKind.OBJECT_TYPE_DEFINITION,
    //                           fields: [
    //                             {
    //                               kind: ASTNodeKind.FIELD_DEFINITION,
    //                               name: {
    //                                 kind: ASTNodeKind.NAME,
    //                                 value: 'id',
    //                               },
    //                               omitted: false,
    //                               optional: false,
    //                               type: {
    //                                 kind: ASTNodeKind.NAMED_TYPE,
    //                                 name: {
    //                                   kind: ASTNodeKind.NAME,
    //                                   value: 'i',
    //                                 },
    //                               },
    //                             },
    //                             {
    //                               kind: ASTNodeKind.FIELD_DEFINITION,
    //                               name: {
    //                                 kind: ASTNodeKind.NAME,
    //                                 value: 'nickname',
    //                               },
    //                               omitted: false,
    //                               optional: false,
    //                               type: {
    //                                 kind: ASTNodeKind.NAMED_TYPE,
    //                                 name: {
    //                                   kind: ASTNodeKind.NAME,
    //                                   value: undefined,
    //                                 },
    //                               },
    //                             },
    //                             {
    //                               kind: ASTNodeKind.FIELD_DEFINITION,
    //                               name: {
    //                                 kind: ASTNodeKind.NAME,
    //                                 value: 'avatar',
    //                               },
    //                               omitted: false,
    //                               optional: true,
    //                               type: {
    //                                 kind: ASTNodeKind.NAMED_TYPE,
    //                                 name: {
    //                                   kind: ASTNodeKind.NAME,
    //                                   value: undefined,
    //                                 },
    //                               },
    //                             },
    //                           ],
    //                         },
    //                       },
    //                     },
    //                   ],
    //                 },
    //               },
    //               {
    //                 omitted: false,
    //                 optional: false,
    //                 kind: ASTNodeKind.FIELD_DEFINITION,
    //                 name: {
    //                   kind: ASTNodeKind.NAME,
    //                   value: 'surname',
    //                 },
    //                 type: {
    //                   kind: ASTNodeKind.LIST_TYPE,
    //                   type: {
    //                     kind: ASTNodeKind.NAMED_TYPE,
    //                     name: {
    //                       kind: ASTNodeKind.NAME,
    //                       value: 'b',
    //                     },
    //                   },
    //                 },
    //               },
    //             ],
    //             name: {
    //               kind: ASTNodeKind.NAME,
    //               value: 'AcDocument',
    //             },
    //             extendsModels: [
    //               {
    //                 kind: ASTNodeKind.NAMED_TYPE,
    //                 name: { kind: ASTNodeKind.NAME, value: 'Kek' },
    //               },
    //               {
    //                 kind: ASTNodeKind.NAMED_TYPE,
    //                 name: { kind: ASTNodeKind.NAME, value: 'Lel' },
    //               },
    //             ],
    //             kind: ASTNodeKind.MODEL_TYPE_DEFINITION,
    //             strict: true,
    //             description: undefined,
    //           },
    //         ],
    //       };
    //       const printed = print(ast);

    //       expect(printed).toEqual(dedent`
    // AcDocument < Kek, Lel !{
    //   -name?: s[],
    //   type?: (
    //     + amount |
    //     - amount |
    //     summ + |
    //     Private Company 'Limited' by Shares (Pte. Ltd.)
    //   ),
    //   kek: {
    //     conversationId: i,
    //     users: {
    //       id: i,
    //       nickname,
    //       avatar?,
    //     }[],
    //   },
    //   surname: b[],
    // }
    // `);
    //     });
    //     it('correctly print model that uses named enum', () => {
    //       const EnumA: EnumTypeDefinitionNode = {
    //         values: [
    //           {
    //             kind: ASTNodeKind.ENUM_VALUE_DEFINITION,
    //             name: {
    //               kind: ASTNodeKind.NAME,
    //               value: 'f',
    //             },
    //           },
    //           {
    //             kind: ASTNodeKind.ENUM_VALUE_DEFINITION,
    //             name: {
    //               kind: ASTNodeKind.NAME,
    //               value: 'b',
    //             },
    //           },
    //         ],
    //         name: {
    //           kind: ASTNodeKind.NAME,
    //           value: 'A',
    //         },
    //         kind: ASTNodeKind.ENUM_TYPE_DEFINITION,
    //       };

    //       const EnumB: EnumTypeDefinitionNode = {
    //         values: [
    //           {
    //             kind: ASTNodeKind.ENUM_VALUE_DEFINITION,
    //             name: {
    //               kind: ASTNodeKind.NAME,
    //               value: 'c',
    //             },
    //           },
    //           {
    //             kind: ASTNodeKind.ENUM_VALUE_DEFINITION,
    //             name: {
    //               kind: ASTNodeKind.NAME,
    //               value: 'd',
    //             },
    //           },
    //         ],
    //         name: {
    //           kind: ASTNodeKind.NAME,
    //           value: 'B',
    //         },
    //         kind: ASTNodeKind.ENUM_TYPE_DEFINITION,
    //       };

    //       const MyModel: ModelTypeDefinitionNode = {
    //         fields: [
    //           {
    //             omitted: false,
    //             optional: false,
    //             kind: ASTNodeKind.FIELD_DEFINITION,
    //             name: {
    //               kind: ASTNodeKind.NAME,
    //               value: 'color',
    //             },
    //             type: {
    //               kind: ASTNodeKind.NAMED_TYPE,
    //               name: {
    //                 kind: ASTNodeKind.NAME,
    //                 value: 'A',
    //               },
    //             },
    //           },
    //         ],
    //         name: {
    //           kind: ASTNodeKind.NAME,
    //           value: 'MyModel',
    //         },
    //         strict: false,
    //         kind: ASTNodeKind.MODEL_TYPE_DEFINITION,
    //         description: undefined,
    //         extendsModels: [],
    //       };

    //       const ast = {
    //         kind: ASTNodeKind.DOCUMENT,
    //         definitions: [EnumA, MyModel, EnumB],
    //       };

    //       const printed = print(ast);

    //       expect(printed).toEqual(dedent`
    //       A (
    //         f |
    //         b
    //       )

    //       MyModel {
    //         color: A,
    //       }

    //       B (
    //         c |
    //         d
    //       )
    // `);
    //     });
    //   });
    //   describe('throw error', () => {
    //     it('should throw error if trying use print on ast with EndpointNamespaceTypeDefinition', () => {
    //       const ast = {
    //         kind: ASTNodeKind.DOCUMENT,
    //         definitions: [
    //           {
    //             kind: ASTNodeKind.ENDPOINT_NAMESPACE_TYPE_DEFINITION,
    //             endpoints: [
    //               {
    //                 kind: ASTNodeKind.ENDPOINT_TYPE_DEFINITION,
    //                 verb: {
    //                   kind: ASTNodeKind.ENDPOINT_VERB,
    //                   name: { kind: ASTNodeKind.NAME, value: 'POST' },
    //                 },
    //                 url: {
    //                   kind: ASTNodeKind.ENDPOINT_URL,
    //                   name: { kind: ASTNodeKind.NAME, value: '/endpoint' },
    //                   parameters: [
    //                     {
    //                       kind: ASTNodeKind.ENDPOINT_PARAMETER,
    //                       type: {
    //                         kind: ASTNodeKind.ENDPOINT_PARAMETER_BODY,
    //                         type: {
    //                           kind: ASTNodeKind.NAMED_TYPE,
    //                           name: { kind: ASTNodeKind.NAME, value: 'RequestModel' },
    //                         },
    //                       },
    //                     },
    //                   ],
    //                 },
    //                 responses: [
    //                   {
    //                     status: {
    //                       kind: ASTNodeKind.ENDPOINT_STATUS_CODE,
    //                       name: {
    //                         kind: ASTNodeKind.NAME,
    //                         value: '200',
    //                       },
    //                     },
    //                     kind: ASTNodeKind.ENDPOINT_RESPONSE,
    //                     type: {
    //                       kind: ASTNodeKind.NAMED_TYPE,
    //                       name: {
    //                         kind: ASTNodeKind.NAME,
    //                         value: 'ResponseModel',
    //                       },
    //                     },
    //                   },
    //                 ],
    //               },
    //             ],
    //           },
    //         ],
    //       };

    //       expect(() => print(ast)).toThrow();
    //     });
  });
});
