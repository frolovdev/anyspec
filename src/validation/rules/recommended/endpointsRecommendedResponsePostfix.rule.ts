import { AnySpecError } from '../../../error';
import { ASTNodeKind } from '../../../language';
import { ASTVisitor } from '../../../visitor';
import { ValidationContext } from '../../validationContext';

const POSTFIX = 'Response';

/**
 *
 *
 * good ✅
 * ```
 * GET /endpoint
 *  => SomeTypeResponse
 * ```
 *
 * bad ❌
 *
 * ```
 * GET /endpoint
 *  => SomeType
 * ```
 */
export function endpointsRecommendedResponsePostfix(context: ValidationContext): ASTVisitor {
  return {
    EndpointResponse(node) {
      if (node.type?.kind === ASTNodeKind.NAMED_TYPE) {
        if (!node.type.name.value?.endsWith(POSTFIX)) {
          context.reportError(
            new AnySpecError(
              `Request model should ends with Response postfix, e.g. SomeTypeResponse`,
              node,
            ),
          );
        }
      }
    },
  };
}
