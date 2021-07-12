import { ASTNode, ASTNodeKind, TypeDefinitionNode } from './ast';

export function isTypeDefinitionNode(node: ASTNode): node is TypeDefinitionNode {
  return node.kind === ASTNodeKind.MODEL_TYPE_DEFINITION;
}
