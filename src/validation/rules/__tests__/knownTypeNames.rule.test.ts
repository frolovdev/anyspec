import { specifiedScalarTypes } from 'runtypes';
import { toJSONDeep } from 'utils';
import { KnownTypeNamesRule } from '../knownTypeNames.rule';
import { expectValidationErrors } from './fixtures';

function getErrors(queryStr: string) {
  return expectValidationErrors(KnownTypeNamesRule, queryStr);
}

function expectValid(queryStr: string) {
  const errors = getErrors(queryStr);

  expect(errors).toEqual([]);
}

describe(__filename, () => {
  it('known type names are valid', () => {
    expectValid(`
      Doc {
        a: b
      }
    `);
  });

  it('all knwon types are valid', () => {
    specifiedScalarTypes.forEach((type) =>
      expectValid(`
    Doc {
      a: ${type}
    }
  `),
    );
  });

  it('unkown type names are invalid', () => {
    const errors = getErrors(`
      Doc {
        name: ew,
        m: eqweqw,
        c: integerr
      }
    `);

    expect(toJSONDeep(errors)).toMatchObject([
      {
        message: 'Unknown type "ew".',
        locations: [{ line: 3, column: 15 }],
      },
      {
        message: 'Unknown type "eqweqw".',
        locations: [{ line: 4, column: 12 }],
      },
      {
        message: 'Unknown type "integerr". Did you mean "integer"?',
        locations: [{ line: 5, column: 12 }],
      },
    ]);
  });
});
