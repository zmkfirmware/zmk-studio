import { useEffect, useState } from "react";

function basicSerialize<T>(value: T): string {
  return typeof value !== "string" ? JSON.stringify(value) : String(value);
}

function toJson<T>(value: string): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return value as T;
  }
}

export function useLocalStorageState<T>(
  key: string,
  defaultValue: T,
  options?: {
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
  },
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    const saved = localStorage.getItem(key);

    if (saved === null) return defaultValue;
    return (
      options?.deserialize?.(saved) ?? (toJson(saved) as T) ?? defaultValue
    );
  });

  useEffect(() => {
    localStorage.setItem(
      key,
      options?.serialize?.(state) ?? basicSerialize(state),
    );
  }, [key, state, options]);

  return [state, setState];
}
