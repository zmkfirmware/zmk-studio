import { callRemoteProcedureControl } from './rpc/logging';

import { ConnectionState, ConnectionContext } from './rpc/ConnectionContext';
import { useCallback, useEffect, useState } from 'react';
import { ConnectModal, TransportFactory } from './components/ConnectModal.tsx';

import type { RpcTransport } from '@zmkfirmware/zmk-studio-ts-client/transport/index';
import { UndoRedoContext, useUndoRedo } from './helpers/undoRedo.ts';
import { useSub } from './helpers/usePubSub.ts';
import { LockState } from '@zmkfirmware/zmk-studio-ts-client/core';
import { LockStateContext } from './rpc/LockStateContext';
import { UnlockModal } from './components/UnlockModal.tsx';
import { connect } from './services/RPCService.ts';
import { Header } from './layout/Header.tsx';
import Keyboard from './components/keyboard/Keyboard.tsx';
import { Footer } from './layout/Footer.tsx';
import { TRANSPORTS } from './helpers/transports.ts';
import useConnectionStore from './stores/ConnectionStore.ts';
import useLockStore from './stores/LockStateStore.ts';
import undoRedoStore from './stores/UndoRedoStore.ts';

function App() {
    const { connection, setConnection } = useConnectionStore.getState();
    const [connectedDeviceName, setConnectedDeviceName] = useState<
        string | undefined
    >(undefined);
    // const [doIt, undo, redo, canUndo, canRedo, reset] = useUndoRedo();
    const { reset } = undoRedoStore();
    const [connectionAbort, setConnectionAbort] = useState(
        new AbortController(),
    );
    const { setLockState } = useLockStore();

    useSub('rpc_notification.core.lockStateChanged', (ls) => {
        console.log(ls);
        setLockState(ls);
    });

    useEffect(() => {
        if (!connection) {
            reset();
            setLockState(LockState.ZMK_STUDIO_CORE_LOCK_STATE_LOCKED);
        }

        async function updateLockState() {
            if (!connection) return;

            const locked_resp = await callRemoteProcedureControl(connection, {
                core: { getLockState: true },
            });

            setLockState(
                locked_resp.core?.getLockState ||
                    LockState.ZMK_STUDIO_CORE_LOCK_STATE_LOCKED,
            );
        }

        updateLockState();
    }, [connection, setLockState]);

    function onConnect(t: RpcTransport) {
        const ac = new AbortController();
        setConnectionAbort(ac);
        connect(t, setConnectedDeviceName, ac.signal);
    }

    return (
        <>
            <UnlockModal />
            <ConnectModal
                open={!connection}
                transports={TRANSPORTS}
                onTransportCreated={onConnect}
            />
            <div className="bg-base-100 text-base-content h-full max-h-[100vh] w-full max-w-[100vw] inline-grid grid-cols-[auto] grid-rows-[auto_1fr_auto] overflow-hidden">
                <Header connectedDeviceLabel={connectedDeviceName} />
                <Keyboard />
                <Footer />
            </div>
        </>
    );
}

export default App;
