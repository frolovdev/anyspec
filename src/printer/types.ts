import { ASTNode, DocumentNode } from '../language';

export type CommentNode = {
  value: string;
};

type Diff<T, U> = T extends U ? never : T;

export type PrinterDocumentNode = DocumentNode & { comments: CommentNode[] };

// we enhance ast tree with comments array
export type PrinterAstNode = Diff<ASTNode, 'DocumentNode'> | PrinterDocumentNode;
