import { create } from 'zustand';
import { LockState } from '@zmkfirmware/zmk-studio-ts-client/core';

// Define the Zustand store interface
interface LockStoreState {
  lockState: LockState;
  setLockState: (state: LockState) => void;
}

// Create Zustand store
const useLockStore = create<LockStoreState>((set) => ({
  lockState: LockState.ZMK_STUDIO_CORE_LOCK_STATE_LOCKED,
  setLockState: (state) => set(() => ({ lockState: state })),
}));

export default useLockStore;
