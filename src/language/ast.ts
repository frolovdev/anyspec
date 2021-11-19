import { Location } from './location';

/**
 * The set of allowed kind values for AST nodes.
 */
export enum ASTNodeKind {
  /** Name */
  NAME = 'Name',

  /** Document */
  DOCUMENT = 'Document',

  /** Types */
  NAMED_TYPE = 'NamedType',
  LIST_TYPE = 'ListType',

  /** Type System Definitions */

  FIELD_DEFINITION = 'FieldDefinition',
  ENUM_VALUE_DEFINITION = 'EnumValueDefinition',

  /* My easy spec  */

  DESCRIPTION = 'Description',
  MODEL_TYPE_DEFINITION = 'ModelTypeDefinition',
  ENUM_INLINE_TYPE_DEFINITION = 'EnumInlineTypeDefinition',
  OBJECT_TYPE_DEFINITION = 'ObjectTypeDefinition',
  ENUM_TYPE_DEFINITION = 'EnumTypeDefinition',
  // Endpoints nodes
  ENDPOINT_NAMESPACE_TYPE_DEFINITION = 'EndpointNamespaceTypeDefinition',
  ENDPOINT_TYPE_DEFINITION = 'EndpointTypeDefinition',
  ENDPOINT_DESCRIPTION = 'EndpointDescription',
  ENDPOINT_VERB = 'EndpointVerb',
  ENDPOINT_SECURITY_DEFINITION = 'EndpointSecurityDefinition',
  ENDPOINT_URL = 'EndpointUrl',
  ENDPOINT_PARAMETER = 'EndpointParameter',
  ENDPOINT_PARAMETER_PATH = 'EndpointParameterPath',
  ENDPOINT_PARAMETER_PATH_TYPE = 'EndpointParameterPathType',
  ENDPOINT_PARAMETER_QUERY = 'EndpointParameterQuery',
  ENDPOINT_PARAMETER_BODY = 'EndpointParameterBody',
  ENDPOINT_RESPONSE = 'EndpointResponse',
  ENDPOINT_STATUS_CODE = 'EndpointStatusCode',
}

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
  | EndpointParameterQueryNode
  | EndpointParameterBodyNode
  | EndpointSecurityDefinitionNode;

export type ASTKindToNode = {
  [NodeT in ASTNode as NodeT['kind']]: NodeT;
};

export interface DocumentNode {
  readonly kind: ASTNodeKind.DOCUMENT;
  readonly loc?: Location;
  readonly definitions: ReadonlyArray<TypeDefinitionNode>;
}

export type ModelDomainTypeDefinitionNode = ModelTypeDefinitionNode | EnumTypeDefinitionNode;

export type EndpointDomainTypeDefinitionNode = EndpointNamespaceTypeDefinitionNode;

export type TypeDefinitionNode = ModelDomainTypeDefinitionNode | EndpointDomainTypeDefinitionNode;

export interface EndpointNamespaceTypeDefinitionNode {
  readonly kind: ASTNodeKind.ENDPOINT_NAMESPACE_TYPE_DEFINITION;
  readonly tag?: NameNode;
  readonly description?: DescriptionNode;
  readonly endpoints: ReadonlyArray<EndpointTypeDefinitionNode>;
  readonly loc?: Location;
}

export interface EndpointVerbNode {
  readonly kind: ASTNodeKind.ENDPOINT_VERB;
  readonly name: NameNode;
  readonly loc?: Location;
}

export interface EndpointParameterQueryNode {
  readonly kind: ASTNodeKind.ENDPOINT_PARAMETER_QUERY;
  readonly type: NamedTypeNode;
  readonly loc?: Location;
}

export interface EndpointParameterBodyNode {
  readonly kind: ASTNodeKind.ENDPOINT_PARAMETER_BODY;
  readonly type: TypeNode;
  readonly loc?: Location;
}

export interface EndpointParameterPathTypeNode {
  readonly kind: ASTNodeKind.ENDPOINT_PARAMETER_PATH_TYPE;
  readonly name: NameNode;
  readonly loc?: Location;
}

export interface OptionalEndpointParameterPathTypeNode {
  readonly kind: ASTNodeKind.ENDPOINT_PARAMETER_PATH_TYPE;
  readonly loc?: Location;
}

export type EndpointPathParameterType =
  | EndpointParameterPathTypeNode
  | OptionalEndpointParameterPathTypeNode;

