import { KnownTypeNamesRule } from './rules/knownTypeNames.rule';
import { NoExplicitStringRule } from './rules/noExplicitString.rule';
import { ValidationRule } from './validationContext';

/**
 * This set includes all validation rules defined by the base spec.
 *
 * The order of the rules in this list has been adjusted to lead to the
 * most clear output when encountering multiple validation errors.
 */
export const baseRules: ReadonlyArray<ValidationRule> = [NoExplicitStringRule, KnownTypeNamesRule];
