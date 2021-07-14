import { toJSONDeep } from '../../../utils';
import { RecommendedModelBodyFieldPostfix } from '../recommended/recommendedModelBodyFieldPostfix.rule';
import { expectValidationErrors } from './fixtures';

function getErrors(queryStr: string) {
  return expectValidationErrors(RecommendedModelBodyFieldPostfix, queryStr);
}

function expectValid(queryStr: string) {
  const errors = getErrors(queryStr);

  expect(errors).toEqual([]);
}

describe(__filename, () => {
  it('should be valid', () => {
    expectValid(`
    RequestQuery {
        body: RequestQueryRequestBody,
    }
      
    RequestQueryRequestBody {}
`);
  });

  it('should be invalid', () => {
    const errors = getErrors(
      `
    RequestQuery {
        body: RequestQuery,
    }
      
    RequestQuery {}
`,
    );

    expect(toJSONDeep(errors)).toMatchObject([
      {
        locations: [{ line: 3, column: 15 }],
        message:
          'Type name of body field should ends with RequestBody postfix, did you mean RequestQueryRequestBody',
      },
    ]);
  });
});
