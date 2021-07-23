import { validate } from '../..';
import { ASTNodeKind, parse, Source } from '../../../language';
import { concatAST } from '../../../language/concatAST';
import { AnySpecSchema, specifiedScalarTypes } from '../../../runtypes';
import { toJSONDeep } from '../../../utils';
import { KnownTypeNamesRule } from '../base/knownTypeNames.rule';
import { expectValidationErrors } from './fixtures';

function getErrors(queryStr: string) {
  return expectValidationErrors(KnownTypeNamesRule, queryStr);
}

function expectValid(queryStr: string) {
  const errors = getErrors(queryStr);

  expect(errors).toEqual([]);
}

describe(__filename, () => {
  it('known type names are valid', () => {
    expectValid(`
      Doc {
        a: b
      }
    `);
  });

  it('all known types are valid', () => {
    specifiedScalarTypes.forEach((type) =>
      expectValid(`
    Doc {
      a: ${type}
    }
  `),
    );
  });

  it('unknown type names are invalid', () => {
    const errors = getErrors(`
      Doc {
        name: ew,
        m: eqweqw,
        c: integerr
      }
    `);

    expect(toJSONDeep(errors)).toMatchObject([
      {
        message: 'Unknown type "ew".',
        locations: [{ line: 3, column: 15 }],
      },
      {
        message: 'Unknown type "eqweqw".',
        locations: [{ line: 4, column: 12 }],
      },
      {
        message: 'Unknown type "integerr". Did you mean "integer"?',
        locations: [{ line: 5, column: 12 }],
      },
    ]);
  });

  it('unknown model type definition is invalid', () => {
    const errors = getErrors(`
      AcDocument {
        industry: Industry
      }
    
    `);

    expect(toJSONDeep(errors)).toMatchObject([
      {
        locations: [{ line: 3, column: 19 }],
        message: 'Unknown type "Industry".',
      },
    ]);
  });

  it('known model type definitoon is valid', () => {
    expectValid(`


      AcDocument {
        industry: {name: Industry}
      }

      Industry {}
    
    `);
  });

  it('extends unknown model type definition', () => {
    const errors = getErrors(`
    AcDocument < Document {
      
    }
  
  `);

    expect(toJSONDeep(errors)).toMatchObject([
      {
        locations: [{ line: 2, column: 18 }],
        message: 'Unknown type "Document". Did you mean "AcDocument"?',
      },
    ]);
  });

  it('known-type-names rule are work with endpoints, valid', () => {
    const endpointString = `
POST /endpoint RequestModel
  => {a: string, c: b, s}
`;
    const modelString = `
RequestModel {a: string, c: b, s}
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

    const errors = validate(schema, combined, [KnownTypeNamesRule]);

    expect(errors).toEqual([]);
  });

  it('known-type-names rule are work with endpoints, invalid', () => {
    const endpointString = `
POST /endpoint Model
  => RespModel
`;
    const modelString = `
RequestModel {a: string, c: b, s}
ResponseModel {a: string, c: b, s}
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

    const errors = validate(schema, combined, [KnownTypeNamesRule]);

    expect(toJSONDeep(errors)).toMatchObject([
      {
        locations: [{ line: 2, column: 16 }],
        message: 'Unknown type "Model".',
      },
      {
        locations: [{ line: 3, column: 6 }],
        message: 'Unknown type "RespModel". Did you mean "RequestModel" or "ResponseModel"?',
      },
    ]);
  });
});
