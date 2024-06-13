import './app-header.css';

import { useCallback, useContext } from 'react';

import { call_rpc } from "ts-zmk-rpc-core";
import { useConnectedDeviceData } from './rpc/useConnectedDeviceData';
import { useSub } from './usePubSub';
import { ConnectionContext } from './rpc/ConnectionContext';

export interface AppHeaderProps {
    connectedDeviceLabel?: string;
}

export const AppHeader = ({connectedDeviceLabel}: AppHeaderProps) => {
    const [unsaved, setUnsaved] = useConnectedDeviceData<boolean>({ keymap: { checkUnsavedChanges: true }}, (r) => r.keymap?.checkUnsavedChanges);
    const conn = useContext(ConnectionContext);

    useSub("rpc_notification.keymap.unsavedChangesStatusChanged", (unsaved) => setUnsaved(unsaved));

    const save = useCallback(() => {

        async function doSave() {
            if (!conn) {
                return;
            }

            let resp = await call_rpc(conn, { keymap: { saveChanges: true }});
            if (!resp.keymap?.saveChanges) {
                console.error("Failed to save changes", resp);
            }
        };

        doSave();

    }, [conn]);


    const discard = useCallback(() => {
        async function doDiscard() {
            if (!conn) {
                return;
            }
            
            let resp = await call_rpc(conn, { keymap: { discardChanges: true }});
            if (!resp.keymap?.discardChanges) {
                console.error("Failed to discard changes", resp);
            }
        };

        doDiscard();

    }, [conn]);

    return (
        <header className="zmk-app-header">
            <p className='zmk-app-header__product-label'>ZMK Studio</p>
            <p className='zmk-app-header__connected-device'>{connectedDeviceLabel}</p>
            <div className='zmk-app-header__actions'>
                <button disabled={!unsaved} onClick={save}>Save</button>
                <button onClick={discard} disabled={!unsaved}>Discard</button>
            </div>
        </header>
    );
}