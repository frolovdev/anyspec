import { toJSONDeep } from '../../../utils';
import { endpointsRecommendedBodyParameterPostfix } from '../recommended/endpointsRecommendedBodyParameterPostfix.rule';
import { expectValidationErrors } from './fixtures';

function getErrors(queryStr: string) {
  return expectValidationErrors(endpointsRecommendedBodyParameterPostfix, queryStr, 'endpoints');
}

function expectValid(queryStr: string) {
  const errors = getErrors(queryStr);

  expect(errors).toEqual([]);
}

describe(__filename, () => {
  it('should be valid', () => {
    expectValid(`
POST /endpoint RequestCreateRequestBody
PATCH /endpoint2 RequestUpdateRequestBody
GET /endpoint3 Request
`);
  });
  it('should be invalid', () => {
    const errors = getErrors(
      `
POST /endpoint Request
PATCH /endpoint2 Request
\`tag\`:
  POST /endpoint Request
  PATCH /endpoint2 Request
`,
    );

    expect(toJSONDeep(errors)).toMatchObject([
      {
        locations: [{ line: 2, column: 16 }],
        message: 'POST body parameter should ends with CreateRequestBody postfix',
      },
      {
        locations: [{ line: 3, column: 18 }],
        message: 'PATCH body parameter should ends with UpdateRequestBody postfix',
      },
      {
        locations: [{ line: 5, column: 18 }],
        message: 'POST body parameter should ends with CreateRequestBody postfix',
      },
      {
        locations: [{ line: 6, column: 20 }],
        message: 'PATCH body parameter should ends with UpdateRequestBody postfix',
      },
    ]);
  });
});
