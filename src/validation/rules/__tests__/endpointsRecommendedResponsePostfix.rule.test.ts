import { toJSONDeep } from '../../../utils';
import { endpointsRecommendedResponsePostfix } from '../recommended/endpointsRecommendedResponsePostfix.rule';
import { expectValidationErrors } from './fixtures';

function getErrors(queryStr: string) {
  return expectValidationErrors(endpointsRecommendedResponsePostfix, queryStr, 'endpoints');
}

function expectValid(queryStr: string) {
  const errors = getErrors(queryStr);

  expect(errors).toEqual([]);
}

describe(__filename, () => {
  it('should be valid', () => {
    expectValid(`
GET /endpoint
  => ResponseModelResponse
`);
  });

  it('should be invalid', () => {
    const errors = getErrors(
      `
GET /endpoint
  => ResponseModel
`,
    );

    expect(toJSONDeep(errors)).toMatchObject([
      {
        locations: [{ line: 3, column: 19 }],
        message: 'Request model should ends with Response postfix, e.g. SomeTypeResponse',
      },
    ]);
  });
});
