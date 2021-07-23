import { ASTVisitor } from '../../visitor';
import { ValidationContext } from '../ValidationContext';
import * as base from './base';
import * as recommended from './recommended';

/**
 * This record includes all available validation rules.
 */
export const rulesMap: Record<string, (context: ValidationContext) => ASTVisitor> = {
  'base/known-type-names': base.knownTypeNamesRule,
  'base/no-explicit-string-rule': base.noExplicitStringRule,
  'base/endpoints-known-http-verbs': base.endpointsKnownHttpVerbs,
  'recommended/endpoints-body-parameter-postfix':
    Recommended.endpointsRecommendedBodyParameterPostfix,
  'recommended/endpoints-query-postfix': Recommended.endpointsRecommendedQueryPostfix,
  'recommended/endpoints-response-postfix': Recommended.endpointsRecommendedResponsePostfix,
  'recommended/body-model-name': Recommended.recommendedBodyModelName,
  'recommended/filter-postfix': Recommended.recommendedFilterPostfix,
  'recommended/model-body-field-postfix': Recommended.recommendedModelBodyFieldPostfix,
  'recommended/postfix-for-create-models': Recommended.recommendedPostfixForCreateModels,
  'recommended/postfix-for-update-models': Recommended.recommendedPostfixForUpdateModels,
};
