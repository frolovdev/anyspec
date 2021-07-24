import { toJSONDeep } from '../../../utils';
import { noExplicitStringRule } from '../base';
import { expectValidationErrors } from './fixtures';

function getErrors(queryStr: string) {
  return expectValidationErrors(noExplicitStringRule, queryStr);
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
        locations: [{ line: 3, column: 16 }],
        message: 'No need to explicitly specify string type since it is the default',
      },
    ]);
  });
});
