import { useCallback, useEffect, useMemo, useState } from 'react';

import type { RpcTransport } from '@zmkfirmware/zmk-studio-ts-client/transport/index';
import type { AvailableDevice } from '../tauri';
import { Bluetooth, RefreshCw } from 'lucide-react';
import { Key, ListBox, ListBoxItem, Selection } from 'react-aria-components';
import { useModalRef } from '../misc/useModalRef.ts';
import { ExternalLink } from '../misc/ExternalLink.tsx';
import { GenericModal } from './GenericModal.tsx';
import { DeviceList } from './DeviceList.tsx';
import { SimpleDevicePicker } from './SimpleDevicePicker.tsx';

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

function deviceList(
    open: boolean,
    transports: TransportFactory[],
    onTransportCreated: (t: RpcTransport) => void,
) {
    const [devices, setDevices] = useState<
        Array<[TransportFactory, AvailableDevice]>
    >([]);
    const [selectedDev, setSelectedDev] = useState(new Set<Key>());
    const [refreshing, setRefreshing] = useState(false);

    async function LoadEm() {
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
    }

    useEffect(() => {
        setSelectedDev(new Set());
        setDevices([]);

        LoadEm();
    }, [transports, open, setDevices]);

    const onRefresh = useCallback(() => {
        setSelectedDev(new Set());
        setDevices([]);

        LoadEm();
    }, [setDevices]);

    const onSelect = useCallback(
        async (keys: Selection) => {
            if (keys === 'all') {
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
                    className="p-1 rounded hover:bg-base-300 disabled:bg-base-100 disabled:opacity-75"
                    disabled={refreshing}
                    onClick={onRefresh}
                >
                    <RefreshCw
                        className={`size-5 transition-transform ${refreshing ? 'animate-spin' : ''}`}
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
                        className="grid grid-cols-[1em_1fr] rounded hover:bg-base-300 cursor-pointer px-1"
                        id={d.id}
                        aria-label={d.label}
                    >
                        {t.isWireless && (
                            <Bluetooth className="w-4 justify-center content-center h-full" />
                        )}
                        <span className="col-start-2">{d.label}</span>
                    </ListBoxItem>
                )}
            </ListBox>
        </div>
    );
}

function noTransportsOptionsPrompt() {
    return (
        <div className="m-4 flex flex-col gap-2">
            <p>
                Your browser is not supported. ZMK Studio uses either{' '}
                <ExternalLink href="https://caniuse.com/web-serial">
                    Web Serial
                </ExternalLink>{' '}
                or{' '}
                <ExternalLink href="https://caniuse.com/web-bluetooth">
                    Web Bluetooth
                </ExternalLink>{' '}
                (Linux only) to connect to ZMK devices.
            </p>

            <div>
                <p>To use ZMK Studio, either:</p>
                <ul className="list-disc list-inside">
                    <li>
                        Use a browser that supports the above web technologies,
                        e.g. Chrome/Edge, or
                    </li>
                    <li>
                        Download our{' '}
                        <ExternalLink href="/download">
                            cross platform application
                        </ExternalLink>
                        .
                    </li>
                </ul>
            </div>
        </div>
    );
}

export const ConnectModal = ({
    open,
    transports,
    onTransportCreated,
}: ConnectModalProps) => {
    const dialog = useModalRef(open || false, false, false);

    const haveTransports = useMemo(() => transports.length > 0, [transports]);

    function connectOptions(
        transports: TransportFactory[],
        onTransportCreated: (t: RpcTransport) => void,
        open?: boolean,
    ) {
        const useSimplePicker = useMemo(
            () => transports.every((t) => !t.pick_and_connect),
            [transports],
        );

        return useSimplePicker ? (
            <SimpleDevicePicker
                transports={transports}
                onTransportCreated={onTransportCreated}
            ></SimpleDevicePicker>
        ) : (
            <DeviceList
                open={open || false}
                transports={transports}
                onTransportCreated={onTransportCreated}
            ></DeviceList>
        );
    }

    return (
        <GenericModal ref={dialog} className="max-w-xl">
            <h1 className="text-xl">Welcome to ZMK Studio</h1>
            {haveTransports
                ? connectOptions(transports, onTransportCreated, open)
                : noTransportsOptionsPrompt()}
        </GenericModal>
    );
};
