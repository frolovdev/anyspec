import { validate } from '../..';
import { ASTNodeKind, parse, Source } from '../../../language';
import { AnySpecSchema } from '../../../runtypes';
import { toJSONDeep } from '../../../utils';
import { RecommendedPostfixForCreateModels } from '../recommended/recommendedPostfixForCreateModels.rule';

describe(__filename, () => {
  it('should be valid', () => {
    const endpointString = `
POST /endpoint RequestModel
    => ResponseModel
`;

    const modelString = `
RequestModel {
    connection: ConnectionNew
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

    const errors = validate(schema, combined, [RecommendedPostfixForCreateModels]);

    expect(errors).toEqual([]);
  });

  it('should be invalid', () => {
    const endpointString = `
POST /endpoint RequestModel
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

    const errors = validate(schema, combined, [RecommendedPostfixForCreateModels]);

    expect(toJSONDeep(errors)).toEqual([
      {
        locations: [{ line: 3, column: 17 }],
        message:
          'Type name of create field should ends with New postfix, did you mean ConnectionNew',
      },
    ]);
  });
});
