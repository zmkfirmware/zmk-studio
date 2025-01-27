import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { LockState } from '@zmkfirmware/zmk-studio-ts-client/core';

// Define the Zustand store interface
interface LockStoreState {
  lockState: LockState;
  setLockState: (state: LockState) => void;
}

// Create Zustand store with devtools middleware
const useLockStore = create<LockStoreState>()(
    devtools((set) => ({
      lockState: LockState.ZMK_STUDIO_CORE_LOCK_STATE_LOCKED,
      setLockState: (state) => set(() => ({ lockState: state })),
    }))
);

export default useLockStore;
