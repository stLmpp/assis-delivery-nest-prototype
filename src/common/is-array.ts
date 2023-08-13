export function isArray(array: unknown): array is readonly unknown[] {
  return Array.isArray(array);
}
