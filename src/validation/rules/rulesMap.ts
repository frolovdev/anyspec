import { ASTVisitor } from '../../visitor';
import { ValidationContext } from '../validationContext';
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
    recommended.endpointsRecommendedBodyParameterPostfix,
  'recommended/endpoints-query-postfix': recommended.endpointsRecommendedQueryPostfix,
  'recommended/endpoints-response-postfix': recommended.endpointsRecommendedResponsePostfix,
  'recommended/body-model-name': recommended.recommendedBodyModelName,
  'recommended/filter-postfix': recommended.recommendedFilterPostfix,
  'recommended/model-body-field-postfix': recommended.recommendedModelBodyFieldPostfix,
  'recommended/postfix-for-create-models': recommended.recommendedPostfixForCreateModels,
  'recommended/postfix-for-update-models': recommended.recommendedPostfixForUpdateModels,
  'recommended/endpoints-update-request-response-match':
    recommended.endpointsUpdateRequestResponseMatch,
};
