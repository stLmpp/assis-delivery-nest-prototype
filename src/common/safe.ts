export type SafeAsyncSuccess<T> = [error: undefined, data: T];
export type SafeAsyncError = [error: Error, data: undefined];
export type SafeAsync<T> = SafeAsyncSuccess<T> | SafeAsyncError;

export async function safeAsync<T>(
  callback: () => Promise<T>,
): Promise<SafeAsync<T>> {
  try {
    return [undefined, await callback()];
  } catch (error) {
    if (error instanceof Error) {
      return [error, undefined];
    }
    return [new Error(String(error)), undefined];
  }
}

export function safe<T>(callback: () => T): SafeAsync<T> {
  try {
    return [undefined, callback()];
  } catch (error) {
    if (error instanceof Error) {
      return [error, undefined];
    }
    return [new Error(String(error)), undefined];
  }
}
