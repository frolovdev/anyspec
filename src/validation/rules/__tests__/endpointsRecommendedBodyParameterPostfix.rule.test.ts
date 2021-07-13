import { toJSONDeep } from '../../../utils';
import { EndpointsRecommendedQueryPostfix } from '../recommended/endpointsRecommendedBodyParameterPostfix.rule';
import { expectValidationErrors } from './fixtures';

function getErrors(queryStr: string) {
  return expectValidationErrors(EndpointsRecommendedQueryPostfix, queryStr, 'endpoints');
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
`,
    );

    expect(toJSONDeep(errors)).toMatchObject([
      {
        message: 'POST body parameter should ends with CreateRequestBody postfix',
      },
      {
        message: 'PATCH body parameter should ends with UpdateRequestBody postfix',
      },
    ]);
  });
});
