import { AnySpecError } from '../error';
import { DocumentNode } from '../language';
import { visit } from '../visitor';

import { AnySpecSchema } from '../runtypes';

import { ValidationRule } from './ValidationContext';
import { ValidationContext } from './ValidationContext';
import { assert } from '../utils';

/**
 * Implements the "Validation" section of the spec.
 *
 * Validation runs synchronously, returning an array of encountered errors, or
 * an empty array if no errors were encountered and the document is valid.
 *
 * A list of specific validation rules may be provided. If not provided, the
 * default list of rules defined by the AnySpec specification will be used.
 *
 * Each validation rules is a function which returns a visitor
 * (see the language/visitor API). Visitor methods are expected to return
 * AnySpecErrors, or Arrays of AnySpecErrors when invalid.
 *
 * Optionally a custom TypeInfo instance may be provided. If not provided, one
 * will be created from the provided schema.
 */
export function validate(
  schema: AnySpecSchema,
  documentAST: DocumentNode,
  rules: ReadonlyArray<ValidationRule>,
  options: { maxErrors?: number } = { maxErrors: undefined },
): ReadonlyArray<AnySpecError> {
  assert(documentAST, 'Must provide document.');

  const abortObj = { __brand: 'AbortError' } as const;
  const errors: Array<AnySpecError> = [];
  const context = new ValidationContext(schema, documentAST, (error) => {
    if (options.maxErrors != null && errors.length >= options.maxErrors) {
      errors.push(
        new AnySpecError('Too many validation errors, error limit reached. Validation aborted.'),
      );
      throw abortObj;
    }

    errors.push(error);
  });

  const visitors = rules.map((rule) => rule(context));

  // Visit the whole document with each instance of all provided rules.
  try {
    visitors.forEach((v) => visit(documentAST, v));
  } catch (e) {
    if (e !== abortObj) {
      throw e;
    }
  }
  return errors;
}
