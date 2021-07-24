import { AnySpecError } from '../../../error';
import { ASTVisitor } from '../../../visitor';
import { ValidationContext } from '../../validationContext';
import { didYouMean, suggestionList } from '../../../utils';

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

/**
 * verb in front of endpoint should be one of available HTTP methods
 *
 * [https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods)
 *
 */
export function endpointsKnownHttpVerbs(context: ValidationContext): ASTVisitor {
  const set = new Set(HTTP_REQUEST_METHODS);

  return {
    EndpointVerb(node) {
      if (!set.has(node.name.value)) {
        const suggestedTypes = suggestionList(node.name.value, HTTP_REQUEST_METHODS);
        context.reportError(
          new AnySpecError(
            `Unknown http method "${node.name.value}".` + didYouMean(suggestedTypes),
            node,
          ),
        );
      }
    },
  };
}
