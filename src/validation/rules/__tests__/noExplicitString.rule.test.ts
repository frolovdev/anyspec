import { toJSONDeep } from '../../../utils';
import { NoExplicitStringRule } from '../base';
import { expectValidationErrors } from './fixtures';

function getErrors(queryStr: string) {
  return expectValidationErrors(NoExplicitStringRule, queryStr);
}

function expectValid(queryStr: string) {
  const errors = getErrors(queryStr);

  expect(errors).toEqual([]);
}

describe(__filename, () => {
  it('should be valid', () => {
    expectValid(`
    AcDocument {
        field
    }
`);
  });

  it('should be invalid', () => {
    const errors = getErrors(
      `
      Document {
        field: s
      }
`,
    );

    expect(toJSONDeep(errors)).toMatchObject([
      {
        locations: [{ line: 3, column: 15 }],
        message: 'No need to explicitly specify string type since it is the default',
      },
    ]);
  });
});
