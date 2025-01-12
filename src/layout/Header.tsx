import { useConnectedDeviceData } from "../rpc/useConnectedDeviceData.ts";
import { useSub } from "../helpers/usePubSub.ts";
import { useContext, useEffect, useState } from "react";
import { useModalRef } from "../misc/useModalRef.ts";
import { LockStateContext } from "../rpc/LockStateContext.ts";
import { LockState } from "@zmkfirmware/zmk-studio-ts-client/core";
import { ConnectionContext } from "../rpc/ConnectionContext.ts";
import { ChevronDown, Undo2, Redo2, Save, Trash2 } from "lucide-react";

export interface AppHeaderProps {
  connectedDeviceLabel?: string;
  onSave?: () => void | Promise<void>;
  onDiscard?: () => void | Promise<void>;
  onUndo?: () => Promise<void>;
  onRedo?: () => Promise<void>;
  onResetSettings?: () => void | Promise<void>;
  onDisconnect?: () => void | Promise<void>;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const Header = ( {
  connectedDeviceLabel,
  canRedo,
  canUndo,
  onRedo,
  onUndo,
  onSave,
  onDiscard,
  onDisconnect,
  onResetSettings,
}: AppHeaderProps) => {
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

  const showSettingsRef = useModalRef(showSettingsReset);
  const [unsaved, setUnsaved] = useConnectedDeviceData<boolean>(
    { keymap: { checkUnsavedChanges: true } },
    (r) => r.keymap?.checkUnsavedChanges,
  );

  useSub("rpc_notification.keymap.unsavedChangesStatusChanged", (unsaved) =>
    setUnsaved(unsaved),
  );
  console.log(showSettingsRef, connectedDeviceLabel, unsaved);
  // const handleClick = () => {
  //   const elem = document.activeElement;
  //   if (elem) {
  //     elem?.blur();
  //   }
  // };
  return (
    <header>
      {/*<Navbar></Navbar>*/}
      <div className="navbar bg-base-100">
        <div className="navbar-start">
          <img src="/zmk.svg" alt="ZMK Logo" className="h-8 rounded ps-3" />
          <span className="px-3">Studio</span>
        </div>
        <div className="navbar-center">
          <div
            className={`dropdown ${!connectedDeviceLabel ? "btn-disabled" : ""}`}
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
              <li onClick={() => setShowSettingsReset(true)}>
                <a>Restore Stock Settings</a>
              </li>
            </ul>
          </div>
        </div>
        <div className="navbar-end">
          <button
            className="btn btn-ghost btn-circle tooltip tooltip-bottom mx-1"
            hidden={!!onUndo}
            disabled={!canUndo}
            onClick={onUndo}
          >
            <Undo2 aria-label="Undo" />
          </button>
          <button
            className="btn btn-ghost btn-circle tooltip tooltip-bottom mx-1"
            hidden={!!canRedo}
            disabled={!canRedo}
            onClick={onRedo}
            data-tip="Redo changes"
          >
            <Redo2 aria-label="Redo" />
          </button>
          <button
            className="btn btn-ghost btn-circle tooltip tooltip-bottom mx-1"
            disabled={!unsaved}
            onClick={onSave}
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
