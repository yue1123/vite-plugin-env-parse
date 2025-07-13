/**
 * Check if the key is excluded based on user-defined patterns.
 * @param key - The environment variable key to check.
 * @param exclude - An array of strings or regular expressions to match against.
 * @returns True if the key is excluded, false otherwise.
 */
export function isExcluded(key: string, exclude: (string | RegExp)[] = []): boolean {
  return exclude.some((pattern) => (typeof pattern === 'string' ? pattern === key : pattern.test(key)))
}
