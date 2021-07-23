import { toJSONDeep } from '../../../utils';
import { recommendedBodyModelName } from '../recommended/recommendedBodyModelName.rule';
import { expectValidationErrors } from './fixtures';

function getErrors(queryStr: string) {
  return expectValidationErrors(recommendedBodyModelName, queryStr);
}

function expectValid(queryStr: string) {
  const errors = getErrors(queryStr);

  expect(errors).toEqual([]);
}

describe(__filename, () => {
  it('should be valid', () => {
    expectValid(`
    Model {
        body: ModelRequestBody,
    }
      
    ModelRequestBody {}
`);
  });

  it('should be valid v2', () => {
    expectValid(`
    Model {
        body,
    }
      
    ModelRequestBody {}
`);
  });

  it('should be valid v3', () => {
    expectValid(`
    Model {
        body: s,
    }
      
    ModelRequestBody {}
`);
  });

  it('should be invalid', () => {
    const errors = getErrors(
      `
    Other {
        body: ModelRequestBody,
    }
      
    ModelRequestBody {}
`,
    );

    expect(toJSONDeep(errors)).toMatchObject([
      {
        locations: [{ line: 2, column: 5 }],
        message:
          'Name of model "Other" should be substring of "body" parameter type "ModelRequestBody", e.g. Model { body: ModelRequestBody }',
      },
    ]);
  });
});
