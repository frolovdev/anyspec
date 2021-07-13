import { AnySpecError } from '../../../error';
import { ASTVisitor } from '../../../visitor';
import { ValidationContext } from '../../validationContext';

const PREFIX = 'RequestQuery';

export function EndpointsRecommendedQueryPostfix(context: ValidationContext): ASTVisitor {
  return {
    EndpointParameterQuery(node) {
      if (!node.type.name.value?.endsWith(PREFIX)) {
        context.reportError(
          new AnySpecError(`Query model should ends with RequestQuery postfix`, node),
        );
      }
    },
  };
}
