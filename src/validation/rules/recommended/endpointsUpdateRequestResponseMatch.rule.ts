import { AnySpecError } from '../../../error';
import { ASTNodeKind } from '../../../language';
import { ASTVisitor } from '../../../visitor';
import { ValidationContext } from '../../validationContext';

/**
 *
 * In PATCH RequestBody primitive types should match with Response primitive types
 *
 * good ✅
 *
 * PATCH /endpoint ConnectionUpdateRequestBody
 *  => ConnectionResponse
 *
 * ConnectionUpdateRequestBody {
 *  field: string
 *  field2: string
 * }
 *
 * ConnectionResponse {
 *  field: string
 *  field2: string
 * }
 *
 * bad ❌
 *
 * PATCH /endpoint ConnectionCreateRequestBody
 *  => ConnectionResponse
 *
 * ConnectionCreateRequestBody {
 *  field: number
 *  field2: number
 * }
 *
 * ConnectionResponse {
 *  field: number
 *  field2: number
 * }
 *
 */
export function EndpointsUpdateRequestResponseMatch(context: ValidationContext): ASTVisitor {
  return {};
}
