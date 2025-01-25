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
import { TRANSPORTS } from "./helpers/transports.ts";


function App() {
    const [conn, setConn] = useState<ConnectionState>({ conn: null });
    const [connectedDeviceName, setConnectedDeviceName] = useState<
        string | undefined
    >(undefined);
    const [doIt, undo, redo, canUndo, canRedo, reset] = useUndoRedo();
    const [connectionAbort, setConnectionAbort] = useState(
        new AbortController(),
    );
    const [lockState, setLockState] = useState<LockState>(
        LockState.ZMK_STUDIO_CORE_LOCK_STATE_LOCKED,
    );

    useSub('rpc_notification.core.lockStateChanged', (ls) => {
        console.log(ls)
        setLockState(ls)
    });

    useEffect(() => {
        if (!conn) {
            reset();
            setLockState(LockState.ZMK_STUDIO_CORE_LOCK_STATE_LOCKED);
        }

        async function updateLockState() {
            if (!conn.conn) return;

            const locked_resp = await callRemoteProcedureControl(conn.conn, {
                core: { getLockState: true },
            });

            setLockState(
                locked_resp.core?.getLockState ||
                    LockState.ZMK_STUDIO_CORE_LOCK_STATE_LOCKED,
            );
        }

        updateLockState();
    }, [conn, setLockState]);

    // async function save(){
    //     if (!conn.conn) return;
    //
    //     const resp = await call_rpc(conn.conn, {
    //         keymap: { saveChanges: true },
    //     });
    //     if (!resp.keymap?.saveChanges || resp.keymap?.saveChanges.err) {
    //         console.error('Failed to save changes', resp.keymap?.saveChanges);
    //     }
    // }

    async function discard() {
        if (!conn.conn) return;

        const resp = await callRemoteProcedureControl(conn.conn, {
            keymap: { discardChanges: true },
        });
        if (!resp.keymap?.discardChanges)
            console.error('Failed to discard changes', resp);

        reset();
        setConn({ conn: conn.conn });
    }

    async function resetSettings() {
        if (!conn.conn) return;

        const resp = await callRemoteProcedureControl(conn.conn, {
            core: { resetSettings: true },
        });
        if (!resp.core?.resetSettings)
            console.error('Failed to settings reset', resp);

        reset();
        setConn({ conn: conn.conn });
    }

    async function disconnect() {
        if (!conn.conn) return;

        await conn.conn.request_writable.close().finally(() => {
            connectionAbort.abort('User disconnected');
            setConnectionAbort(new AbortController());
        });
    }

    function onConnect(t: RpcTransport) {
        const ac = new AbortController();
        setConnectionAbort(ac);
        connect(t, setConn, setConnectedDeviceName, ac.signal);
    }
    return (
        <ConnectionContext.Provider value={conn}>
            <LockStateContext.Provider value={lockState}>
                <UndoRedoContext.Provider value={doIt}>
                    <UnlockModal />
                    <ConnectModal
                        open={!conn.conn}
                        transports={TRANSPORTS}
                        onTransportCreated={onConnect}
                    />
                    <div className="bg-base-100 text-base-content h-full max-h-[100vh] w-full max-w-[100vw] inline-grid grid-cols-[auto] grid-rows-[auto_1fr_auto] overflow-hidden">
                        <Header
                            connection={ conn }
                            connectedDeviceLabel={connectedDeviceName}
                            onDiscard={discard}
                            onDisconnect={disconnect}
                            onResetSettings={resetSettings}
                        />
                        <Keyboard />
                        <Footer />
                    </div>
                </UndoRedoContext.Provider>
            </LockStateContext.Provider>
        </ConnectionContext.Provider>
    );
}

export default App;
