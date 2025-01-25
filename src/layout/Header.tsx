import { useConnectedDeviceData } from '../rpc/useConnectedDeviceData.ts';
import { useSub } from '../helpers/usePubSub.ts';
import { useContext, useEffect, useState } from 'react';
import { LockStateContext } from '../rpc/LockStateContext.ts';
import { LockState } from '@zmkfirmware/zmk-studio-ts-client/core';
import { ConnectionContext } from '../rpc/ConnectionContext.ts';
import { Undo2, Redo2, Save, Trash2 } from 'lucide-react';
import { Modal } from '../components/Modal.tsx';
import { RestoreStock } from '../components/RestoreStock.tsx';
import { useUndoRedo } from "../helpers/undoRedo.ts";
import { callRemoteProcedureControl } from "../rpc/logging.ts";

export interface AppHeaderProps {
    connectedDeviceLabel?: string;
    onDiscard?: () => void | Promise<void>;
    onResetSettings?: () => void | Promise<void>;
    onDisconnect?: () => void | Promise<void>;
    canUndo?: boolean;
    canRedo?: boolean;
    connection: any;
}

export const Header = ({
    connectedDeviceLabel,
    onDiscard,
    onDisconnect,
    onResetSettings,
    connection
}: AppHeaderProps) => {
    const [doIt, undo, redo, canUndo, canRedo, reset] = useUndoRedo();
    const [showSettingsReset, setShowSettingsReset] = useState(false);

    const lockState = useContext(LockStateContext);
    const connectionState = useContext(ConnectionContext);

    useEffect(() => {
        if (
            (!connectionState.conn ||
                lockState != LockState.ZMK_STUDIO_CORE_LOCK_STATE_UNLOCKED) &&
            showSettingsReset
        ) {
            setShowSettingsReset(false);
        }
    }, [lockState, showSettingsReset]);

    const [unsaved, setUnsaved] = useConnectedDeviceData<boolean>(
        { keymap: { checkUnsavedChanges: true } },
        (r) => r.keymap?.checkUnsavedChanges,
    );
    async function save(){
        if (!connection.conn) return;

        const resp = await callRemoteProcedureControl(connection.conn, {
            keymap: { saveChanges: true },
        });
        if (!resp.keymap?.saveChanges || resp.keymap?.saveChanges.err) {
            console.error('Failed to save changes', resp.keymap?.saveChanges);
        }
    }

    async function discard() {
        if (!connection.conn) return;

        const resp = await callRemoteProcedureControl(connection.conn, {
            keymap: { discardChanges: true },
        });
        if (!resp.keymap?.discardChanges)
            console.error('Failed to discard changes', resp);

        reset();
        setConn({ conn: connection.conn });
    }
    
    useSub('rpc_notification.keymap.unsavedChangesStatusChanged', (unsaved) => {
        console.log(unsaved);
        setUnsaved(unsaved);
    });

    return (
        <header>
            <div className="navbar bg-base-100">
                <div className="navbar-start">
                    <img
                        src="/zmk.svg"
                        alt="ZMK Logo"
                        className="h-8 rounded ps-3"
                    />
                    <span className="px-3">Studio</span>
                </div>
                <div className="navbar-center">
                    <div
                        className={`dropdown ${!connectedDeviceLabel ? 'btn-disabled' : ''}`}
                    >
                        <div tabIndex={0} role="button" className="btn">
                            {connectedDeviceLabel}
                        </div>
                        <ul
                            tabIndex={0}
                            className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
                        >
                            <li onClick={onDisconnect}>
                                <a>Disconnect</a>
                            </li>
                            <Modal
                                usedFor="restoreStockSettings"
                                customWidth="w-11/12 max-w-5xl"
                                onOk={() => onResetSettings?.()}
                                okButtonText="Restore Stock Settings"
                                modalButton={
                                    <li>
                                        <a>Restore Stock Settings</a>
                                    </li>
                                }
                                hideCloseButton={true}
                            >
                                <RestoreStock></RestoreStock>
                            </Modal>
                        </ul>
                    </div>
                </div>
                <div className="navbar-end">
                    <button
                        className="btn btn-ghost btn-circle tooltip tooltip-bottom mx-1"
                        hidden={!!undo}
                        disabled={!canUndo}
                        onClick={undo}
                    >
                        <Undo2 aria-label="Undo" />
                    </button>
                    <button
                        className="btn btn-ghost btn-circle tooltip tooltip-bottom mx-1"
                        hidden={!!canRedo}
                        disabled={!canRedo}
                        onClick={redo}
                        data-tip="Redo changes"
                    >
                        <Redo2 aria-label="Redo" />
                    </button>
                    <button
                        className="btn btn-ghost btn-circle tooltip tooltip-bottom mx-1"
                        disabled={!unsaved}
                        onClick={save}
                        data-tip="Save changes"
                    >
                        <div className="indicator">
                            <Save aria-label="Save" />
                            <span className="badge badge-xs badge-primary indicator-item"></span>
                        </div>
                    </button>
                    <button
                        className="btn btn-ghost btn-circle tooltip tooltip-bottom mx-1"
                        disabled={!unsaved}
                        onClick={onDiscard}
                        data-tip="Discard changes"
                    >
                        <Trash2 aria-label="Discard" />
                    </button>
                </div>
            </div>
        </header>
    );
};
