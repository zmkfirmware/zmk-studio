import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { RpcConnection } from '@zmkfirmware/zmk-studio-ts-client';

// Define the store interface
interface ConnectionState {
    connection: RpcConnection | null;
    setConnection: (connection: RpcConnection | null) => void;
    resetConnection: () => void;
    showConnectionModal: boolean;
    setShowConnectionModal: (visible: boolean) => void;
}

// Middleware to check if a connection exists and show the modal if not
const connectionMiddleware = (config) => (set: any, get: any, api: any) =>
    config(
        (args) => {
            if (args.connection === null) {
                set({ showConnectionModal: true });
            } else {
                set({ showConnectionModal: false });
            }
            set(args);
        },
        get,
        api
    );

// Create Zustand store with middleware and persistence
const useConnectionStore = create<ConnectionState>()(
    devtools(
        connectionMiddleware((set) => ({
            connection: null,
            setConnection: (connection) => useConnectionStore.setState({ connection: connection }),
            resetConnection: () => set({ connection: null }),
            showConnectionModal: false,
            setShowConnectionModal: (visible) => set({ showConnectionModal: visible }),
        }))
    )
);

export default useConnectionStore;
