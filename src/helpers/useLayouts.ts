import { PhysicalLayout } from '@zmkfirmware/zmk-studio-ts-client/keymap';
import React, { SetStateAction, useEffect, useState } from 'react';
import { LockState } from '@zmkfirmware/zmk-studio-ts-client/core';
import { callRemoteProcedureControl } from '../rpc/logging.ts';
import { Request } from '@zmkfirmware/zmk-studio-ts-client';
import type { GetBehaviorDetailsResponse } from '@zmkfirmware/zmk-studio-ts-client/behaviors';
import useConnectionStore from '../stores/ConnectionStore.ts';
import useLockStore from "../stores/LockStateStore.ts";

type BehaviorMap = Record<number, GetBehaviorDetailsResponse>;

export function useBehaviors(): BehaviorMap {
    const { connection } = useConnectionStore.getState();
    const { lockState } = useLockStore();
    const [behaviors, setBehaviors] = useState<BehaviorMap>({});

    useEffect(() => {
        if (
            !connection ||
            lockState != LockState.ZMK_STUDIO_CORE_LOCK_STATE_UNLOCKED
        ) {
            setBehaviors({});
            return;
        }

        async function startRequest() {
            setBehaviors({});

            if (!connection) {
                return;
            }

            const get_behaviors: Request = {
                behaviors: { listAllBehaviors: true },
                requestId: 0,
            };

            const behavior_list = await callRemoteProcedureControl(
                connection,
                get_behaviors,
            );
            if (!ignore) {
                const behavior_map: BehaviorMap = {};
                for (const behaviorId of behavior_list.behaviors
                    ?.listAllBehaviors?.behaviors || []) {
                    if (ignore) {
                        break;
                    }
                    const details_req = {
                        behaviors: { getBehaviorDetails: { behaviorId } },
                        requestId: 0,
                    };
                    const behavior_details = await callRemoteProcedureControl(
                        connection,
                        details_req,
                    );
                    const dets: GetBehaviorDetailsResponse | undefined =
                        behavior_details?.behaviors?.getBehaviorDetails;

                    if (dets) {
                        behavior_map[dets.id] = dets;
                    }
                }

                if (!ignore) {
                    setBehaviors(behavior_map);
                }
            }
        }

        let ignore = false;
        startRequest();

        return () => {
            ignore = true;
        };
    }, [connection, lockState]);

    return behaviors;
}

export function useLayouts(): [
    PhysicalLayout[] | undefined,
    React.Dispatch<SetStateAction<PhysicalLayout[] | undefined>>,
    number,
    React.Dispatch<SetStateAction<number>>,
] {
    // const lockState = useContext(LockStateContext);
    const { lockState } = useLockStore();
    const { connection } = useConnectionStore.getState();

    const [layouts, setLayouts] = useState<PhysicalLayout[] | undefined>(
        undefined,
    );
    const [selectedPhysicalLayoutIndex, setSelectedPhysicalLayoutIndex] =
        useState<number>(0);

    useEffect(() => {
        if (
            !connection ||
            lockState != LockState.ZMK_STUDIO_CORE_LOCK_STATE_UNLOCKED
        ) {
            setLayouts(undefined);
            return;
        }

        async function startRequest() {
            setLayouts(undefined);

            if (!connection) {
                return;
            }

            const response = await callRemoteProcedureControl(connection, {
                keymap: { getPhysicalLayouts: true },
            });

            if (!ignore) {
                setLayouts(response?.keymap?.getPhysicalLayouts?.layouts);
                setSelectedPhysicalLayoutIndex(
                    response?.keymap?.getPhysicalLayouts?.activeLayoutIndex ||
                        0,
                );
            }
        }

        let ignore = false;
        startRequest();

        return () => {
            ignore = true;
        };
    }, [connection, lockState]);

    return [
        layouts,
        setLayouts,
        selectedPhysicalLayoutIndex,
        setSelectedPhysicalLayoutIndex,
    ];
}
