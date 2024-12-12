import Emittery from "emittery";
import { useCallback, useEffect } from "react";

export const emitter = new Emittery();

export const usePub =
  <T = unknown>() =>
  (name: PropertyKey, data: T) =>
    emitter.emit(name, data);

export const useSub = <T = unknown>(
  name: PropertyKey,
  callback: (data: T) => void | Promise<void>,
) => {
  const unsub = useCallback(
    () => emitter.off(name, callback),
    [name, callback],
  );

  // Be sure we unsub if unmounted.
  useEffect(() => {
    emitter.on(name, callback);
    return () => unsub();
  }, [name, callback, unsub]);

  return unsub;
};
