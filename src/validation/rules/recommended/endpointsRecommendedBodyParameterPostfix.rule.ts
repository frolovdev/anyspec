import { ASTNodeKind } from './../../../language/ast';
import { AnySpecError } from '../../../error';
import { ASTVisitor } from '../../../visitor';
import { ValidationContext } from '../../validationContext';

const prefixMap = {
  POST: 'CreateRequestBody',
  PATCH: 'UpdateRequestBody',
} as const;

/**
 *
 *
 * good ✅
 * ```
 * POST /endpoint RequestCreateRequestBody
 * PATCH /endpoint2 RequestUpdateRequestBody
 * ```
 * bad ❌
 * ```
 * POST /endpoint Request
 * PATCH /endpoint2 Request
 * ```
 */
export function EndpointsRecommendedBodyParameterPostfix(context: ValidationContext): ASTVisitor {
  const isInPrefixMap = (verb: string): verb is keyof typeof prefixMap => {
    const keys = Object.keys(prefixMap);
    return keys.includes(verb);
  };
  return {
    EndpointTypeDefinition(node) {
      if (isInPrefixMap(node.verb.name.value)) {
        const verb = node.verb.name.value;
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
