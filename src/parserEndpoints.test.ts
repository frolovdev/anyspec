import { ASTNode } from './language/ast';
import { ASTNodeKind, EnumTypeDefinitionNode, ModelTypeDefinitionNode } from './language';
import { AnySpecError } from './error/AnySpecError';
import { parse as defaultParse } from './parser';
import { toJSONDeep, log } from './utils';
import { Source } from 'source';

const parse = (source: string | Source) => defaultParse(source, { noLocation: true });

describe(__filename, () => {
  describe('endpoints', () => {
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
                        kind: ASTNodeKind.OBJECT_TYPE_DEFINITION,
                        name: { kind: ASTNodeKind.NAME, value: 'RequestModel' },
                      },
                    },
                  ],
                },
                responses: [
                  {
                    kind: ASTNodeKind.ENDPOINT_RESPONSE,
                    type: {
                      kind: ASTNodeKind.ENDPOINT_PARAMETER_BODY,
                      name: {
                        kind: ASTNodeKind.NAME,
                        value: 'ConversationResponse',
                      },
                    },
                  },
                ],
              },
            ],
          },
        ],
      };

      const source = new Source(
        sourceString,
        'Tinyspec endpoints code',
        { line: 1, column: 1 },
        'endpoints',
      );

      const ast = () => parse(source);

      console.log(ast());
      expect(ast).toThrowError(AnySpecError);
    });
  });
});
