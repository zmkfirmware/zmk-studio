import Emittery from 'emittery'
import { useCallback, useEffect } from "react";

const emitter = new Emittery()

export const usePub = () => (name: PropertyKey, data: any) => {
    emitter.emit(name, data)
}

export const useSub = (
    name: PropertyKey,
    callback: (data) => void | Promise<void>,
) => {
    const unsub = () => {
        console.log('unsub', name)
        emitter.off(name, callback)
    }

    // Be sure we unsub if unmounted.
    useEffect(() => {
        emitter.on(name, callback)
        return () => unsub()
    })

    return unsub
}

export const useEmitter = () => {
    // Memoized publish function to emit events
    const publish = useCallback((event: PropertyKey, data) => {
        emitter.emit(event, data);
    }, []);

    // Memoized subscribe function that returns an unsubscribe function
    const subscribe = useCallback(
      (event: PropertyKey, callback: (data) => void | Promise<void>) => {
          // console.log('unsub', event,callback)
          emitter.on(event, callback);
          return () => emitter.off(event, callback);
      },
      []
    );

    return { publish, subscribe };
};