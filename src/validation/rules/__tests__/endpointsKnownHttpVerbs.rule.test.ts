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

GUT /analytics_events AnalyticsEventNewRequest
  => AnalyticsEventNewResponse
`,
    );

    console.log(errors[0].location);

    expect(toJSONDeep(errors)).toMatchObject([
      {
        locations: [{ line: 2, column: 1 }],
        message: 'Unknown http method "YUY". Did you mean "PUT"?',
      },
      {
        locations: [{ line: 8, column: 1 }],
        message: 'Unknown http method "XXX".',
      },
      {
        locations: [{ line: 11, column: 1 }],
        message: 'Unknown http method "GUT". Did you mean "GET" or "PUT"?',
      },
    ]);
  });
});
