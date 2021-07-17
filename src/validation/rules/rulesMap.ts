import { ASTVisitor } from '../../visitor';
import { ValidationContext } from '../ValidationContext';
import * as Base from './base';
import * as Recommended from './recommended';

/**
 * This record includes all available validation rules.
 */
export const RulesMap: Record<string, (context: ValidationContext) => ASTVisitor> = {
  'known-type-names': Base.KnownTypeNamesRule,
  'no-explicit-string-rule': Base.NoExplicitStringRule,
  'endpoints-known-http-verbs': Base.EndpointsKnownHttpVerbs,
  'endpoints-recommended-body-parameter-postfix':
    Recommended.EndpointsRecommendedBodyParameterPostfix,
  'endpoints-recommended-query-postfix': Recommended.EndpointsRecommendedQueryPostfix,
  'endpoints-recommended-response-postfix': Recommended.EndpointsRecommendedResponsePostfix,
  'recommended-body-model-name': Recommended.RecommendedBodyModelName,
  'recommended-filter-postfix': Recommended.RecommendedFilterPostfix,
  'recommended-model-body-field-postfix': Recommended.RecommendedModelBodyFieldPostfix,
  'recommended-postfix-for-create-models': Recommended.RecommendedPostfixForCreateModels,
  'recommended-postfix-for-update-models': Recommended.RecommendedPostfixForUpdateModels,
};
