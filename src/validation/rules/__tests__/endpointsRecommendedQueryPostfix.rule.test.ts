import { toJSONDeep } from '../../../utils';
import { endpointsRecommendedQueryPostfix } from '../recommended/endpointsRecommendedQueryPostfix.rule';
import { expectValidationErrors } from './fixtures';

function getErrors(queryStr: string) {
  return expectValidationErrors(endpointsRecommendedQueryPostfix, queryStr, 'endpoints');
}

function expectValid(queryStr: string) {
  const errors = getErrors(queryStr);

  expect(errors).toEqual([]);
}

describe(__filename, () => {
  it('should be valid', () => {
    expectValid(`
POST /analytics_events?AnalyticsRequestQuery
    => AnalyticsEventNewResponse
`);
  });
  it('should be invalid', () => {
    const errors = getErrors(
      `
POST /analytics_events?Analytics
    => AnalyticsEventNewResponse
`,
    );

    expect(toJSONDeep(errors)).toMatchObject([
      {
        locations: [{ line: 2, column: 33 }],
        message: 'Query model should ends with RequestQuery postfix, e.g. SomeTypeRequestQuery',
      },
    ]);
  });
});
