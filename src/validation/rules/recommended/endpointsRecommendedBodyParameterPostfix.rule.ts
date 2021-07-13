import { ASTNodeKind } from './../../../language/ast';
import { AnySpecError } from '../../../error';
import { ASTVisitor } from '../../../visitor';
import { ValidationContext } from '../../validationContext';

const PREFIX_POST = 'CreateRequestBody';
const PREFIX_PATCH = 'UpdateRequestBody';

export function EndpointsRecommendedQueryPostfix(context: ValidationContext): ASTVisitor {
  return {
    EndpointTypeDefinition(node) {
      if (node.verb.name.value === 'POST') {
        node.url.parameters.forEach((param) => {
          if (param.type.kind === ASTNodeKind.ENDPOINT_PARAMETER_BODY) {
            if (param.type.type.kind === ASTNodeKind.NAMED_TYPE) {
              if (!param.type.type.name.value?.endsWith(PREFIX_POST)) {
                context.reportError(
                  new AnySpecError(
                    `POST body parameter should ends with CreateRequestBody postfix`,
                    node,
                  ),
                );
              }
            }
          }
        });
      }

      if (node.verb.name.value === 'PATCH') {
        node.url.parameters.forEach((param) => {
          if (param.type.kind === ASTNodeKind.ENDPOINT_PARAMETER_BODY) {
            if (param.type.type.kind === ASTNodeKind.NAMED_TYPE) {
              if (!param.type.type.name.value?.endsWith(PREFIX_PATCH)) {
                context.reportError(
                  new AnySpecError(
                    `PATCH body parameter should ends with UpdateRequestBody postfix`,
                    node,
                  ),
                );
              }
            }
          }
        });
      }
    },
  };
}
