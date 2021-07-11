import { didYouMean, suggestionList } from 'utils';

import { AnySpecError } from 'error';
import { ASTNode, NamedTypeNode, isTypeDefinitionNode } from 'language';
import { ASTVisitor } from 'visitor';
import { specifiedScalarTypes } from 'runtypes';

import { ValidationContext } from '../validationContext';

const standardTypeNames = specifiedScalarTypes;
/**
 * Known type names
 *
 * An AnySpec document is only valid if referenced types (specifically
 * variable definitions and fragment conditions) are defined by the type schema.
 */
export function KnownTypeNamesRule(context: ValidationContext): ASTVisitor {
  // TODO: add logic for all schema (need to find all existed definitions)
  // TODO: resolve EndpointNamespaceTypeDefinitionNode type
  const existingTypesMap: Record<string, boolean> = {};

  const definedTypes: Record<string, boolean> = {};
  for (const def of context.getDocument().definitions) {
    if (isTypeDefinitionNode(def)) {
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
  return 'kind' in value && isTypeDefinitionNode(value);
}

// TODO: do something with it
function defaultNamedTypeCast(node: NamedTypeNode) {
  return node.name.value ? node.name.value : 'string';
}
