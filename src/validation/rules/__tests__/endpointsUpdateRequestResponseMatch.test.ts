import { validate } from '../..';
import { ASTNodeKind, parse, Source } from '../../../language';
import { AnySpecSchema } from '../../../runtypes';
import { toJSONDeep } from '../../../utils';
import { EndpointsUpdateRequestResponseMatch } from '../recommended/endpointsUpdateRequestResponseMatch.rule';

describe(__filename, () => {
  it('should be valid', () => {
    const endpointString = `
PATCH /endpoint ConnectionUpdateRequestBody
    => ConnectionResponse
`;

    const modelString = `
ConnectionUpdateRequestBody {
    field: string
    field2: string
}
ConnectionResponse {
    field: string
    field2: string
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

    const errors = validate(schema, combined, [EndpointsUpdateRequestResponseMatch]);

    expect(errors).toEqual([]);
  });

  it('should be valid with inline model in request', () => {
    const endpointString = `
PATCH /endpoint { field: string, field2: string }
    => ConnectionResponse
`;

    const modelString = `
ConnectionResponse {
    field: string
    field2: string
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

    const errors = validate(schema, combined, [EndpointsUpdateRequestResponseMatch]);

    expect(errors).toEqual([]);
  });

  it('should be valid with inline model in response', () => {
    const endpointString = `
PATCH /endpoint ConnectionUpdateRequestBody
    => { field: string, field2: string }
`;

    const modelString = `
ConnectionUpdateRequestBody {
    field: string
    field2: string
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

    const errors = validate(schema, combined, [EndpointsUpdateRequestResponseMatch]);

    expect(errors).toEqual([]);
  });

  it('should be valid with inline models', () => {
    const endpointString = `
PATCH /endpoint { field: string, field2: string }
    => { field: string, field2: string }
`;

    const sourceEndpoints = new Source({
      body: endpointString,
      name: 'endpoints-source',
      sourceType: 'endpoints',
    });

    const astEndpoints = parse(sourceEndpoints);

    const schema = new AnySpecSchema({ ast: astEndpoints });

    const errors = validate(schema, astEndpoints, [EndpointsUpdateRequestResponseMatch]);

    expect(errors).toEqual([]);
  });

  it('should be invalid', () => {
    const endpointString = `
PATCH /endpoint ConnectionUpdateRequestBody
    => ConnectionResponse
`;

    const modelString = `
ConnectionUpdateRequestBody {
    field: number
    field2: string
}
ConnectionResponse {
    field: string
    field2: number
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

    const combined = {
      kind: ASTNodeKind.DOCUMENT,
      definitions: [...astEndpoints.definitions, ...astModels.definitions],
    };

    const schema = new AnySpecSchema({ ast: combined });

    const errors = validate(schema, combined, [EndpointsUpdateRequestResponseMatch]);

    expect(toJSONDeep(errors)).toEqual([
      {
        locations: [{ line: 3, column: 17 }],
        message:
          'Type name of update field should ends with Update postfix, did you mean ConnectionUpdate',
      },
    ]);
  });
  it('should be invalid with inline model in request', () => {
    const endpointString = `
PATCH /endpoint { field: number, field2: string }
    => ConnectionResponse
`;

    const modelString = `
ConnectionResponse {
    field: string
    field2: string
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

    const errors = validate(schema, combined, [EndpointsUpdateRequestResponseMatch]);

    expect(errors).toEqual([]);
  });
});
