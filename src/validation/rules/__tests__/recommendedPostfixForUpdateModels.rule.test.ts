import { validate } from '../..';
import { ASTNodeKind, parse, Source } from '../../../language';
import { AnySpecSchema } from '../../../runtypes';
import { toJSONDeep } from '../../../utils';
import { RecommendedPostfixForUpdateModels } from '../recommended/recommendedPostfixForUpdateModels.rule';

describe(__filename, () => {
  it('should be valid', () => {
    const endpointString = `
PATCH /endpoint RequestModel
    => ResponseModel
`;

    const modelString = `
RequestModel {
    connection: ConnectionUpdate
}
`;

    const sourceEndpoints = new Source({
      body: endpointString,
      name: 'endpoints-source',
      sourceType: 'endpoints',
    });

    const sourceModels = new Source({
      body: modelString,
      name: 'endpoints-model',
      sourceType: 'models',
    });

    const astEndpoints = parse(sourceEndpoints);
    const astModels = parse(sourceModels);

    const combined = {
      kind: ASTNodeKind.DOCUMENT,
      definitions: [...astEndpoints.definitions, ...astModels.definitions],
    };

    const schema = new AnySpecSchema({ ast: combined });

    const errors = validate(schema, combined, [RecommendedPostfixForUpdateModels]);

    expect(errors).toEqual([]);
  });

  it('should be invalid', () => {
    const endpointString = `
PATCH /endpoint RequestModel
    => ResponseModel
`;

    const modelString = `
RequestModel {
    connection: Connection
}
`;

    const sourceEndpoints = new Source({
      body: endpointString,
      name: 'endpoints-source',
      sourceType: 'endpoints',
    });

    const sourceModels = new Source({
      body: modelString,
      name: 'endpoints-model',
      sourceType: 'models',
    });

    const astEndpoints = parse(sourceEndpoints);
    const astModels = parse(sourceModels);

    const combined = {
      kind: ASTNodeKind.DOCUMENT,
      definitions: [...astEndpoints.definitions, ...astModels.definitions],
    };

    const schema = new AnySpecSchema({ ast: combined });

    const errors = validate(schema, combined, [RecommendedPostfixForUpdateModels]);

    expect(toJSONDeep(errors)).toEqual([
      {
        locations: [{ line: 3, column: 17 }],
        message:
          'Type name of update field should ends with Update postfix, did you mean ConnectionUpdate',
      },
    ]);
  });
});
