import { useConnectedDeviceData } from "./rpc/useConnectedDeviceData";
import { useSub } from "./usePubSub";
import {
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
} from "@heroicons/react/24/solid";

export interface AppHeaderProps {
  connectedDeviceLabel?: string;
  onSave?: () => void | Promise<void>;
  onDiscard?: () => void | Promise<void>;
  onUndo?: () => Promise<void>;
  onRedo?: () => Promise<void>;
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
}: AppHeaderProps) => {
  const [unsaved, setUnsaved] = useConnectedDeviceData<boolean>(
    { keymap: { checkUnsavedChanges: true } },
    (r) => r.keymap?.checkUnsavedChanges
  );

  useSub("rpc_notification.keymap.unsavedChangesStatusChanged", (unsaved) =>
    setUnsaved(unsaved)
  );

  return (
    <header className="top-0 left-0 right-0 grid grid-cols-[1fr_auto_1fr] items-center justify-between border-b border-text-base">
      <p className="px-3">ZMK Studio</p>
      <p className="text-center">{connectedDeviceLabel}</p>
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
          onClick={onSave}
        >
          Save
        </button>
        <button
          type="button"
          className="rounded border-solid border-transparent px-3 py-1.5 border enabled:hover:border-text-base disabled:text-gray-500"
          onClick={onDiscard}
          disabled={!unsaved}
        >
          Discard
        </button>
      </div>
    </header>
  );
};
