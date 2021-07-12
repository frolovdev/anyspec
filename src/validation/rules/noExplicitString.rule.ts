import { AnySpecError } from '../../error';
import { NamedTypeNode } from '../../language';
import { ASTVisitor } from '../../visitor';

import { ValidationContext } from '../validationContext';
import { stringAliases } from '../../runtypes/specifiedScalarTypes';

/**
 *
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
 *
 */
export function NoExplicitStringRule(context: ValidationContext): ASTVisitor {
  return {
    NamedType(node, _1, parent, _2, ancestors) {
      const castedValue = defaultNamedTypeCast(node);
      if (stringAliases.includes(castedValue)) {
        context.reportError(
          new AnySpecError(
            `No need to explicitly specify string type since it is the default`,
            node,
          ),
        );
      }
    },
  };
}

function defaultNamedTypeCast(node: NamedTypeNode) {
  return node.name.value ? node.name.value : 'string';
}
