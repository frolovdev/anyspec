/**
 *
 * WIP: it's an experimental module, never use it!
 *
 * good ✅
 *
 * ```
 * User {}
 *
 * AcDocument {
 *    field: User,
 *    field2: s,
 * }
 * ```
 *
 * bad ❌
 *
 * ```
 * AcDocument {
 *    field: User,
 *    field2: s,
 * }
 *
 * User {}
 * ```
 *
 */
class BanUsingTypeDefinitionBeforeDeclaration {}
