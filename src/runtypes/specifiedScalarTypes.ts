export const stringAliases = new Set(['s', 'string']);
export const integerAliases = new Set(['i', 'integer']);
export const booleanAliases = new Set(['b', 'boolean']);
export const objectAliases = new Set(['o', 'object']);
export const floatAliases = new Set(['f', 'float']);
export const dateAliases = new Set(['d', 'date', 'datetime']);
export const textAliases = new Set(['t', 'text']);
export const jsonAliases = new Set(['j', 'json']);

export const scalarAliases = [
  stringAliases,
  integerAliases,
  booleanAliases,
  objectAliases,
  floatAliases,
  dateAliases,
  textAliases,
  jsonAliases,
];

export const specifiedScalarTypes = new Set([
  ...integerAliases,
  ...stringAliases,
  ...booleanAliases,
  ...objectAliases,
  ...floatAliases,
  ...dateAliases,
  ...textAliases,
  ...jsonAliases,
]);

export function getNormalizedScalar(scalar: string): string | undefined {
  const scalars = Array.from(scalarAliases.find((alias) => alias.has(scalar)) ?? []);

  if (scalars.length !== 0) {
    return scalars[0];
  }
}
