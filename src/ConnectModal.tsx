import { useEffect, useRef, useState } from "react";

import type { RpcTransport } from "@zmkfirmware/zmk-studio-ts-client/transport/index";
import type { AvailableDevice } from "./tauri/index";

export type TransportFactory = {
  label: string;
  connect?: () => Promise<RpcTransport>;
  pick_and_connect?: {
    list: () => Promise<Array<AvailableDevice>>;
    connect: (dev: AvailableDevice) => Promise<RpcTransport>;
  };
};

export interface ConnectModalProps {
  open?: boolean;
  transports: TransportFactory[];
  onTransportCreated: (t: RpcTransport) => void;
}

export const ConnectModal = ({
  open,
  transports,
  onTransportCreated,
}: ConnectModalProps) => {
  const dialog = useRef<HTMLDialogElement | null>(null);
  const [availableDevices, setAvailableDevices] = useState<
    AvailableDevice[] | undefined
  >(undefined);
  const [selectedTransport, setSelectedTransport] = useState<
    TransportFactory | undefined
  >(undefined);

  useEffect(() => {
    if (!selectedTransport) {
      setAvailableDevices(undefined);
      return;
    }

    let ignore = false;

    if (selectedTransport.connect) {
      async function connectTransport() {
        const transport = await selectedTransport?.connect?.();

        if (!ignore) {
          if (transport) {
            onTransportCreated(transport);
          }
          setSelectedTransport(undefined);
        }
      }

      connectTransport();
    } else {
      async function loadAvailableDevices() {
        const devices = await selectedTransport?.pick_and_connect?.list();

        if (!ignore) {
          setAvailableDevices(devices);
        }
      }

      loadAvailableDevices();
    }

    return () => {
      ignore = true;
    };
  }, [selectedTransport]);

  let connections = transports.map((t) => (
    <li key={t.label} className="p-1 m-1 list-none">
      <button type="button" onClick={async () => setSelectedTransport(t)}>
        {t.label}
      </button>
    </li>
  ));

  useEffect(() => {
    if (dialog.current) {
      if (open) {
        if (!dialog.current.open) {
          dialog.current.showModal();
        }
      } else {
        dialog.current.close();
      }
    }
  }, [open]);

  return (
    <dialog ref={dialog} className="p-5 rounded-lg border-text-base border">
      <h1 className="text-xl">Welcome to ZMK Studio</h1>
      <p>Select a connection type:</p>
      <ul>{connections}</ul>
      {selectedTransport && availableDevices && (
        <ul>
          {availableDevices.map((d) => (
            <li
              key={d.id}
              className="m-1 p-1"
              onClick={async () => {
                onTransportCreated(
                  await selectedTransport!.pick_and_connect!.connect(d)
                );
                setSelectedTransport(undefined);
              }}
            >
              {d.label}
            </li>
          ))}
        </ul>
      )}
    </dialog>
  );
};
