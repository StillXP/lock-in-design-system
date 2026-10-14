/** Join class names, skipping anything that isn't a non-empty string. */
export function cx(...classes: unknown[]): string {
  return classes.filter((c): c is string => typeof c === 'string' && c.length > 0).join(' ');
}
