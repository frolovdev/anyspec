import {
  ASTNode,
  ASTNodeKind,
  EndpointNamespaceTypeDefinitionNode,
  ModelDomainTypeDefinitionNode,
} from './ast';

export function isModelDomainDefinitionNode(node: ASTNode): node is ModelDomainTypeDefinitionNode {
  return (
    node.kind === ASTNodeKind.MODEL_TYPE_DEFINITION ||
    node.kind === ASTNodeKind.ENUM_TYPE_DEFINITION
  );
}

export function isEndpointNamespaceTypeDefinitionNode(
  node: ASTNode,
): node is EndpointNamespaceTypeDefinitionNode {
  return node.kind === ASTNodeKind.ENDPOINT_NAMESPACE_TYPE_DEFINITION;
}
