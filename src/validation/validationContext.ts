import { AnySpecError } from 'error/AnySpecError';

import { ASTVisitor } from 'visitor';
import { DocumentNode } from '../language';
import { AnySpecSchema } from 'runtypes';
/**
 * An instance of this class is passed as the "this" context to all validators,
 * allowing access to commonly useful contextual information from within a
 * validation rule.
 */
export class ASTValidationContext {
  private ast: DocumentNode;
  private onError: (error: AnySpecError) => void;

  constructor(ast: DocumentNode, onError: (error: AnySpecError) => void) {
    this.ast = ast;
    this.onError = onError;
  }

  reportError(error: AnySpecError): void {
    this.onError(error);
  }

  getDocument(): DocumentNode {
    return this.ast;
  }

  get [Symbol.toStringTag]() {
    return 'ASTValidationContext';
  }
}

export type ASTValidationRule = (context: ASTValidationContext) => ASTVisitor;

export class ValidationContext extends ASTValidationContext {
  private schema: AnySpecSchema;

  constructor(schema: AnySpecSchema, ast: DocumentNode, onError: (error: AnySpecError) => void) {
    super(ast, onError);
    this.schema = schema;
  }

  getSchema(): AnySpecSchema {
    return this.schema;
  }

  get [Symbol.toStringTag]() {
    return 'ValidationContext';
  }
}

export type ValidationRule = (context: ValidationContext) => ASTVisitor;
