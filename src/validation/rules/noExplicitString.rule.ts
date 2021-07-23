import { ASTVisitor } from '../../visitor';

import { ValidationContext } from '../validationContext';
import { stringAliases } from '../../runtypes/specifiedScalarTypes';
import { ASTNodeKind } from '../../language';
import { AnySpecError } from '../../error';

/**
 *
 * good ✅
 *
 * AcDocument {
 *    field
 * }
 *
 * bad ❌
 *
 * Document {
 *   field: s
 * }
 *
 */
export function NoExplicitStringRule(context: ValidationContext): ASTVisitor {
  return {
    FieldDefinition(node, _1, parent, _2, ancestors) {
      if (node.type.kind === ASTNodeKind.NAMED_TYPE) {
        if (!node.type.name.value) {
          return;
        }
        if (stringAliases.includes(node.type.name.value)) {
          context.reportError(
            new AnySpecError(
              `No need to explicitly specify string type since it is the default`,
              node.type,
            ),
          );
        }
      }
    },
  };
}
