import { useContext, useMemo } from "react";

import type { RpcTransport } from "@zmkfirmware/zmk-studio-ts-client/transport/index";
import type { AvailableDevice } from "./tauri/index";
import { LockStateContext } from "./rpc/LockStateContext";
import { LockState } from "@zmkfirmware/zmk-studio-ts-client/core";
import { ConnectionContext } from "./rpc/ConnectionContext";
import { ExternalLink } from "./misc/ExternalLink";
import { Modal, ModalContent } from "./modal/Modal.tsx";

export type TransportFactory = {
  label: string;
  connect?: () => Promise<RpcTransport>;
  pick_and_connect?: {
    list: () => Promise<Array<AvailableDevice>>;
    connect: (dev: AvailableDevice) => Promise<RpcTransport>;
  };
};

export interface UnlockModalProps {}

export const UnlockModal = ({}: UnlockModalProps) => {
  let conn = useContext(ConnectionContext);
  let lockState = useContext(LockStateContext);

  let open = useMemo(
    () =>
      !!conn.conn && lockState != LockState.ZMK_STUDIO_CORE_LOCK_STATE_UNLOCKED,
    [conn, lockState]
  );

  return (
    <Modal open={open} onOpenChange={() => {}} onBackdropClose={false} onEscapeClose={false}>
      <ModalContent className="max-w-3xl"  showCloseButton={false}>
        <h1 className="text-xl">Unlock To Continue</h1>
        <p>
          For security reasons, your keyboard requires unlocking before using ZMK
          Studio.
        </p>
        <p>
          If studio unlocking hasn't been added to your keymap or a combo, see the{" "}
          <ExternalLink href="https://zmk.dev/docs/keymaps/behaviors/studio-unlock">
            Studio Unlock Behavior
          </ExternalLink>{" "}
          documentation for more infomation.
        </p>
      </ModalContent>
    </Modal>
  );
};
