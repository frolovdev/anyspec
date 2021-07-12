import { ASTNode, ASTNodeKind, ModelDomainTypeDefinitionNode } from './ast';

export function isModelDomainDefinitionNode(node: ASTNode): node is ModelDomainTypeDefinitionNode {
  return (
    node.kind === ASTNodeKind.MODEL_TYPE_DEFINITION ||
    node.kind === ASTNodeKind.ENUM_TYPE_DEFINITION
  );
}
