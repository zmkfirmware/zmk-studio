import { Keymap } from '@zmkfirmware/zmk-studio-ts-client/keymap';
import { createContext, Dispatch, PropsWithChildren, SetStateAction, useContext } from 'react';
import { useConnectedDeviceData } from '../rpc/useConnectedDeviceData';

interface KeymapContextValue {
    keymap: Keymap | undefined;
    setKeymap: Dispatch<SetStateAction<Keymap | undefined>>;
}

const KeymapContext = createContext<KeymapContextValue | undefined>(undefined);

export const KeymapProvider = ({ children }: PropsWithChildren<{}>) => {
    const [keymap, setKeymap] = useConnectedDeviceData<Keymap>(
        { keymap: { getKeymap: true } },
        (keymap) => {
          console.log("Got the keymap!");
          return keymap?.keymap?.getKeymap;
        },
        true
      );

    return (
        <KeymapContext.Provider value={{ keymap, setKeymap }}>
            {children}
        </KeymapContext.Provider>
    );
}

export const useKeymap = (): KeymapContextValue => {
    const context = useContext(KeymapContext);
    if (!context) {
        throw new Error('useKeymap must be used within a KeymapProvider');
    }
    return context;
}