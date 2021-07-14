import { AnySpecError } from '../../../error';
import { ASTNodeKind } from '../../../language';
import { ASTVisitor, visit } from '../../../visitor';
import { ValidationContext } from '../../validationContext';

/**
 *
 * if endpoint is `PATCH` && contains Body parameter ⇒
 * we should watch model that referenced by body parameter
 * and ensure that every `field`, that is named type, should ends with `Update` postfix
 *
 * good ✅
 *
 * PATCH /connections ConnectionCreateRequestBody
 *      => ConnectionResponse`
 *
 * ConnectionCreateRequestBody {
 *    connection: BkConnectionUpdate
 * }
 *
 * bad ❌
 *
 * PATCH /connections ConnectionCreateRequestBody
 *      => ConnectionResponse`
 *
 * ConnectionCreateRequestBody {
 *    connection: BkConnection
 * }
 *
 */
export function RecommendedPostfixForUpdateModels(context: ValidationContext): ASTVisitor {
  let bodyParameters: string[] = [];

  visit(context.getDocument(), {
    EndpointTypeDefinition(node) {
      if (node.verb.name.value === 'PATCH') {
        node.url.parameters.forEach((parameter) => {
          if (
            parameter.type.kind === ASTNodeKind.ENDPOINT_PARAMETER_BODY &&
            parameter.type.type.kind === ASTNodeKind.NAMED_TYPE &&
            parameter.type.type.name.value
          ) {
            bodyParameters.push(parameter.type.type.name.value);
          }
        });
      }
    },
  });
  return {
    ModelTypeDefinition(node) {
      if (!bodyParameters.includes(node.name.value)) {
        return;
      }
      node.fields.forEach((fieldDefinition) => {
        if (
          fieldDefinition.type.kind === ASTNodeKind.NAMED_TYPE &&
          !fieldDefinition.type.name.value?.endsWith('Update')
        ) {
          context.reportError(
            new AnySpecError(
              `Type name of create field should ends with Update postfix, did you mean ${fieldDefinition.type.name.value}Update`,
              fieldDefinition.type,
            ),
          );
        }
      });
    },
  };
}
