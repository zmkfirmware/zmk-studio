import React, { SetStateAction, useEffect, useState } from 'react';

import { callRemoteProcedureControl } from './logging';

import { Request, RequestResponse } from '@zmkfirmware/zmk-studio-ts-client';
import { LockState } from '@zmkfirmware/zmk-studio-ts-client/core';
import useConnectionStore from '../stores/ConnectionStore.ts';
import useLockStore from '../stores/LockStateStore.ts';

export function useConnectedDeviceData<T>(
    req: Omit<Request, 'requestId'>,
    response_mapper: (resp: RequestResponse) => T | undefined,
    requireUnlock?: boolean,
): [T | undefined, React.Dispatch<SetStateAction<T | undefined>>] {
    const { connection } = useConnectionStore();
    const { lockState } = useLockStore();
    const [data, setData] = useState<T | undefined>(undefined);

    useEffect( () => {
            if ( !connection || (requireUnlock && lockState != LockState.ZMK_STUDIO_CORE_LOCK_STATE_UNLOCKED) ) {
                setData(undefined);
                return;
            }

            async function startRequest() {
                setData(undefined);

                if (!connection) return

                const response = response_mapper(
                    await callRemoteProcedureControl(connection, req)
                );

                if (!ignore) setData(response)
            }

            let ignore = false;
            startRequest();

            return () => ignore = true;
        },
        requireUnlock ? [connection, requireUnlock, lockState] : [connection, requireUnlock],
    );

    return [data, setData];
}
