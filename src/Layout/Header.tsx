import { useEffect, useState } from 'react'
import { useConnectedDeviceData } from '../rpc/useConnectedDeviceData.ts'
import { useEmitter } from '../helpers/usePubSub.ts'
import { LockState } from '@zmkfirmware/zmk-studio-ts-client/core'
import {
    Redo2,
    Save,
    Trash2,
    Undo2,
} from 'lucide-react'
import { RestoreStock } from '../components/RestoreStock.tsx'
import { callRemoteProcedureControl } from '../rpc/logging.ts'
import useConnectionStore from '../stores/ConnectionStore.ts'
import useLockStore from '../stores/LockStateStore.ts'
import undoRedoStore from '../stores/UndoRedoStore.ts'
import { Settings } from '../components/Modals/Settings.tsx'

export interface AppHeaderProps {
    connectedDeviceLabel?: string
}

export const Header = ({ connectedDeviceLabel }: AppHeaderProps) => {
    const { connection } = useConnectionStore();
    const { undo, redo, canUndo, canRedo, reset } = undoRedoStore();
    const [showSettingsReset, setShowSettingsReset] = useState(false);
    const [connectionAbort, setConnectionAbort] = useState(new AbortController());
    const { lockState } = useLockStore();
    const { subscribe } = useEmitter();

    const [unsaved, setUnsaved] = useConnectedDeviceData<boolean>(
      { keymap: { checkUnsavedChanges: true } },
      (request) => request.keymap?.checkUnsavedChanges
    );

    useEffect(() => {
        console.log(unsaved);
        return subscribe(
            'rpc_notification.keymap.unsavedChangesStatusChanged',
            (ls) => {
              console.log(ls)
                setUnsaved(ls)
          },
        )
    }, [subscribe]);

    useEffect(() => {
        if ((!connection || lockState !== LockState.ZMK_STUDIO_CORE_LOCK_STATE_UNLOCKED) && showSettingsReset) {
            setShowSettingsReset(false);
        }
    }, [lockState, showSettingsReset]);

    const performAction = async (action: string, payload: { [key: string]: { [key: string]: string | boolean}}, postAction?: () => void) => {
        if (!connection) return;
        const resp = await callRemoteProcedureControl(connection, payload);
        if (!resp[action] || resp[action].err) {
            console.error(`Failed to ${action}`, resp, resp[action]);
        }
        if (postAction) postAction();
    };

    async function disconnect() {
        if (!connection) return
        console.log(connection)
        await connection.request_writable.close().finally(() => {
            connectionAbort.abort('User disconnected')
            setConnectionAbort(new AbortController())
        })
    }

    return (
      <header>
          <div className="navbar bg-base-100">
              <div className="navbar-start">
                  <img src="/zmk.svg" alt="ZMK Logo" className="h-8 rounded ps-3" />
                  <span className="px-3">Studio</span>
              </div>
              <div className="navbar-center">
                  <div className={`dropdown ${!connectedDeviceLabel ? 'btn-disabled' : ''}`}>
                      <div tabIndex={0} role="button" className="btn btn-soft">
                          {connectedDeviceLabel}
                      </div>
                      <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
                          <li onClick={() => performAction('disconnect', {}, disconnect)}>
                              <a>Disconnect</a>
                          </li>
                          <RestoreStock  onOk={() => performAction('resetSettings', { core: { resetSettings: true } })} />
                      </ul>
                  </div>
              </div>
              <div className="navbar-end">
                  <Settings />
                  <button className="btn btn-ghost btn-circle tooltip tooltip-bottom mx-1" disabled={!canUndo()} onClick={undo} data-tip="Undo"><Undo2 aria-label="Undo" /></button>
                  <button className="btn btn-ghost btn-circle tooltip tooltip-bottom mx-1" disabled={!canRedo()} onClick={redo} data-tip="Redo"><Redo2 aria-label="Redo" /></button>
                  <button className="btn btn-ghost btn-circle tooltip tooltip-bottom mx-1" disabled={!unsaved} data-tip="Save" onClick={() => performAction('saveChanges', { keymap: { saveChanges: true } })}><Save aria-label="Save" /></button>
                  <button className="btn btn-ghost btn-circle tooltip tooltip-bottom mx-1" disabled={!unsaved} data-tip="Discard" onClick={() => performAction('discardChanges', { keymap: { discardChanges: true } }, reset)}><Trash2 aria-label="Discard" /></button>
              </div>
          </div>
      </header>
    );
};
