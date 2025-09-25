import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { RpcConnection } from '@zmkfirmware/zmk-studio-ts-client';
import { LockState } from "@zmkfirmware/zmk-studio-ts-client/core"

// Define the store interface
interface ConnectionState {
    connection: RpcConnection | null;
    communication: 'serial' | 'ble' | null;
    deviceName: string | null;
    lockState: LockState;
    setConnection: (connection: RpcConnection | null, communication?: 'serial' | 'ble') => void;
    setDeviceName: (name: string | null) => void;
    setLockState: (state: LockState) => void;
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
            communication: null,
            deviceName: null,
            lockState: LockState.ZMK_STUDIO_CORE_LOCK_STATE_LOCKED,
            setConnection: (connection, communication = null) => set({ connection, communication }),
            setDeviceName: (name) => set({ deviceName: name }),
            setLockState: (state) => set({ lockState: state }),
            resetConnection: () => set({ 
                connection: null, 
                communication: null, 
                deviceName: null,
                lockState: LockState.ZMK_STUDIO_CORE_LOCK_STATE_LOCKED 
            }),
            showConnectionModal: false,
            setShowConnectionModal: (visible) => set({ showConnectionModal: visible }),
        })),
    ),
)

export default useConnectionStore;
