import React, { SetStateAction, useContext, useEffect, useState } from "react";
import { ConnectionContext } from "./ConnectionContext";

import { call_rpc } from "./logging";

import { Request, RequestResponse } from "@zmkfirmware/zmk-studio-ts-client";
import { LockStateContext } from "./LockStateContext";
import { LockState } from "@zmkfirmware/zmk-studio-ts-client/core";

export function useConnectedDeviceData<T>(
  req: Omit<Request, "requestId">,
  response_mapper: (resp: RequestResponse) => T | undefined,
  requireUnlock?: boolean,
): [T | undefined, React.Dispatch<SetStateAction<T | undefined>>] {
  const connection = useContext(ConnectionContext);
  const lockState = useContext(LockStateContext);
  const [data, setData] = useState<T | undefined>(undefined);

  useEffect(
    () => {
      if (
        !connection.conn ||
        (requireUnlock &&
          lockState != LockState.ZMK_STUDIO_CORE_LOCK_STATE_UNLOCKED)
      ) {
        setData(undefined);
        return;
      }

      async function startRequest() {
        setData(undefined);
        if (!connection.conn) {
          return;
        }

        const response = response_mapper(await call_rpc(connection.conn, req));

        if (!ignore) {
          setData(response);
        }
      }

      let ignore = false;
      startRequest();

      return () => {
        ignore = true;
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    requireUnlock
      ? [connection, requireUnlock, lockState]
      : [connection, requireUnlock],
  );

  return [data, setData];
}
