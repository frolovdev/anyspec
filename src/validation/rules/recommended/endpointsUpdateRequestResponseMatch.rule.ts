import { AnySpecError } from '../../../error';
import {
  ASTNode,
  ASTNodeKind,
  EndpointParameterBodyNode,
  EndpointTypeDefinitionNode,
  FieldDefinitionNode,
  isEndpointTypeDefinitionNode,
  ModelTypeDefinitionNode,
  TypeNode,
} from '../../../language';
import { ASTVisitor, visit } from '../../../visitor';
import { ValidationContext } from '../../validationContext';

/**
 *
 * In PATCH RequestBody primitive types should match with Response primitive types
 *
 * good ✅
 *
 * PATCH /endpoint ConnectionUpdateRequestBody
 *  => ConnectionResponse
 *
 * ConnectionUpdateRequestBody {
 *  field: string
 *  field2: string
 * }
 *
 * ConnectionResponse {
 *  field: string
 *  field2: string
 * }
 *
 * bad ❌
 *
 * PATCH /endpoint ConnectionCreateRequestBody
 *  => ConnectionResponse
 *
 * ConnectionCreateRequestBody {
 *  field: string
 *  field2: number
 * }
 *
 * ConnectionResponse {
 *  field: number
 *  field2: number
 * }
 *
 */
export function EndpointsUpdateRequestResponseMatch(context: ValidationContext): ASTVisitor {
  const findModelDefinition = (name?: string): ModelTypeDefinitionNode | undefined => {
    let definition: ModelTypeDefinitionNode | undefined = undefined;
    visit(context.getDocument(), {
      ModelTypeDefinition(node) {
        if (node.name.value === name) {
          definition = node;
        }
      },
    });
    return definition;
  };

  return {
    EndpointResponse(responseNode, _1, parent, _2, ancestors) {
      const endpointTypeDefinition = findEndpointTypeDefinitionNode(ancestors);
      const requestNodeParameterBody = findEndpointParameterBodyNode(endpointTypeDefinition);

      if (endpointTypeDefinition.verb.name.value !== 'PATCH') {
        return;
      }

      if (
        responseNode.type?.kind === ASTNodeKind.ENUM_INLINE_TYPE_DEFINITION ||
        responseNode.type?.kind === ASTNodeKind.LIST_TYPE
      ) {
        return;
      }

      if (
        requestNodeParameterBody?.type.kind === ASTNodeKind.ENUM_INLINE_TYPE_DEFINITION ||
        requestNodeParameterBody?.type.kind === ASTNodeKind.LIST_TYPE
      ) {
        return;
      }

      const responseNodeBody = responseNode.type;

      const requestTypeNode = requestNodeParameterBody?.type;

      const requestFieldDefinitions =
        requestTypeNode?.kind === ASTNodeKind.OBJECT_TYPE_DEFINITION
          ? requestTypeNode.fields
          : findModelDefinition(requestTypeNode?.name.value)?.fields ?? [];

      const responseFieldDefinitions =
        responseNodeBody?.kind === ASTNodeKind.OBJECT_TYPE_DEFINITION
          ? responseNodeBody.fields
          : findModelDefinition(responseNodeBody?.name.value)?.fields ?? [];

      if (!isFieldDefinitionsMatches(requestFieldDefinitions, responseFieldDefinitions)) {
        context.reportError(
          new AnySpecError(
            `In PATH endpoints Response should match with RequestBody`,
            responseNode.type,
          ),
        );
      }
    },
  };
}

// TODO: get rig of typecasting
function findEndpointTypeDefinitionNode(
  ancestors: readonly (ASTNode | readonly ASTNode[])[],
): EndpointTypeDefinitionNode {
  const [endpointTypeDefinition] = ancestors.filter((ancestor) => {
    if (Array.isArray(ancestor)) {
      return false;
    }
    return isEndpointTypeDefinitionNode(ancestor as ASTNode);
  }) as EndpointTypeDefinitionNode[];

  return endpointTypeDefinition;
}

// TODO: get rig of typecasting
function findEndpointParameterBodyNode(
  endpointNode: EndpointTypeDefinitionNode,
): EndpointParameterBodyNode | undefined {
  const [requestNodeParameter] = endpointNode.url.parameters.filter(
    (parameter) => parameter.type.kind === ASTNodeKind.ENDPOINT_PARAMETER_BODY,
  );

  const requestNodeParameterBody = requestNodeParameter.type as
    | EndpointParameterBodyNode
    | undefined;

  return requestNodeParameterBody;
}

function isFieldDefinitionsMatches(
  fields1: readonly FieldDefinitionNode[],
  fields2: readonly FieldDefinitionNode[],
): boolean {
  return fields1.every((f1) => {
    const f1Name = f1.name.value;
    const f1Type = f1.type;

    const [f2] = fields2.filter((f) => f.name.value === f1Name);

    if (!f2) {
      return false;
    }
    const f2Type = f2.type;

    return isNamedTypesPrimitiveMatch(f1Type, f2Type);
  });
}

function isNamedTypesPrimitiveMatch(t1: TypeNode, t2: TypeNode) {
  if (t1.kind !== ASTNodeKind.NAMED_TYPE || t2.kind !== ASTNodeKind.NAMED_TYPE) {
    // if TypeNodes not Named type not go deeper and compare only kind match
    return t1.kind === t2.kind;
  }

  return t1.name.value === t2.name.value;
}
