import { useEffect, useState } from "react";

function basicSerialize<T>(value: T): string {
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

export function useLocalStorageState<T>(
  key: string,
  defaultValue: T,
  options?: {
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
  },
) {
  const reactState = useState<T>(() => {
    const savedValue = localStorage.getItem(key);
    if (savedValue !== null) {
      if (options?.deserialize) {
        return options.deserialize(savedValue);
      }
      return savedValue as T; // Assuming T is a string
    }
    return defaultValue;
  });

  const [state] = reactState;

  useEffect(() => {
    const serializedState =
      options?.serialize?.(state) || basicSerialize(state);
    localStorage.setItem(key, serializedState);
  }, [state, key, options]);

  return reactState;
}
