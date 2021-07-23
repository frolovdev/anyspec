import { toJSONDeep } from '../../../utils';
import { RecommendedFilterPostfix } from '../recommended/recommendedFilterPostfix.rule';
import { expectValidationErrors } from './fixtures';

function getErrors(queryStr: string) {
  return expectValidationErrors(RecommendedFilterPostfix, queryStr);
}

function expectValid(queryStr: string) {
  const errors = getErrors(queryStr);

  expect(errors).toEqual([]);
}

describe(__filename, () => {
  it('should be valid', () => {
    expectValid(`
    BkConnectionIndexRequestQuery !{
        filter: BkConnectionFilter,
    }
      
    BkConnectionFilter {}
`);
  });

  it('should be valid v2', () => {
    expectValid(`
    BkConnectionIndexRequestQuery !{
        filter,
    }
`);
  });
  it('should be valid v3', () => {
    expectValid(`
    BkConnectionIndexRequestQuery !{
        filter: s,
    }
`);
  });
  it('should be invalid', () => {
    const errors = getErrors(
      `
    BkConnectionIndexRequestQuery !{
        filter: BkConnection,
    }
      
    BkConnectionFilter {}
`,
    );

    expect(toJSONDeep(errors)).toMatchObject([
      {
        locations: [{ line: 3, column: 17 }],
        message:
          'Type name of filter field should ends with Filter postfix, did you mean BkConnectionFilter',
      },
    ]);
  });
});
