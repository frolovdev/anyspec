import { DocumentNode } from '../../../../language';

export type CommentNode = {
  value: string;
};

// we enhance ast tree with comments array
export type PrinterDocumentNode = DocumentNode & { comments: CommentNode[] };
