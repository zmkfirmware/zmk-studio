import {
  Button,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
} from "react-aria-components";
import { useConnectedDeviceData } from "./rpc/useConnectedDeviceData";
import { useSub } from "./usePubSub";
import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
} from "@heroicons/react/24/solid";
import { useContext, useEffect, useState } from "react";
import { useModalRef } from "./misc/useModalRef";
import { LockStateContext } from "./rpc/LockStateContext";
import { LockState } from "@zmkfirmware/zmk-studio-ts-client/core";
import { ConnectionContext } from "./rpc/ConnectionContext";

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

export const AppHeader = ({
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

  return (
    <header className="top-0 left-0 right-0 grid grid-cols-[1fr_auto_1fr] items-center justify-between border-b border-text-base">
      <p className="px-3">ZMK Studio</p>
      <dialog
        ref={showSettingsRef}
        className="p-5 rounded-lg border-text-base border max-w-[50vw]"
      >
        <h2 className="my-2 text-lg">Settings Reset</h2>
        <div>
          <p>
            Settings reset will remove any customizations previously made in ZMK
            Studio and restore the stock keymap
          </p>
          <p>Continue?</p>
          <div className="flex justify-end my-2 gap-3">
            <button onClick={() => setShowSettingsReset(false)}>Cancel</button>
            <button
              onClick={() => {
                setShowSettingsReset(false);
                onResetSettings?.();
              }}
            >
              Reset Settings
            </button>
          </div>
        </div>
      </dialog>
      <MenuTrigger>
        <Button
          className="text-center enabled:after:content-['⏷'] after:relative after:left-2 pr-3"
          isDisabled={!connectedDeviceLabel}
        >
          {connectedDeviceLabel}
        </Button>
        <Popover>
          <Menu className="border rounded bg-bg-base cursor-pointer">
            <MenuItem className="p-1 hover:text-accent" onAction={onDisconnect}>
              Disconnect
            </MenuItem>
            <MenuItem
              className="p-1 hover:text-accent"
              onAction={() => setShowSettingsReset(true)}
            >
              Settings Reset
            </MenuItem>
          </Menu>
        </Popover>
      </MenuTrigger>
      <div className="flex justify-end">
        {onUndo && (
          <button
            type="button"
            className="flex justify-center items-center px-3 py-1.5 enabled:hover:text-accent disabled:text-gray-500"
            disabled={!canUndo}
            onClick={onUndo}
          >
            <ArrowUturnLeftIcon
              className="inline-block w-4 mx-1"
              aria-label="Undo"
            />
          </button>
        )}

        {onRedo && (
          <button
            type="button"
            className="flex items-center justify-center px-3 py-1.5 enabled:hover:text-accent disabled:text-gray-500"
            disabled={!canRedo}
            onClick={onRedo}
          >
            <ArrowUturnRightIcon
              className="inline-block w-4 mx-1"
              aria-label="Redo"
            />
          </button>
        )}
        <button
          type="button"
          className="px-3 py-1.5 enabled:hover:text-accent disabled:text-gray-500"
          disabled={!unsaved}
          onClick={onSave}
        >
          Save
        </button>
        <button
          type="button"
          className="px-3 py-1.5 enabled:hover:text-accent disabled:text-gray-500"
          onClick={onDiscard}
          disabled={!unsaved}
        >
          Discard
        </button>
      </div>
    </header>
  );
};
