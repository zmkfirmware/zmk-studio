import { FC, useCallback, useEffect, useMemo, useState } from "react";

import type { RpcTransport } from "@zmkfirmware/zmk-studio-ts-client/transport/index";
import { UserCancelledError } from "@zmkfirmware/zmk-studio-ts-client/transport/errors";
import type { AvailableDevice } from "./tauri/index";
import { Bluetooth, RefreshCw } from "lucide-react";
import { Key, ListBox, ListBoxItem, Selection } from "react-aria-components";
import { useModalRef } from "./misc/useModalRef";
import { ExternalLink } from "./misc/ExternalLink";
import { GenericModal } from "./GenericModal";

export type TransportFactory = {
  label: string;
  isWireless?: boolean;
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

const DeviceList: FC<ConnectModalProps> = ({
  open,
  transports,
  onTransportCreated,
}) => {
  const [devices, setDevices] = useState<
    Array<[TransportFactory, AvailableDevice]>
  >([]);
  const [selectedDev, setSelectedDev] = useState(new Set<Key>());
  const [refreshing, setRefreshing] = useState(false);

  const LoadEm = useCallback(async () => {
    setRefreshing(true);
    const entries: Array<[TransportFactory, AvailableDevice]> = [];
    for (const t of transports.filter((t) => t.pick_and_connect)) {
      const devices = await t.pick_and_connect?.list();
      if (!devices) {
        continue;
      }

      entries.push(
        ...devices.map<[TransportFactory, AvailableDevice]>((d) => {
          return [t, d];
        }),
      );
    }

    setDevices(entries);
    setRefreshing(false);
  }, [transports]);

  useEffect(() => {
    setSelectedDev(new Set());
    setDevices([]);

    LoadEm().then(console.info).catch(console.error);
  }, [transports, open, setDevices, LoadEm]);

  const onRefresh = useCallback(() => {
    setSelectedDev(new Set());
    setDevices([]);

    LoadEm().then(console.info).catch(console.error);
  }, [LoadEm]);

  const onSelect = useCallback(
    async (keys: Selection) => {
      if (keys === "all") {
        return;
      }
      const dev = devices.find(([_t, d]) => keys.has(d.id));
      if (dev) {
        dev[0]
          .pick_and_connect!.connect(dev[1])
          .then(onTransportCreated)
          .catch((e) => alert(e));
      }
    },
    [devices, onTransportCreated],
  );

  return (
    <div>
      <div className="grid grid-cols-[1fr_auto]">
        <label>Select A Device:</label>
        <button
          className="rounded p-1 hover:bg-base-300 disabled:bg-base-100 disabled:opacity-75"
          disabled={refreshing}
          onClick={onRefresh}
        >
          <RefreshCw
            className={`size-5 transition-transform ${
              refreshing ? "animate-spin" : ""
            }`}
          />
        </button>
      </div>
      <ListBox
        aria-label="Device"
        items={devices}
        onSelectionChange={onSelect}
        selectionMode="single"
        selectedKeys={selectedDev}
        className="flex flex-col gap-1 pt-1"
      >
        {([t, d]) => (
          <ListBoxItem
            className="grid cursor-pointer grid-cols-[1em_1fr] rounded px-1 hover:bg-base-300"
            id={d.id}
            aria-label={d.label}
          >
            {t.isWireless && (
              <Bluetooth className="h-full w-4 content-center justify-center" />
            )}
            <span className="col-start-2">{d.label}</span>
          </ListBoxItem>
        )}
      </ListBox>
    </div>
  );
};

const SimpleDevicePicker: FC<Omit<ConnectModalProps, "open">> = ({
  transports,
  onTransportCreated,
}) => {
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

    async function connectTransport() {
      try {
        const transport = await selectedTransport?.connect?.();

        if (!ignore) {
          if (transport) {
            onTransportCreated(transport);
          }
          setSelectedTransport(undefined);
        }
      } catch (e) {
        if (!ignore) {
          console.error(e);
          if (e instanceof Error && !(e instanceof UserCancelledError)) {
            alert(e.message);
          }
          setSelectedTransport(undefined);
        }
      }
    }

    async function loadAvailableDevices() {
      const devices = await selectedTransport?.pick_and_connect?.list();

      if (!ignore) {
        setAvailableDevices(devices);
      }
    }

    if (selectedTransport.connect) {
      connectTransport().then(console.info).catch(console.error);
      return;
    }

    loadAvailableDevices().then(console.info).catch(console.error);
    return () => {
      ignore = true;
    };
  }, [onTransportCreated, selectedTransport]);

  const connections = transports.map((t) => (
    <li key={t.label} className="list-none">
      <button
        className="rounded bg-base-300 px-2 py-1 hover:bg-primary hover:text-primary-content"
        type="button"
        onClick={async () => setSelectedTransport(t)}
      >
        {t.label}
      </button>
    </li>
  ));

  return (
    <div>
      <p className="text-sm">Select a connection type.</p>
      <ul className="flex gap-2 pt-2">{connections}</ul>
      {selectedTransport && availableDevices && (
        <ul>
          {availableDevices.map((d) => (
            <li
              key={d.id}
              className="m-1 p-1"
              onClick={async () => {
                onTransportCreated(
                  await selectedTransport!.pick_and_connect!.connect(d),
                );
                setSelectedTransport(undefined);
              }}
            >
              {d.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const NoTransportsOptionsPrompt: FC = () => {
  return (
    <div className="m-4 flex flex-col gap-2">
      <p>
        Your browser is not supported. ZMK Studio uses either{" "}
        <ExternalLink href="https://caniuse.com/web-serial">
          Web Serial
        </ExternalLink>{" "}
        or{" "}
        <ExternalLink href="https://caniuse.com/web-bluetooth">
          Web Bluetooth
        </ExternalLink>{" "}
        (Linux only) to connect to ZMK devices.
      </p>

      <div>
        <p>To use ZMK Studio, either:</p>
        <ul className="list-inside list-disc">
          <li>
            Use a browser that supports the above web technologies, e.g.
            Chrome/Edge, or
          </li>
          <li>
            Download our{" "}
            <ExternalLink href="https://github.com/zmkfirmware/zmk-studio/releases">
              cross platform application
            </ExternalLink>
            .
          </li>
        </ul>
      </div>
    </div>
  );
};

const ConnectOptions: FC<ConnectModalProps> = ({
  open,
  transports,
  onTransportCreated,
}) => {
  const simpleMode = useMemo(
    () => transports.every((t) => !t.pick_and_connect),
    [transports],
  );

  if (simpleMode) {
    return <SimpleDevicePicker {...{ transports, onTransportCreated }} />;
  }

  return <DeviceList {...{ open, transports, onTransportCreated }} />;
};

export const ConnectModal = ({
  open,
  transports,
  onTransportCreated,
}: ConnectModalProps) => {
  const dialog = useModalRef(open || false, false, false);
  const haveTransports = useMemo(() => transports.length > 0, [transports]);

  return (
    <GenericModal ref={dialog} className="max-w-xl">
      <h1 className="text-xl">Welcome to ZMK Studio</h1>
      {haveTransports ? (
        <ConnectOptions {...{ open, transports, onTransportCreated }} />
      ) : (
        <NoTransportsOptionsPrompt />
      )}
    </GenericModal>
  );
};
