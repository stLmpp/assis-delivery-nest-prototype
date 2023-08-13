/**
 * @description Filter only unique items of an array with the help of a comparator callback
 * Useful if you need to use multiple keys or a special condition
 */
export function arrayUniqWith<T>(
  array: readonly T[],
  comparator: (valueA: T, valueB: T) => boolean,
): T[] {
  const set = new Set<number>();
  for (let indexA = 0; indexA < array.length; indexA++) {
    for (let indexB = indexA + 1; indexB < array.length; indexB++) {
      const valueA = array[indexA];
      const valueB = array[indexB];
      if (comparator(valueA, valueB)) {
        set.add(indexA);
        break;
      }
    }
  }
  return array.filter((_, index) => !set.has(index));
}
