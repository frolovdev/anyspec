import { toJSONDeep } from '../../../utils';
import { RecommendedFilterPostfix } from '../recommended/recomendedFilterPostfix.rule';
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
        message: 'Type name of filter should end with Filter prefix',
      },
    ]);
  });
});
