import { Location } from '../location';

/**
 * The set of allowed kind values for AST nodes.
 */
export const ASTNodeKind = {
  /** Name */
  NAME: 'Name',

  /** Document */
  DOCUMENT: 'Document',

  /** Types */
  NAMED_TYPE: 'NamedType',
  LIST_TYPE: 'ListType',

  /** Type System Definitions */

  FIELD_DEFINITION: 'FieldDefinition',
  ENUM_VALUE_DEFINITION: 'EnumValueDefinition',

  /* My easy spec  */

  MODEL_DESCRIPTION: 'ModelDescription',
  MODEL_TYPE_DEFINITION: 'ModelTypeDefinition',
  ENUM_INLINE_TYPE_DEFINITION: 'EnumInlineTypeDefinition',
  OBJECT_TYPE_DEFINITION: 'ObjectTypeDefinition',
} as const;

/**
 * The enum type representing the possible kind values of AST nodes.
 */
export type ASTNodeKindEnum = typeof ASTNodeKind[keyof typeof ASTNodeKind];

/**
 * The list of all possible AST node types.
 */
export type ASTNode =
  | DocumentNode
  | NamedTypeNode
  | ListTypeNode
  | FieldDefinitionNode
  | ModelTypeDefinitionNode
  | ObjectTypeDefinitionNode
  | EnumInlineTypeDefinitionNode
  | EnumValueDefinitionNode
  | ModelDescriptionNode
  | NameNode
  | OptionalNameNode;

export interface ASTKindToNode {
  Document: DocumentNode;
  NamedType: NamedTypeNode;
  ListType: ListTypeNode;
  FieldDefinition: FieldDefinitionNode;
  ObjectTypeDefinition: ObjectTypeDefinitionNode;
  ModelTypeDefinition: ModelTypeDefinitionNode;
  EnumInlineTypeDefinition: EnumInlineTypeDefinitionNode;
  EnumValueDefinition: EnumValueDefinitionNode;
  ModelDescription: ModelDescriptionNode;
  Name: NameNode;
  OptionalName: OptionalNameNode;
}

export interface DocumentNode {
  readonly kind: 'Document';
  readonly loc?: Location;
  readonly definitions: ReadonlyArray<DefinitionNode>;
}

export type DefinitionNode = ModelTypeDefinitionNode;

export interface ModelTypeDefinitionNode {
  readonly kind: 'ModelTypeDefinition';
  readonly loc?: Location;
  readonly description?: ModelDescriptionNode;
  readonly name: NameNode | OptionalNameNode;
  readonly extendsModels: ReadonlyArray<NamedTypeNode>;
  readonly fields: ReadonlyArray<FieldDefinitionNode>;
  readonly strict: boolean;
}

export interface ObjectTypeDefinitionNode {
  readonly kind: 'ObjectTypeDefinition';
  readonly loc?: Location;

  readonly fields: ReadonlyArray<FieldDefinitionNode>;
}

export interface FieldDefinitionNode {
  readonly kind: 'FieldDefinition';
  readonly loc?: Location;
  readonly name: NameNode;
  readonly type: TypeNode;
  readonly omitted: boolean;
  readonly optional: boolean;
}

export type TypeNode = NamedTypeNode | ListTypeNode | EnumInlineTypeDefinitionNode | ObjectTypeDefinitionNode;

export interface ListTypeNode {
  readonly kind: 'ListType';
  readonly loc?: Location;
  readonly type: TypeNode;
}

export interface EnumInlineTypeDefinitionNode {
  readonly kind: 'EnumInlineTypeDefinition';
  readonly loc?: Location;
  readonly values: ReadonlyArray<EnumValueDefinitionNode>;
}

export interface EnumValueDefinitionNode {
  readonly kind: 'EnumValueDefinition';
  readonly loc?: Location;
  readonly name: NameNode;
}

export interface ModelDescriptionNode {
  readonly kind: 'ModelDescription';
  readonly value: string;
  readonly loc?: Location;
}

export interface NamedTypeNode {
  readonly kind: 'NamedType';
  readonly loc?: Location;
  readonly name: NameNode | OptionalNameNode;
}

export interface NameNode {
  readonly kind: 'Name';
  readonly loc?: Location;
  readonly value: string;
}

export interface OptionalNameNode {
  readonly kind: 'Name';
  readonly loc?: Location;
  readonly value: undefined;
}

export function isNode(maybeNode: any): maybeNode is ASTNode {
  return typeof maybeNode?.kind === 'string';
}
