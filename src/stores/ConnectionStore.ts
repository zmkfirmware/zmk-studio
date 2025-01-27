import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { RpcConnection } from "@zmkfirmware/zmk-studio-ts-client";

// Define the store interface
interface ConnectionState {
  connection: RpcConnection | null;
  setConnection: (connection: RpcConnection | null) => void;
  resetConnection: () => void;
}

// Create Zustand store with devtools middleware
const useConnectionStore = create<ConnectionState>()(
    devtools((set) => ({
      connection: null,
      setConnection: (connection) => set({ connection: connection }),
      resetConnection: () => set({ connection: null }),
    }))
);

export default useConnectionStore;