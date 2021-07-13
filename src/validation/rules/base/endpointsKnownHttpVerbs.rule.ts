import { AnySpecError } from '../../../error';
import { ASTVisitor } from '../../../visitor';
import { ValidationContext } from '../../validationContext';

const HTTP_REQUEST_METHODS = [
  'GET',
  'HEAD',
  'POST',
  'PUT',
  'DELETE',
  'CONNECT',
  'OPTIONS',
  'TRACE',
  'PATCH',
];

export function EndpointsKnownHttpVerbs(context: ValidationContext): ASTVisitor {
  const set = new Set(HTTP_REQUEST_METHODS);

  return {
    EndpointVerb(node) {
      console.log(node);
      if (!set.has(node.name.value)) {
        context.reportError(new AnySpecError(`Unknown http method "${node.name.value}".`, node));
      }
    },
  };
}
