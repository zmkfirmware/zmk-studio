import Emittery from "emittery";
import { useEffect } from "react";

export const emitter = new Emittery();

export const useSub = <T = unknown>(
  name: PropertyKey,
  callback: (data: T) => void | Promise<void>,
) => {
  useEffect(() => {
    emitter.on(name, callback);
    return () => {
      emitter.off(name, callback);
    };
  }, [name, callback]);
};
