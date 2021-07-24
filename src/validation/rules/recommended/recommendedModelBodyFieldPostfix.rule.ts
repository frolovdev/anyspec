import { AnySpecError } from '../../../error';
import { ASTNodeKind } from '../../../language';
import { specifiedScalarTypes } from '../../../runtypes';
import { ASTVisitor } from '../../../visitor';
import { ValidationContext } from '../../validationContext';

const POSTFIX = 'RequestBody';

/**
 *
 *
 * good ✅
 *
 * ```
 * RequestQuery {
 *   body: BkConnectionRequestBody,
 * }
 * ```
 *
 * bad ❌
 *
 * ```
 * RequestQuery {
 *   body: BkConnection,
 * }
 * ```
 *
 */
export function recommendedModelBodyFieldPostfix(context: ValidationContext): ASTVisitor {
  return {
    FieldDefinition(node) {
      if (node.name.value === 'body') {
        if (node.type.kind === ASTNodeKind.NAMED_TYPE) {
          if (!node.type.name.value) {
            return;
          }
          if (specifiedScalarTypes.has(node.type.name.value)) {
            return;
          }
          if (!node.type.name.value?.endsWith(POSTFIX)) {
            context.reportError(
              new AnySpecError(
                `Type name of body field should ends with ${POSTFIX} postfix, did you mean ${node.type.name.value}${POSTFIX}`,
                node.type,
              ),
            );
          }
        }
      }
    },
  };
}
