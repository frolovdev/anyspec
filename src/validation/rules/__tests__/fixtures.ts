import { Source } from './../../../language/source';
import { parse } from '../../../language';
import { AnySpecSchema } from '../../../runtypes';
import { validate } from '../../validate';
import { ValidationRule } from '../../validationContext';

export function expectValidationErrorsWithSchema(
  rule: ValidationRule,
  queryStr: string,
  sourceType: 'endpoints' | 'models',
): any {
  const source = new Source({ body: queryStr, sourceType });
  const doc = parse(source);

  const schema = new AnySpecSchema({ ast: doc });
  const errors = validate(schema, doc, [rule]);

  return errors;
}

export function expectValidationErrors(
  rule: ValidationRule,
  queryStr: string,
  sourceType: 'endpoints' | 'models' = 'models',
): any {
  return expectValidationErrorsWithSchema(rule, queryStr, sourceType);
}
