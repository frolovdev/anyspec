import { ASTNodeKind } from './../../../language/ast';
import { AnySpecError } from '../../../error';
import { ASTVisitor } from '../../../visitor';
import { ValidationContext } from '../../validationContext';

const prefixMap = {
  POST: 'CreateRequestBody',
  PATCH: 'UpdateRequestBody',
};

/**
 *
 *
 * good ✅
 *
 * POST /endpoint RequestCreateRequestBody
 * PATCH /endpoint2 RequestUpdateRequestBody
 *
 * bad ❌
 *
 * POST /endpoint Request
 * PATCH /endpoint2 Request
 *
 */
export function EndpointsRecommendedQueryPostfix(context: ValidationContext): ASTVisitor {
  return {
    EndpointTypeDefinition(node) {
      const keys = Object.keys(prefixMap);
      if (keys.includes(node.verb.name.value)) {
        const verb = node.verb.name.value as keyof typeof prefixMap;
        node.url.parameters.forEach((param) => {
          if (
            param.type.kind === ASTNodeKind.ENDPOINT_PARAMETER_BODY &&
            param.type.type.kind === ASTNodeKind.NAMED_TYPE
          ) {
            if (!param.type.type.name.value?.endsWith(prefixMap[verb])) {
              context.reportError(
                new AnySpecError(
                  `${node.verb.name.value} body parameter should ends with ${prefixMap[verb]} postfix`,
                  param.type.type,
                ),
              );
            }
          }
        });
      }
    },
  };
}
