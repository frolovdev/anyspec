/**
 * @description
 *
 * rule should work only in file
 *
 * good ✅
 *
 * User {}
 *
 * AcDocument {
 *    field: User,
 *    field2: s,
 * }
 *
 * bad ❌
 *
 *
 * AcDocument {
 *    field: User,
 *    field2: s,
 * }
 *
 * User {}
 *
 */
class BanUsingTypeDefinitionBeforeDeclaration {}
