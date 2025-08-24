import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { RpcConnection } from '@zmkfirmware/zmk-studio-ts-client';

// Define the store interface
interface ConnectionState {
    connection: RpcConnection | null;
    transportType: 'serial' | 'ble' | null;
    setConnection: (connection: RpcConnection | null, transportType?: 'serial' | 'ble') => void;
    resetConnection: () => void;
    showConnectionModal: boolean;
    setShowConnectionModal: (visible: boolean) => void;
}

// Middleware to check if a connection exists and show the modal if not
const connectionMiddleware = (config) => (
    set,
    get,
    api) =>
    config( (args) => {
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
            transportType: null,
            setConnection: (connection, transportType = null) => set({ connection, transportType }),
            resetConnection: () => set({ connection: null, transportType: null }),
            showConnectionModal: false,
            setShowConnectionModal: (visible) =>
                set({ showConnectionModal: visible }),
        })),
    ),
)

export default useConnectionStore;
