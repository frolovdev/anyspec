export const stringAliases = new Set(['s', 'string']);

export const specifiedScalarTypes = new Set([
  'i',
  'integer',
  ...stringAliases,
  'b',
  'boolean',
  'o',
  'object',
  'f',
  'float',
  'date',
  'd',
  'datetime',
  't',
  'text',
  'j',
  'json',
]);
