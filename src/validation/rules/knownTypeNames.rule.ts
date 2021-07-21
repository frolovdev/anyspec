import { didYouMean, suggestionList } from '../../utils';

import { AnySpecError } from '../../error';
import {
  ASTNode,
  NamedTypeNode,
  isModelDomainDefinitionNode,
  isEndpointNamespaceTypeDefinitionNode,
} from '../../language';
import { ASTVisitor } from '../../visitor';
import { specifiedScalarTypes } from '../../runtypes';

import { ValidationContext } from '../validationContext';

const standardTypeNames = specifiedScalarTypes;
/**
 * Known type names
 *
 * An AnySpec document is only valid if referenced types (specifically
 * variable definitions) are defined by the type schema.
 */
export function KnownTypeNamesRule(context: ValidationContext): ASTVisitor {
  const existingTypesMap: Record<string, boolean> = {};

  const definedTypes: Record<string, boolean> = {};
  for (const def of context.getDocument().definitions) {
    if (isModelDomainDefinitionNode(def)) {
      definedTypes[def.name.value] = true;
    }
  }

  const typeNames = [...Object.keys(existingTypesMap), ...Object.keys(definedTypes)];

  return {
    NamedType(node, _1, parent, _2, ancestors) {
      const typeName = defaultNamedTypeCast(node);
      if (!existingTypesMap[typeName] && !definedTypes[typeName]) {
        const definitionNode = ancestors[2] ?? parent;

        const isSDL = definitionNode != null && isSDLNode(definitionNode);
        if (isSDL && standardTypeNames.includes(typeName)) {
          return;
        }

        const suggestedTypes = suggestionList(
          typeName,
          isSDL ? standardTypeNames.concat(typeNames) : typeNames,
        );
        context.reportError(
          new AnySpecError(`Unknown type "${typeName}".` + didYouMean(suggestedTypes), node),
        );
      }
    },
  };
}

function isSDLNode(value: ASTNode | ReadonlyArray<ASTNode>): boolean {
  return (
    'kind' in value &&
    (isModelDomainDefinitionNode(value) || isEndpointNamespaceTypeDefinitionNode(value))
  );
}

function defaultNamedTypeCast(node: NamedTypeNode) {
  return node.name.value ? node.name.value : 'string';
}
