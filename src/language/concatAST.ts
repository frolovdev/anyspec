import { ASTNodeKind, DocumentNode, TypeDefinitionNode } from '../language/ast';

/**
 * Provided a collection of ASTs, presumably each from different files,
 * concatenate the ASTs together into batched AST, useful for validating many
 * source files which together represent one conceptual application.
 */
export function concatAST(documents: ReadonlyArray<DocumentNode>): DocumentNode {
  const definitions: Array<TypeDefinitionNode> = [];
  for (const doc of documents) {
    definitions.push(...doc.definitions);
  }
  return { kind: ASTNodeKind.DOCUMENT, definitions };
}
