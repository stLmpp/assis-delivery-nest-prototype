export function group_to_map<T, R>(
  array: readonly T[],
  callback: (item: T, index: number, array: readonly T[]) => R,
): Map<R, T[]> {
  const map = new Map<R, T[]>();
  for (let index = 0; index < array.length; index++) {
    const item = array[index];
    const key = callback(item, index, array);
    (map.get(key) ?? map.set(key, []).get(key))!.push(item);
  }
  return map;
}
