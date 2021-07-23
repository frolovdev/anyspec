import { AnySpecError } from '../../../error';
import { ASTNodeKind } from '../../../language';
import { specifiedScalarTypes } from '../../../runtypes';
import { ASTVisitor, visit } from '../../../visitor';
import { ValidationContext } from '../../validationContext';

/**
 *
 * if endpoint is `POST` && contains Body parameter ⇒
 * we should watch model that referenced by body parameter
 * and ensure that every `field`, that is named type, should ends with `New` postfix
 *
 * good ✅
 *
 * ```
 * POST /connections ConnectionCreateRequestBody
 *      => ConnectionResponse`
 *
 * ConnectionCreateRequestBody {
 *    connection: BkConnectionNew
 * }
 * ```
 *
 * bad ❌
 *
 * ```
 * POST /connections ConnectionCreateRequestBody
 *      => ConnectionResponse`
 *
 * ConnectionCreateRequestBody {
 *    connection: BkConnection
 * }
 * ```
 *
 */
export function recommendedPostfixForCreateModels(context: ValidationContext): ASTVisitor {
  let bodyParameters: string[] = [];

  // TODO: Rewrite after introducing type info #59
  visit(context.getDocument(), {
    EndpointTypeDefinition(node) {
      if (node.verb.name.value === 'POST') {
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
          fieldDefinition.type.name.value &&
          !specifiedScalarTypes.includes(fieldDefinition.type.name.value) &&
          !fieldDefinition.type.name.value?.endsWith('New')
        ) {
          context.reportError(
            new AnySpecError(
              `Type name of create field should ends with New postfix, did you mean ${fieldDefinition.type.name.value}New`,
              fieldDefinition.type,
            ),
          );
        }
      });
    },
  };
}
