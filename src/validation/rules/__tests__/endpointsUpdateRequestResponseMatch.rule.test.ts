import { validate } from '../..';
import { ASTNodeKind, parse, Source } from '../../../language';
import { concatAST } from '../../../language/concatAST';
import { AnySpecSchema } from '../../../runtypes';
import { toJSONDeep } from '../../../utils';
import { endpointsUpdateRequestResponseMatch } from '../recommended/endpointsUpdateRequestResponseMatch.rule';

describe(__filename, () => {
  describe('valid', () => {
    it('should be valid', () => {
      const endpointString = `
PATCH /endpoint ConnectionUpdateRequestBody
    => ConnectionResponse
`;

      const modelString = `
  ConnectionUpdateRequestBody {
      field: string,
      field2: string,
  }
  ConnectionResponse {
      field: string,
      field2: string,
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

      const errors = validate(schema, combined, [endpointsUpdateRequestResponseMatch]);

      expect(errors).toEqual([]);
    });

    it('should be valid with shorten and default type names', () => {
      const endpointString = `
PATCH /endpoint ConnectionUpdateRequestBody
    => ConnectionResponse
`;

      const modelString = `
  ConnectionUpdateRequestBody {
      field,
      field2: i,
      field3: b,
      field4: o,
      field5: f,
      field6: d,
      field7: t,
      field8: j,
      field9: s,
  }
  ConnectionResponse {
      field: string,
      field2: integer,
      field3: boolean,
      field4: object,
      field5: float,
      field6: date,
      field7: text,
      field8: json,
      field8: string,
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

      const errors = validate(schema, combined, [endpointsUpdateRequestResponseMatch]);

      expect(errors).toEqual([]);
    });

    it('should be valid with inline model in request', () => {
      const endpointString = `
PATCH /endpoint { field: string, field2: string }
    => ConnectionResponse
`;

      const modelString = `
  ConnectionResponse {
      field: string,
      field2: string,
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

      const errors = validate(schema, combined, [endpointsUpdateRequestResponseMatch]);

      expect(errors).toEqual([]);
    });

    it('should be valid with inline model in response', () => {
      const endpointString = `
PATCH /endpoint ConnectionUpdateRequestBody
    => { field: string, field2: string }
`;

      const modelString = `
  ConnectionUpdateRequestBody {
      field: string,
      field2: string,
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

      const errors = validate(schema, combined, [endpointsUpdateRequestResponseMatch]);

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

      const errors = validate(schema, astEndpoints, [endpointsUpdateRequestResponseMatch]);

      expect(errors).toEqual([]);
    });

    it('should ignore inline types', () => {
      const endpointString = `
PATCH /endpoint ConnectionUpdateRequestBody
    => ConnectionResponse
`;

      const modelString = `
  ConnectionUpdateRequestBody {
      field: {a: s},
      field2: string,
  }
  ConnectionResponse {
      field: {c: number},
      field2: string,
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

      const errors = validate(schema, combined, [endpointsUpdateRequestResponseMatch]);

      expect(errors).toEqual([]);
    });
    it('should ignore named model types', () => {
      const endpointString = `
PATCH /endpoint ModelUpdate
  => ModelResponse
`;

      const modelString = `
ModelResponse {
  entity: Model,
}

Model {
  field1: number,
  field2: number,
}

ModelUpdate {
  entity: {
    field1: string,
    field2: number,
  },
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

      const errors = validate(schema, combined, [endpointsUpdateRequestResponseMatch]);

      expect(errors).toEqual([]);
    });
  });
  describe('invalid', () => {
    it('should be invalid', () => {
      const endpointString = `
PATCH /endpoint ConnectionUpdateRequestBody
    => ConnectionResponse
`;

      const modelString = `
  ConnectionUpdateRequestBody {
      field: number,
      field2: string,
  }
  ConnectionResponse {
      field: string,
      field2: string,
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

      const errors = validate(schema, combined, [endpointsUpdateRequestResponseMatch]);

      expect(toJSONDeep(errors)).toEqual([
        {
          locations: [{ line: 3, column: 8 }],
          message: 'In PATCH endpoints Response should match with RequestBody',
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
      field: string,
      field2: string,
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

      const errors = validate(schema, combined, [endpointsUpdateRequestResponseMatch]);

      expect(toJSONDeep(errors)).toEqual([
        {
          locations: [{ line: 3, column: 8 }],
          message: 'In PATCH endpoints Response should match with RequestBody',
        },
      ]);
    });
    it('should be invalid with inline model in response', () => {
      const endpointString = `
PATCH /endpoint ConnectionUpdateRequestBody
    => { field: string, field2: string }
`;

      const modelString = `
  ConnectionUpdateRequestBody {
      field: string,
      field2: number,
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

      const errors = validate(schema, combined, [endpointsUpdateRequestResponseMatch]);

      expect(toJSONDeep(errors)).toEqual([
        {
          locations: [{ line: 3, column: 8 }],
          message: 'In PATCH endpoints Response should match with RequestBody',
        },
      ]);
    });
    it('should be invalid with inline models', () => {
      const endpointString = `
PATCH /endpoint { field: string, field2: number }
    => { field: number, field2: string }
`;

      const sourceEndpoints = new Source({
        body: endpointString,
        name: 'endpoints-source',
        sourceType: 'endpoints',
      });

      const astEndpoints = parse(sourceEndpoints);

      const schema = new AnySpecSchema({ ast: astEndpoints });

      const errors = validate(schema, astEndpoints, [endpointsUpdateRequestResponseMatch]);

      expect(toJSONDeep(errors)).toEqual([
        {
          locations: [{ line: 3, column: 8 }],
          message: 'In PATCH endpoints Response should match with RequestBody',
        },
      ]);
    });
    it('should be invalid with inline models with non matching fields', () => {
      const endpointString = `
PATCH /endpoint { field: string, field2: string }
    => { field: string, field3: string }
`;

      const sourceEndpoints = new Source({
        body: endpointString,
        name: 'endpoints-source',
        sourceType: 'endpoints',
      });

      const astEndpoints = parse(sourceEndpoints);

      const schema = new AnySpecSchema({ ast: astEndpoints });

      const errors = validate(schema, astEndpoints, [endpointsUpdateRequestResponseMatch]);
      expect(toJSONDeep(errors)).toEqual([
        {
          locations: [{ line: 3, column: 8 }],
          message: 'In PATCH endpoints Response should match with RequestBody',
        },
      ]);
    });
  });
});
