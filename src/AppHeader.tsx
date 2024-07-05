import { useCallback, useContext } from "react";

import { call_rpc } from "@zmkfirmware/zmk-studio-ts-client";
import { useConnectedDeviceData } from "./rpc/useConnectedDeviceData";
import { useSub } from "./usePubSub";
import { ConnectionContext } from "./rpc/ConnectionContext";
import { GetDeviceInfoResponse } from "@zmkfirmware/zmk-studio-ts-client/core";
import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
} from "@heroicons/react/24/solid";

export interface AppHeaderProps {
  connectedDeviceLabel?: string;
  onUndo?: () => Promise<void>;
  onRedo?: () => Promise<void>;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const AppHeader = ({
  canRedo,
  canUndo,
  onRedo,
  onUndo,
}: AppHeaderProps) => {
  const [unsaved, setUnsaved] = useConnectedDeviceData<boolean>(
    { keymap: { checkUnsavedChanges: true } },
    (r) => r.keymap?.checkUnsavedChanges
  );

  const [deviceInfo, _setDeviceInfo] =
    useConnectedDeviceData<GetDeviceInfoResponse>(
      { core: { getDeviceInfo: true } },
      (r) => r.core?.getDeviceInfo
    );
  const conn = useContext(ConnectionContext);

  useSub("rpc_notification.keymap.unsavedChangesStatusChanged", (unsaved) =>
    setUnsaved(unsaved)
  );

  const save = useCallback(() => {
    async function doSave() {
      if (!conn) {
        return;
      }

      let resp = await call_rpc(conn, { keymap: { saveChanges: true } });
      if (!resp.keymap?.saveChanges) {
        console.error("Failed to save changes", resp);
      }
    }

    doSave();
  }, [conn]);

  const discard = useCallback(() => {
    async function doDiscard() {
      if (!conn) {
        return;
      }

      let resp = await call_rpc(conn, { keymap: { discardChanges: true } });
      if (!resp.keymap?.discardChanges) {
        console.error("Failed to discard changes", resp);
      }
    }

    doDiscard();
  }, [conn]);

  return (
    <header className="top-0 left-0 right-0 grid grid-cols-[1fr_auto_1fr] items-center justify-between border-b border-text-base">
      <p className="px-3">ZMK Studio</p>
      <p className="text-center">{deviceInfo?.name}</p>
      <div className="flex justify-end">
        {onUndo && (
          <button
            type="button"
            className="flex justify-center items-center rounded border-solid border-transparent px-3 py-1.5 border enabled:hover:border-text-base disabled:text-gray-500"
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
            className="flex items-center justify-center rounded border-solid border-transparent px-3 py-1.5 border enabled:hover:border-text-base disabled:text-gray-500"
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
          className="rounded border-solid border-transparent px-3 py-1.5 border enabled:hover:border-text-base disabled:text-gray-500"
          disabled={!unsaved}
          onClick={save}
        >
          Save
        </button>
        <button
          type="button"
          className="rounded border-solid border-transparent px-3 py-1.5 border enabled:hover:border-text-base disabled:text-gray-500"
          onClick={discard}
          disabled={!unsaved}
        >
          Discard
        </button>
      </div>
    </header>
  );
};
