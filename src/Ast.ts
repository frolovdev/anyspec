import { Location } from './location';

/**
 * The set of allowed kind values for AST nodes.
 */
export const ASTNodeKind = {
  /** Name */
  NAME: 'Name',

  /** Document */
  DOCUMENT: 'Document',
  OPERATION_DEFINITION: 'OperationDefinition',
  VARIABLE_DEFINITION: 'VariableDefinition',
  SELECTION_SET: 'SelectionSet',
  FIELD: 'Field',
  ARGUMENT: 'Argument',

  /** Fragments */
  FRAGMENT_SPREAD: 'FragmentSpread',
  INLINE_FRAGMENT: 'InlineFragment',
  FRAGMENT_DEFINITION: 'FragmentDefinition',

  /** Values */
  VARIABLE: 'Variable',
  INT: 'IntValue',
  FLOAT: 'FloatValue',
  STRING: 'StringValue',
  BOOLEAN: 'BooleanValue',
  NULL: 'NullValue',
  ENUM: 'EnumValue',
  LIST: 'ListValue',
  OBJECT: 'ObjectValue',
  OBJECT_FIELD: 'ObjectField',

  /** Directives */
  DIRECTIVE: 'Directive',

  /** Types */
  NAMED_TYPE: 'NamedType',
  LIST_TYPE: 'ListType',
  NON_NULL_TYPE: 'NonNullType',

  /** Type System Definitions */
  SCHEMA_DEFINITION: 'SchemaDefinition',
  OPERATION_TYPE_DEFINITION: 'OperationTypeDefinition',

  /** Type Definitions */
  SCALAR_TYPE_DEFINITION: 'ScalarTypeDefinition',
  OBJECT_TYPE_DEFINITION: 'ObjectTypeDefinition',
  FIELD_DEFINITION: 'FieldDefinition',
  INPUT_VALUE_DEFINITION: 'InputValueDefinition',
  INTERFACE_TYPE_DEFINITION: 'InterfaceTypeDefinition',
  UNION_TYPE_DEFINITION: 'UnionTypeDefinition',
  ENUM_TYPE_DEFINITION: 'EnumTypeDefinition',
  ENUM_VALUE_DEFINITION: 'EnumValueDefinition',
  INPUT_OBJECT_TYPE_DEFINITION: 'InputObjectTypeDefinition',

  /** Directive Definitions */
  DIRECTIVE_DEFINITION: 'DirectiveDefinition',

  /** Type System Extensions */
  SCHEMA_EXTENSION: 'SchemaExtension',

  /** Type Extensions */
  SCALAR_TYPE_EXTENSION: 'ScalarTypeExtension',
  OBJECT_TYPE_EXTENSION: 'ObjectTypeExtension',
  INTERFACE_TYPE_EXTENSION: 'InterfaceTypeExtension',
  UNION_TYPE_EXTENSION: 'UnionTypeExtension',
  ENUM_TYPE_EXTENSION: 'EnumTypeExtension',
  INPUT_OBJECT_TYPE_EXTENSION: 'InputObjectTypeExtension',

  /* My easy spec  */

  MODEL_DESCRIPTION: 'ModelDescription',
  MODEL_TYPE_DEFINITION: 'ModelTypeDefinition',
  ENUM_INLINE_TYPE_DEFINITION: 'EnumInlineTypeDefinition',
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

export interface FieldDefinitionNode {
  readonly kind: 'FieldDefinition';
  readonly loc?: Location;
  readonly name: NameNode;
  readonly type: TypeNode;
  readonly omitted: boolean;
  readonly optional: boolean;
}

export type TypeNode = NamedTypeNode | ListTypeNode | EnumInlineTypeDefinitionNode;

export interface ListTypeNode {
  readonly kind: 'ListType';
  readonly loc?: Location;
  readonly name?: NameNode | OptionalNameNode;
  readonly fields?: ReadonlyArray<FieldDefinitionNode>;
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
  readonly name?: NameNode | OptionalNameNode;

  readonly fields?: ReadonlyArray<FieldDefinitionNode>;
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
