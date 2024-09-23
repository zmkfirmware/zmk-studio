import { useEffect, useState } from "react";

export function useLocalStorageState<T>(key: string, defaultValue: T, options?: { serialize?: (value: T) => string; deserialize?: (value: string) => T; }) {
  const reactState = useState<T>(() => {
    const savedValue = localStorage.getItem(key);
    if (savedValue !== null) {
      if (options?.deserialize) {
        return options.deserialize(savedValue);
      }
      return savedValue as T; // Assuming T is a string
    }
    return defaultValue;
  })

  const [state] = reactState;

  useEffect(() => {
    const serializedState = options?.serialize ? options.serialize(state)
      : (typeof state === 'object' && state !== null)
        ? JSON.stringify(state) // Fallback for objects
        : String(state); // Fallback for other types
    localStorage.setItem(key, serializedState);
  }, [state, key, options]);

  return reactState;
}