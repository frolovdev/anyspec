import { inspect as utilInspect } from 'util';

export function inspect(value: unknown): string {
  // => "undefined"
  if (value === undefined) {
    return String(undefined);
  }
  return utilInspect(value, undefined, 10, true);
}

export function log(value: unknown): void {
  const newval = inspect(value);

  console.log(newval);
}
