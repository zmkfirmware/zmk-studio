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
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { LockStateContext } from "./rpc/LockStateContext";
import { LockState } from "@zmkfirmware/zmk-studio-ts-client/core";
import { ConnectionContext } from "./rpc/ConnectionContext";
import {
  ChevronDown,
  Undo2,
  Redo2,
  Save,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Tooltip } from "./misc/Tooltip";
import { Modal, ModalContent } from "./modal/Modal";

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

const RestoreSettingsPrompt: FC<
  Pick<AppHeaderProps, "onResetSettings"> & {
    open: boolean;
    onOpenChange: (value: boolean) => void | Dispatch<SetStateAction<boolean>>;
  }
> = ({ onResetSettings, open, onOpenChange }) => {
  const handleContinue = useCallback(() => {
    onOpenChange(false);
    onResetSettings?.();
  }, [onOpenChange, onResetSettings]);

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="relative w-96 pt-8 px-6">
        <div className="space-y-6">
          <div className="flex flex-row gap-2 justify-center items-center">
            <AlertTriangle className="size-6 text-amber-500" />
            <span className="text-lg text-base-content">
              Restore stock settings.
            </span>
          </div>
          <div className="space-y-4 text-center text-sm">
            <p className="text-base-content tracking-wide">
              Reset will restore the default keymap and remove all ZMK Studio
              customizations.
            </p>

            <p className="text-base-content">
              Are you sure you want to continue?
            </p>
          </div>
          <div className="flex justify-end items-center gap-3">
            <button
              className="rounded bg-base-300 hover:bg-base-300 px-3 py-2"
              onClick={() => onOpenChange(false)}
            >
              <span>Cancel</span>
            </button>
            <button
              className="rounded bg-red-800 hover:bg-red-600 px-3 py-2 text-white"
              onClick={handleContinue}
            >
              <span>Reset Settings</span>
            </button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};

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

  const [promptRestoreSettings, setPromptRestoreSettings] = useState(false);

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

  useSub("rpc_notification.keymap.unsavedChangesStatusChanged", (unsaved) =>
    setUnsaved(unsaved),
  );

  return (
    <header className="top-0 left-0 right-0 grid grid-cols-[1fr_auto_1fr] items-center justify-between h-10 max-w-full">
      <div className="flex px-3 items-center gap-1">
        <img src="/zmk.svg" alt="ZMK Logo" className="h-8 rounded" />
        <p>Studio</p>
      </div>

      <MenuTrigger>
        <Button
          className="text-center rac-disabled:opacity-0 hover:bg-base-300 transition-all duration-100 p-1 pl-2 rounded-lg"
          isDisabled={!connectedDeviceLabel}
        >
          {connectedDeviceLabel}
          <ChevronDown className="inline-block w-4" />
        </Button>
        <Popover>
          <Menu className="shadow-md rounded bg-base-100 text-base-content cursor-pointer overflow-hidden">
            <MenuItem
              className="px-2 py-1 hover:bg-base-200"
              onAction={onDisconnect}
            >
              Disconnect
            </MenuItem>
            <MenuItem
              className="px-2 py-1 hover:bg-base-200"
              onAction={() => setPromptRestoreSettings(true)}
            >
              Restore Stock Settings
            </MenuItem>
          </Menu>
        </Popover>
      </MenuTrigger>
      <div className="flex justify-end gap-1 px-2">
        {onUndo && (
          <Tooltip label="Undo">
            <Button
              className="flex items-center justify-center p-1.5 rounded enabled:hover:bg-base-300 disabled:opacity-50"
              isDisabled={!canUndo}
              onPress={onUndo}
            >
              <Undo2 className="inline-block w-4 mx-1" aria-label="Undo" />
            </Button>
          </Tooltip>
        )}

        {onRedo && (
          <Tooltip label="Redo">
            <Button
              className="flex items-center justify-center p-1.5 rounded enabled:hover:bg-base-300 disabled:opacity-50"
              isDisabled={!canRedo}
              onPress={onRedo}
            >
              <Redo2 className="inline-block w-4 mx-1" aria-label="Redo" />
            </Button>
          </Tooltip>
        )}
        <Tooltip label="Save">
          <Button
            className="flex items-center justify-center p-1.5 rounded enabled:hover:bg-base-300 disabled:opacity-50"
            isDisabled={!unsaved}
            onPress={onSave}
          >
            <Save className="inline-block w-4 mx-1" aria-label="Save" />
          </Button>
        </Tooltip>
        <Tooltip label="Discard">
          <Button
            className="flex items-center justify-center p-1.5 rounded enabled:hover:bg-base-300 disabled:opacity-50"
            onPress={onDiscard}
            isDisabled={!unsaved}
          >
            <Trash2 className="inline-block w-4 mx-1" aria-label="Discard" />
          </Button>
        </Tooltip>
      </div>

      <RestoreSettingsPrompt
        open={promptRestoreSettings}
        onOpenChange={setPromptRestoreSettings}
        onResetSettings={onResetSettings}
      />
    </header>
  );
};
