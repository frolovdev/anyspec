import { DocumentNode } from '../ast';

export interface BuildSchemaOptions {
  ast: DocumentNode;
}

export class AnySpecSchema {
  ast: DocumentNode;
  constructor(config: BuildSchemaOptions) {
    this.ast = config.ast;
  }
}
