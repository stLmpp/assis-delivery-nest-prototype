export function arrayUniqBy<T>(
  array: readonly T[],
  iteratee: (value: T, index: number, array: readonly T[]) => unknown,
): T[] {
  const seen = new Set<unknown>();
  return array.filter((item, index, originalArray) => {
    const key = iteratee(item, index, originalArray);
    if (!seen.has(key)) {
      seen.add(key);
      return true;
    }
    return false;
  });
}
