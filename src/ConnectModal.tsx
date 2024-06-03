import { useEffect, useRef, useState } from "react";

import type { RpcTransport } from "ts-zmk-rpc-core/transport/index";
import type { AvailableDevice } from './tauri/index';

export type TransportFactory = { label: string, connect?: () => Promise<RpcTransport>, pick_and_connect?: { list: () => Promise<Array<AvailableDevice>>, connect: (dev: AvailableDevice) => Promise<RpcTransport> }};

export interface ConnectModalProps {
    open?: boolean;
    transports: TransportFactory[];
    onTransportCreated: (t: RpcTransport) => void;
}

export const ConnectModal = ({ open, transports, onTransportCreated }: ConnectModalProps) => {
    const dialog = useRef<HTMLDialogElement | null>(null);
    const [availableDevices, setAvailableDevices] = useState<AvailableDevice[] | undefined>(undefined);
    const [selectedTransport, setSelectedTransport] = useState<TransportFactory | undefined>(undefined);

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
            {selectedTransport && availableDevices && (<ul>{availableDevices.map((d) => <li key={d.id} onClick={async () => {onTransportCreated(await selectedTransport!.pick_and_connect!.connect(d)); setSelectedTransport(undefined);}}>{d.label}</li>)}</ul>)}
        </dialog>
    );
}