import { AnySpecError } from '../../../error';
import { ASTNodeKind } from '../../../language';
import { ASTVisitor } from '../../../visitor';
import { ValidationContext } from '../../validationContext';

const POSTFIX = 'Filter';

export function RecommendedFilterPostfix(context: ValidationContext): ASTVisitor {
  return {
    FieldDefinition(node) {
      if (node.name.value === 'filter') {
        if (node.type.kind === ASTNodeKind.NAMED_TYPE) {
          if (!node.type.name.value?.endsWith(POSTFIX)) {
            context.reportError(
              new AnySpecError(`Type name of filter should end with Filter prefix`, node),
            );
          }
        }
      }
    },
  };
}
