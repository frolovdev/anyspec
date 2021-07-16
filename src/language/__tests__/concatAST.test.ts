import { parse } from '../../language/parser';
import { Source } from '../../language/source';
import { ASTNodeKind } from '../ast';

import { concatAST } from '../concatAST';

describe('concatAST', () => {
  it('concatenates two ASTs together', () => {
    const sourceA = new Source({
      body: `
      Lel {}
    `,
    });

    const sourceB = new Source({
      body: `
    Kek {}
  `,
    });

    const astA = parse(sourceA);
    const astB = parse(sourceB);
    const astC = concatAST([astA, astB]);

    expect(astC).toMatchObject({
      kind: ASTNodeKind.DOCUMENT,
      definitions: [
        {
          fields: [],
          name: {
            kind: ASTNodeKind.NAME,
            value: 'Lel',
          },
          kind: ASTNodeKind.MODEL_TYPE_DEFINITION,
          strict: false,
          extendsModels: [],
        },
        {
          fields: [],
          name: {
            kind: ASTNodeKind.NAME,
            value: 'Kek',
          },
          kind: ASTNodeKind.MODEL_TYPE_DEFINITION,
          strict: false,
          extendsModels: [],
        },
      ],
    });
  });
});
