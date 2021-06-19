import { KnownTypeNamesRule } from '../knownTypeNames.rule';
import { expectValidationErrors } from './fixtures';

function expectErrors(queryStr: string) {
  return expectValidationErrors(KnownTypeNamesRule, queryStr);
}

function expectValid(queryStr: string) {
  expectErrors(queryStr).toEqual([]);
}

describe(__filename, () => {
  it('known type names are valid', () => {
    expectValid(`
      Doc {
        a: b
      }
    `);
  });
});
