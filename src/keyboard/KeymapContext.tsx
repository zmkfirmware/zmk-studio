import { createContext, useContext, ReactNode } from "react";
import { Keymap } from "@zmkfirmware/zmk-studio-ts-client/keymap";
import { GetBehaviorDetailsResponse } from "@zmkfirmware/zmk-studio-ts-client/behaviors";

type BehaviorMap = Record<number, GetBehaviorDetailsResponse>;

interface KeymapContextType {
  keymap: Keymap | undefined;
  behaviors: BehaviorMap;
  deviceName: string | undefined;
}

const KeymapContext = createContext<KeymapContextType | undefined>(undefined);

export const useKeymapContext = () => {
  const context = useContext(KeymapContext);
  return context || { keymap: undefined, behaviors: {}, deviceName: undefined };
};

export const KeymapProvider = ({
  children,
  keymap,
  behaviors,
  deviceName,
}: {
  children: ReactNode;
  keymap: Keymap | undefined;
  behaviors: BehaviorMap;
  deviceName: string | undefined;
}) => {
  return (
    <KeymapContext.Provider value={{ keymap, behaviors, deviceName }}>
      {children}
    </KeymapContext.Provider>
  );
};
