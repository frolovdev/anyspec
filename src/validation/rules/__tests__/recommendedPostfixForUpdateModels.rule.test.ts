import { validate } from '../..';
import { ASTNodeKind, parse, Source } from '../../../language';
import { concatAST } from '../../../language/concatAST';
import { AnySpecSchema } from '../../../runtypes';
import { toJSONDeep } from '../../../utils';
import { recommendedPostfixForUpdateModels } from '../recommended/recommendedPostfixForUpdateModels.rule';

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

    const combined = concatAST([astEndpoints, astModels]);
    const schema = new AnySpecSchema({ ast: combined });

    const errors = validate(schema, combined, [recommendedPostfixForUpdateModels]);

    expect(errors).toEqual([]);
  });

  it('should be valid with scalar types', () => {
    const endpointString = `
PATCH /endpoint RequestModel
    => ResponseModel
`;

    const modelString = `
RequestModel {
    connection: s,
    referralCode
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

    const combined = concatAST([astEndpoints, astModels]);

    const schema = new AnySpecSchema({ ast: combined });

    const errors = validate(schema, combined, [recommendedPostfixForUpdateModels]);

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

    // TODO: remove after #58
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

    const combined = concatAST([astEndpoints, astModels]);

    const schema = new AnySpecSchema({ ast: combined });

    const errors = validate(schema, combined, [recommendedPostfixForUpdateModels]);

    expect(toJSONDeep(errors)).toEqual([
      {
        locations: [{ line: 3, column: 17 }],
        message:
          'Type name of update field should ends with Update postfix, did you mean ConnectionUpdate',
      },
    ]);
  });
});
