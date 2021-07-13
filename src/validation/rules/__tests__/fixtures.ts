import { parse } from '../../../language';
import { AnySpecSchema } from '../../../runtypes';
import { validate } from '../../validate';
import { ValidationRule } from '../../validationContext';

export function expectValidationErrorsWithSchema(rule: ValidationRule, queryStr: string): any {
  const doc = parse(queryStr);

  const schema = new AnySpecSchema({ ast: doc });
  const errors = validate(schema, doc, [rule]);

  return errors;
}

export function expectValidationErrors(rule: ValidationRule, queryStr: string): any {
  return expectValidationErrorsWithSchema(rule, queryStr);
}
