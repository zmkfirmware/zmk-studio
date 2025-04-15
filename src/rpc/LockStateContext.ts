import { createContext } from "react";

import { LockState } from "@zmkfirmware/zmk-studio-ts-client/core";

export const LockStateContext = createContext<LockState>(
  LockState.ZMK_STUDIO_CORE_LOCK_STATE_LOCKED
);