export interface EndpointParameterPathNode {
  readonly kind: ASTNodeKind.ENDPOINT_PARAMETER_PATH;
  readonly name?: NameNode;
  readonly loc?: Location;
  readonly type: EndpointPathParameterType;
}

export type EndpointParameterType =
  | EndpointParameterBodyNode
  | EndpointParameterQueryNode
  | EndpointParameterPathNode;
export interface EndpointParameterNode {
  readonly kind: ASTNodeKind.ENDPOINT_PARAMETER;
  readonly type: EndpointParameterType;
  readonly loc?: Location;
}
export interface EndpointUrlNode {
  readonly kind: ASTNodeKind.ENDPOINT_URL;
  readonly name: NameNode;
  readonly parameters: ReadonlyArray<EndpointParameterNode>;
  readonly loc?: Location;
}

export interface EndpointStatusCodeNode {
  readonly kind: ASTNodeKind.ENDPOINT_STATUS_CODE;
  readonly name: NameNode;
  readonly loc?: Location;
}
export interface EndpointResponseNode {
  readonly kind: ASTNodeKind.ENDPOINT_RESPONSE;
  readonly type?: TypeNode;
  readonly status: EndpointStatusCodeNode;
  readonly description?: DescriptionNode;
  readonly loc?: Location;
}

export interface EndpointSecurityDefinitionNode {
  readonly kind: ASTNodeKind.ENDPOINT_SECURITY_DEFINITION;
  readonly name?: NameNode;
  readonly loc?: Location;
}

export interface EndpointTypeDefinitionNode {
  readonly kind: ASTNodeKind.ENDPOINT_TYPE_DEFINITION;
  readonly verb: EndpointVerbNode;
  readonly url: EndpointUrlNode;
  readonly description?: DescriptionNode;
  readonly securityDefinition?: EndpointSecurityDefinitionNode;
  readonly responses: ReadonlyArray<EndpointResponseNode>;
  readonly loc?: Location;
}

export interface ModelTypeDefinitionNode {
  readonly kind: ASTNodeKind.MODEL_TYPE_DEFINITION;
  readonly loc?: Location;
  readonly description?: DescriptionNode;
  readonly name: NameNode;
  readonly extendsModels: ReadonlyArray<NamedTypeNode>;
  readonly fields: ReadonlyArray<FieldDefinitionNode>;
  readonly strict: boolean;
}

export interface ObjectTypeDefinitionNode {
  readonly kind: ASTNodeKind.OBJECT_TYPE_DEFINITION;
  readonly loc?: Location;
  readonly strict: boolean;
  readonly fields: ReadonlyArray<FieldDefinitionNode>;
}

export interface FieldDefinitionNode {
  readonly kind: ASTNodeKind.FIELD_DEFINITION;
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
  readonly kind: ASTNodeKind.LIST_TYPE;
  readonly loc?: Location;
  readonly type: TypeNode;
}

export interface EnumInlineTypeDefinitionNode {
  readonly kind: ASTNodeKind.ENUM_INLINE_TYPE_DEFINITION;
  readonly loc?: Location;
  readonly values: ReadonlyArray<EnumValueDefinitionNode>;
}

export interface EnumTypeDefinitionNode {
  readonly kind: ASTNodeKind.ENUM_TYPE_DEFINITION;
  readonly name: NameNode;
  readonly loc?: Location;
  readonly description?: DescriptionNode;
  readonly values: ReadonlyArray<EnumValueDefinitionNode>;
}

export interface EnumValueDefinitionNode {
  readonly kind: ASTNodeKind.ENUM_VALUE_DEFINITION;
  readonly loc?: Location;
  readonly name: NameNode;
}

export interface DescriptionNode {
  readonly kind: ASTNodeKind.DESCRIPTION;
  readonly value: string;
  readonly loc?: Location;
}

export interface NamedTypeNode {
  readonly kind: ASTNodeKind.NAMED_TYPE;
  readonly loc?: Location;
  readonly name: NameNode | OptionalNameNode;
}

export interface NameNode {
  readonly kind: ASTNodeKind.NAME;
  readonly loc?: Location;
  readonly value: string;
}

export interface OptionalNameNode {
  readonly kind: ASTNodeKind.NAME;
  readonly loc?: Location;
  readonly value: undefined;
}

export function isNode(maybeNode: any): maybeNode is ASTNode {
  return typeof maybeNode?.kind === 'string';
}
