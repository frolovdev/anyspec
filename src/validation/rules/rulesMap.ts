import { ASTVisitor } from '../../visitor';
import { ValidationContext } from '../ValidationContext';
import * as Base from './base';
import * as Recommended from './recommended';

/**
 * This record includes all available validation rules.
 */
export const rulesMap: Record<string, (context: ValidationContext) => ASTVisitor> = {
  'base/known-type-names': Base.KnownTypeNamesRule,
  'base/no-explicit-string-rule': Base.NoExplicitStringRule,
  'base/endpoints-known-http-verbs': Base.EndpointsKnownHttpVerbs,
  'recommended/endpoints-body-parameter-postfix':
    Recommended.EndpointsRecommendedBodyParameterPostfix,
  'recommended/endpoints-query-postfix': Recommended.EndpointsRecommendedQueryPostfix,
  'recommended/endpoints-response-postfix': Recommended.EndpointsRecommendedResponsePostfix,
  'recommended/body-model-name': Recommended.RecommendedBodyModelName,
  'recommended/filter-postfix': Recommended.RecommendedFilterPostfix,
  'recommended/model-body-field-postfix': Recommended.RecommendedModelBodyFieldPostfix,
  'recommended/postfix-for-create-models': Recommended.RecommendedPostfixForCreateModels,
  'recommended/postfix-for-update-models': Recommended.RecommendedPostfixForUpdateModels,
  'recommended/endpoints-update-request-response-match':
    Recommended.EndpointsUpdateRequestResponseMatch,
};
