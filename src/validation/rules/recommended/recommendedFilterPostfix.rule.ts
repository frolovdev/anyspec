import { AnySpecError } from '../../../error';
import { ASTNodeKind } from '../../../language';
import { specifiedScalarTypes } from '../../../runtypes';
import { ASTVisitor } from '../../../visitor';
import { ValidationContext } from '../../validationContext';

const POSTFIX = 'Filter';

/**
 *
 *
 * good ✅
 *
 * ```
 * RequestQuery {
 *   filter: BkConnectionFilter,
 * }
 * ```
 *
 * bad ❌
 *
 * ```
 * RequestQuery {
 *   filter: BkConnection,
 * }
 * ```
 *
 */
export function RecommendedFilterPostfix(context: ValidationContext): ASTVisitor {
  return {
    FieldDefinition(node) {
      if (node.name.value === 'filter') {
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
                `Type name of filter field should ends with Filter postfix, did you mean ${node.type.name.value}Filter`,
                node.type,
              ),
            );
          }
        }
      }
    },
  };
}
