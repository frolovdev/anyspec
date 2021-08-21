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

    it('correctly print strict mode models', () => {
      const source = `
      AcDocument !{
        name?: s[],
        surname: b[],
      }
      `;

      const printed = print(source);

      expect(dedentString(printed)).toEqual(dedent`
    AcDocument !{
      name?: s[],
      surname: b[],
    }
    `);
    });

    it('correctly print extends model', () => {
      const source = `
      
      AcDocument < Kek {
        name?: s[],
        surname: b[],
      }
      `;
      const printed = print(source);

      expect(dedentString(printed)).toEqual(dedent`
    AcDocument < Kek {
      name?: s[],
      surname: b[],
    }
    `);
    });

    it('correctly print with multiple extends model and strict model', () => {
      const source = `AcDocument < Kek, Lel !{
        name?: s[],
        surname: b[],
      }`;
      const printed = print(source);

      expect(dedentString(printed)).toEqual(dedent`
    AcDocument < Kek, Lel !{
      name?: s[],
      surname: b[],
    }
    `);
    });

    it('correctly print model with inline enum', () => {
      const source = `
      AcDocument < Kek, Lel !{
        -name?: s[],
        type?: ( standard | service ),
        surname: b[],
      }
      `;
      const printed = print(source);
      expect(dedentString(printed)).toEqual(dedent`
    AcDocument < Kek, Lel !{
      -name?: s[],
      type?: ( standard | service ),
      surname: b[],
    }
    `);
    });

    it('correctly print model with inline type definitions', () => {
      const source = `AcDocument < Kek, Lel !{
        -name?: s[],
        type?: ( standard | 
          service ),
        kek: {
          conversationId: i,
          users: {
            id:    i,
            nickname,
            avatar?,
          }[],
        },
        surname: b[],
      }`;

      const printed = print(source);
      expect(dedentString(printed)).toEqual(dedent`
    AcDocument < Kek, Lel !{
      -name?: s[],
      type?: ( standard | service ),
      kek: {
        conversationId: i,
        users: {
          id: i,
          nickname,
          avatar?,
        }[],
      },
      surname: b[],
    }
    `);
    });

    it('should print strict nested types correctly', () => {
      const source = `AcDocument < Kek, Lel !{
            pathParameters: !{
              pathParameters: !{},
            },
          }`;
      const printed = print(source);

      expect(dedentString(printed)).toEqual(dedent`
    AcDocument < Kek, Lel !{
      pathParameters: !{
        pathParameters: !{},
      },
    }
    `);
    });

    it('correctly print multiple models', () => {
      const ast = `AcDocument {}

      AcDocument2 {        name}`;

      const printed = print(ast);

      expect(dedentString(printed)).toEqual(dedent`
    AcDocument {}

    AcDocument2 {
      name,
    }
    `);
    });
  });

  describe('enums', () => {
    it('correctly print model with short named enum and description', () => {
      const source = `
      // лул
          // kek
          A ( f | b
          )`;
      const printed = print(source);
      expect(dedentString(printed)).toEqual(dedent`
          // лул
          // kek
          A (
            f |
            b
          )
    `);
    });

    it('correctly print model with long named enum', () => {
      const source = `CompanyType (
        Branch Office Singapore |
        Private Company 'Limited' by Shares (Pte. Ltd.) |
        + amount |
              b-office-singapore
      )`;
      const printed = print(source);
      expect(dedentString(printed)).toEqual(dedent`
    CompanyType (
      Branch Office Singapore |
      Private Company 'Limited' by Shares (Pte. Ltd.) |
      + amount |
      b-office-singapore
    )
    `);
    });

    it('correctly print model with complicated inline enums', () => {
      const source = `AcDocument < Kek, Lel !{
            -name?: s[],
            type?: (
              + amount |
              - amount |
              summ + |
              Private Company 'Limited' by Shares (Pte. Ltd.)
            ),
            kek: {
              conversationId: i,
              users: {
                id: i,
                nickname,
                avatar?,
              }[],
            },
            surname: b[],
          }`;
      const printed = print(source);
      expect(dedentString(printed)).toEqual(dedent`
    AcDocument < Kek, Lel !{
      -name?: s[],
      type?: ( + amount | - amount | summ + | Private Company 'Limited' by Shares (Pte. Ltd.) ),
      kek: {
        conversationId: i,
        users: {
          id: i,
          nickname,
          avatar?,
        }[],
      },
      surname: b[],
    }
    `);
    });
    it('correctly print model that uses named enum', () => {
      const source = `  A (
        f | b
      )
      MyModel {         color: A, }
      B (
        c | d
      )`;
      const printed = print(source);

      expect(dedentString(printed)).toEqual(dedent`
          A (
            f |
            b
          )

          MyModel {
            color: A,
          }

          B (
            c |
            d
          )

    `);
    });
  });
  describe('throw error', () => {
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
