import { AnySpecError } from '../../../error';
import { ASTNodeKind } from '../../../language';
import { specifiedScalarTypes } from '../../../runtypes';
import { ASTVisitor } from '../../../visitor';
import { ValidationContext } from '../../validationContext';

/**
 *
 * if model contains `body` field ensure that model name is substring of body parameter type
 *
 * good ✅
 * ```
 * Model {
 *   body: ModelRequestBody,
 * }
 * ```
 *
 * bad ❌
 *
 * ```
 * Other {
 *   body: ModelRequestBody,
 * }
 * ```
 *
 */
export function recommendedBodyModelName(context: ValidationContext): ASTVisitor {
  return {
    ModelTypeDefinition(node) {
      if (!node.fields.some((fieldDefinition) => fieldDefinition.name.value === 'body')) {
        return;
      }

      const modelName = node.name.value;
      const fieldNode = node.fields.find(
        (fieldDefinition) => fieldDefinition.name.value === 'body',
      );
      const fieldTypeName =
        fieldNode?.type.kind === ASTNodeKind.NAMED_TYPE ? fieldNode.type.name.value : undefined;

      if (!fieldNode) {
        return;
      }

      if (!fieldTypeName) {
        return;
      }
      if (specifiedScalarTypes.has(fieldTypeName)) {
        return;
      }

      if (!fieldTypeName?.includes(modelName)) {
        context.reportError(
          new AnySpecError(
            `Name of model "${modelName}" should be substring of "body" parameter type "${fieldTypeName}", e.g. Model { body: ModelRequestBody }`,
            node,
          ),
        );
      }
    },
  };
}
