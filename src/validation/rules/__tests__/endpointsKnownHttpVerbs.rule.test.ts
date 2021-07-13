import { toJSONDeep } from '../../../utils';
import { EndpointsKnownHttpVerbs } from '../base/endpointsKnownHttpVerbs.rule';
import { expectValidationErrors } from './fixtures';

function getErrors(queryStr: string) {
  return expectValidationErrors(EndpointsKnownHttpVerbs, queryStr, 'endpoints');
}

function expectValid(queryStr: string) {
  const errors = getErrors(queryStr);

  expect(errors).toEqual([]);
}

describe(__filename, () => {
  it('unknown type names are invalid', () => {
    expectValid(`
POST /analytics_events AnalyticsEventNewRequest
    => AnalyticsEventNewResponse
`);
  });
  it('known type names are valid', () => {
    const errors = getErrors(
      `
YUY /analytics_events AnalyticsEventNewRequest
    => AnalyticsEventNewResponse

POST /analytics_events AnalyticsEventNewRequest
  => AnalyticsEventNewResponse

XXX /analytics_events AnalyticsEventNewRequest
  => AnalyticsEventNewResponse
`,
    );

    expect(toJSONDeep(errors)).toMatchObject([
      {
        message: 'Unknown http method "YUY"',
      },

      {
        message: 'Unknown http method "XXX"',
      },
    ]);
  });
});
