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

  DESCRIPTION: 'Description',
  MODEL_TYPE_DEFINITION: 'ModelTypeDefinition',
  ENUM_INLINE_TYPE_DEFINITION: 'EnumInlineTypeDefinition',
  OBJECT_TYPE_DEFINITION: 'ObjectTypeDefinition',
  ENUM_TYPE_DEFINITION: 'EnumTypeDefinition',
  // Endpoints nodes
  ENDPOINT_NAMESPACE_TYPE_DEFINITION: 'EndpointNamespaceTypeDefinition',
  ENDPOINT_TYPE_DEFINITION: 'EndpointTypeDefinition',
  ENDPOINT_DESCRIPTION: 'EndpointDescription',
  ENDPOINT_VERB: 'EndpointVerb',
  ENDPOINT_SECURITY_DEFINITION: 'EndpointSecurityDefinition',
  ENDPOINT_URL: 'EndpointUrl',
  ENDPOINT_PARAMETER: 'EndpointParameter',
  ENDPOINT_PARAMETER_PATH: 'EndpointParameterPath',
  ENDPOINT_PARAMETER_PATH_TYPE: 'EndpointParameterPathType',
  ENDPOINT_PARAMETER_QUERY: 'EndpointParameterQuery',
  ENDPOINT_PARAMETER_BODY: 'EndpointParameterBody',
  ENDPOINT_RESPONSE: 'EndpointResponse',
  ENDPOINT_STATUS_CODE: 'EndpointStatusCode',
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
  | EnumTypeDefinitionNode
  | EnumValueDefinitionNode
  | DescriptionNode
  | NameNode
  | OptionalNameNode
  // Endpoints nodes
  | EndpointNamespaceTypeDefinitionNode
  | EndpointTypeDefinitionNode
  | EndpointVerbNode
  | EndpointUrlNode
  | EndpointResponseNode
  | EndpointParameterBodyNode
  | EndpointSecurityDefinitionNode;

export interface ASTKindToNode {
  Document: DocumentNode;
  NamedType: NamedTypeNode;
  ListType: ListTypeNode;
  FieldDefinition: FieldDefinitionNode;
  ObjectTypeDefinition: ObjectTypeDefinitionNode;
  ModelTypeDefinition: ModelTypeDefinitionNode;
  EnumInlineTypeDefinition: EnumInlineTypeDefinitionNode;
  EnumValueDefinition: EnumValueDefinitionNode;
  EnumTypeDefinition: EnumTypeDefinitionNode;
  Description: DescriptionNode;
  Name: NameNode;
  OptionalName: OptionalNameNode;
  // Endpoints nodes
  EndpointNamespaceTypeDefinition: EndpointNamespaceTypeDefinitionNode;
  EndpointVerb: EndpointVerbNode;
  EndpointUrl: EndpointUrlNode;
  EndpointTypeDefinition: EndpointTypeDefinitionNode;
  EndpointResponse: EndpointResponseNode;
  EndpointParameterBody: EndpointParameterBodyNode;
  EndpointSecurityDefinition: EndpointSecurityDefinitionNode;
}

export interface DocumentNode {
  readonly kind: 'Document';
  readonly loc?: Location;
  readonly definitions: ReadonlyArray<TypeDefinitionNode>;
}

export type TypeDefinitionNode =
  | ModelTypeDefinitionNode
  | EnumTypeDefinitionNode
  | EndpointNamespaceTypeDefinitionNode;

export interface EndpointNamespaceTypeDefinitionNode {
  readonly kind: 'EndpointNamespaceTypeDefinition';
  readonly tag?: NameNode;
  readonly description?: DescriptionNode;
  readonly endpoints: ReadonlyArray<EndpointTypeDefinitionNode>;
  readonly loc?: Location;
}

export interface EndpointVerbNode {
  readonly kind: 'EndpointVerb';
  readonly name: NameNode;
  readonly loc?: Location;
}

export interface EndpointParameterQueryNode {
  readonly kind: 'EndpointParameterQuery';
  readonly name: NameNode;
  readonly loc?: Location;
}

export interface EndpointParameterBodyNode {
  readonly kind: 'EndpointParameterBody';
  readonly type: TypeNode;
  readonly loc?: Location;
}

export interface EndpointParameterPathTypeNode {
  readonly kind: 'EndpointParameterPathType';
  readonly name: NameNode;
  readonly loc?: Location;
}

export interface OptionalEndpointParameterPathTypeNode {
  readonly kind: 'EndpointParameterPathType';
  readonly loc?: Location;
}

export type EndpointPathParameterType =
  | EndpointParameterPathTypeNode
  | OptionalEndpointParameterPathTypeNode;

export interface EndpointParameterPathNode {
  readonly kind: 'EndpointParameterPath';
  readonly name?: NameNode;
  readonly loc?: Location;
  readonly type: EndpointPathParameterType;
}

export type EndpointParameterType =
  | EndpointParameterBodyNode
  | EndpointParameterQueryNode
  | EndpointParameterPathNode;
export interface EndpointParameterNode {
  readonly kind: 'EndpointParameter';
  readonly type: EndpointParameterType;
  readonly loc?: Location;
}
export interface EndpointUrlNode {
  readonly kind: 'EndpointUrl';
  readonly name: NameNode;
  readonly parameters: ReadonlyArray<EndpointParameterNode>;
  readonly loc?: Location;
}

export interface EndpointStatusCodeNode {
  readonly kind: 'EndpointStatusCode';
  readonly name: NameNode;
  readonly loc?: Location;
}
export interface EndpointResponseNode {
  readonly kind: 'EndpointResponse';
  readonly type: TypeNode | EndpointStatusCodeNode;
  readonly description?: DescriptionNode;
  readonly loc?: Location;
}

export interface EndpointSecurityDefinitionNode {
  readonly kind: 'EndpointSecurityDefinition';
  readonly name?: NameNode;
  readonly loc?: Location;
}

export interface EndpointTypeDefinitionNode {
  readonly kind: 'EndpointTypeDefinition';
  readonly verb: EndpointVerbNode;
  readonly url: EndpointUrlNode;
  readonly description?: DescriptionNode;
  readonly securityDefinition?: EndpointSecurityDefinitionNode;
  readonly responses: ReadonlyArray<EndpointResponseNode>;
  readonly loc?: Location;
}

export interface ModelTypeDefinitionNode {
  readonly kind: 'ModelTypeDefinition';
  readonly loc?: Location;
  readonly description?: DescriptionNode;
  readonly name: NameNode;
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

export type TypeNode =
  | NamedTypeNode
  | ListTypeNode
  | EnumInlineTypeDefinitionNode
  | ObjectTypeDefinitionNode;

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

export interface EnumTypeDefinitionNode {
  readonly kind: 'EnumTypeDefinition';
  readonly name: NameNode;
  readonly loc?: Location;
  readonly values: ReadonlyArray<EnumValueDefinitionNode>;
}

export interface EnumValueDefinitionNode {
  readonly kind: 'EnumValueDefinition';
  readonly loc?: Location;
  readonly name: NameNode;
}

export interface DescriptionNode {
  readonly kind: 'Description';
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
