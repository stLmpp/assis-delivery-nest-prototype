import { isArray } from './is-array';

export function coerceArray<T>(possibleArray: T | T[] | readonly T[]): T[] {
  return isArray(possibleArray) ? [...possibleArray] : [possibleArray];
}
