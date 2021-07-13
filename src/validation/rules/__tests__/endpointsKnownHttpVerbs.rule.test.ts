import { EndpointsKnownHttpVerbs } from '../base/endpointsKnownHttpVerbs.rule';
import { expectValidationErrors } from './fixtures';

function getErrors(queryStr: string) {
  return expectValidationErrors(EndpointsKnownHttpVerbs, queryStr, 'endpoints');
}

function expectValid(queryStr: string) {
  const errors = getErrors(queryStr);

  expect(errors).toEqual([]);
}

function expectInvalidValid(queryStr: string) {
  const errors = getErrors(queryStr);

  expect(errors).toEqual(['shiiit']);
}

describe(__filename, () => {
  it('known type names are valid', () => {
    expectValid(`
NYN /analytics_events AnalyticsEventNewRequest
    => AnalyticsEventNewResponse
`);
  });
});
