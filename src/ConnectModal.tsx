import React, { useEffect, useRef, useState } from "react";

import type { RpcTransport } from "ts-zmk-rpc-core/transport/index";
import type { AvailableDevice } from './tauri/index';

export type TransportFactory = { label: string, connect?: () => Promise<RpcTransport>, pick_and_connect?: { list: () => Promise<Array<AvailableDevice>>, connect: (dev: AvailableDevice) => Promise<RpcTransport> }};

export interface ConnectModalProps {
    open?: boolean;
    transports: TransportFactory[];
    onTransportCreated: (t: RpcTransport) => void;
}

async function transportClicked(t: RpcTransport, setAvailableDevices: React.Dispatch<AvailableDevice[] | null>, onTransportCreated: (t: RpcTransport) => void) {
    if (t.pick_and_connect) {
        setAvailableDevices(await t.pick_and_connect.list());
    } else {
        onTransportCreated(await t.connect());
    }
}

export const ConnectModal = ({ open, transports, onTransportCreated }: ConnectModalProps) => {
    const dialog = useRef<HTMLDialogElement | null>(null);
    const [availableDevices, setAvailableDevices] = useState<AvailableDevice[] | null>(null);
    const [selectedTransport, setSelectedTransport] = useState<RpcTransport | null>(null);

    useEffect(() => {
        if (!selectedTransport) {
            setAvailableDevices(null);
            return;
        }

        let ignore = false;

        if (selectedTransport.connect) {
            async function connectTransport() {
                const transport = await selectedTransport.connect();
    
                if (!ignore) {
                    onTransportCreated(transport);
                    setSelectedTransport(null);
                }
            }
    
            connectTransport();
        } else {
            async function loadAvailableDevices() {
                const devices = await selectedTransport.pick_and_connect.list();
    
                if (!ignore) {
                    setAvailableDevices(devices);
                }
            }
    
            loadAvailableDevices();
        }


        return () => { ignore = true };
    }, [selectedTransport]);

    let connections = transports.map((t) => <button key={t.label} onClick={async () => setSelectedTransport(t)}>{t.label}</button>);

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
        <dialog ref={dialog}>
            <h1>Welcome to ZMK Studio</h1>
            <p>Select a connection type:</p>
            <ul>{connections}</ul>
            {selectedTransport && availableDevices && (<ul>{availableDevices.map((d) => <li key={d.id} onClick={async () => {onTransportCreated(await selectedTransport.pick_and_connect.connect(d)); setSelectedTransport(null);}}>{d.label}</li>)}</ul>)}
        </dialog>
    );
}