export function valueAfter<T>(val: T, ms?: number): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(val), ms);
  });
}
