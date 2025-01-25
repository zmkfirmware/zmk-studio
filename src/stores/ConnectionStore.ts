import {  createStore } from "zustand";
import { RpcConnection } from "@zmkfirmware/zmk-studio-ts-client";

// Define the store interface
interface ConnectionState {
  connection: RpcConnection | null;
  setConnection: (connection: RpcConnection | null) => void;
  resetConnection: () => void;
}

// Create Zustand store
const useConnectionStore = createStore<ConnectionState>((set) => ({
  connection: null,
  setConnection: (connection) => set({ connection: connection }),
  resetConnection: () => set({ connection: null }),
}));

export default useConnectionStore;
