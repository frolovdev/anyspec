import {
  ASTNode,
  ASTNodeKind,
<<<<<<< HEAD
  EndpointParameterBodyNode,
  EndpointTypeDefinitionNode,
=======
  EndpointNamespaceTypeDefinitionNode,
>>>>>>> 6c6c1cc28dde70babb1685b69c5a0e5d94a6191b
  ModelDomainTypeDefinitionNode,
} from './ast';

export function isModelDomainDefinitionNode(node: ASTNode): node is ModelDomainTypeDefinitionNode {
  return (
    node.kind === ASTNodeKind.MODEL_TYPE_DEFINITION ||
    node.kind === ASTNodeKind.ENUM_TYPE_DEFINITION
  );
}

<<<<<<< HEAD
export function isEndpointTypeDefinitionNode(node: ASTNode): node is EndpointTypeDefinitionNode {
  return node.kind === ASTNodeKind.ENDPOINT_TYPE_DEFINITION;
}

export function isEndpointEndpointParameterBodyNode(
  node: ASTNode,
): node is EndpointParameterBodyNode {
  return node.kind === ASTNodeKind.ENDPOINT_PARAMETER_BODY;
=======
export function isEndpointNamespaceTypeDefinitionNode(
  node: ASTNode,
): node is EndpointNamespaceTypeDefinitionNode {
  return node.kind === ASTNodeKind.ENDPOINT_NAMESPACE_TYPE_DEFINITION;
>>>>>>> 6c6c1cc28dde70babb1685b69c5a0e5d94a6191b
}
