import { useEffect, useState } from 'react'
import type { AvailableDevice } from '../tauri'
import { UserCancelledError } from '@zmkfirmware/zmk-studio-ts-client/transport/errors'
import { TransportFactory } from './Modals/ConnectModal.tsx'
import { RpcTransport } from '@zmkfirmware/zmk-studio-ts-client/transport/index'
import { Button } from "@/components/ui/button.tsx"
import { toast } from "sonner"

interface SimpleDevicePickerProps {
    transports: TransportFactory[]
    onTransportCreated: (t: RpcTransport, communication: 'serial' | 'ble') => void
}

export function SimpleDevicePicker({
    transports,
    onTransportCreated,
}: SimpleDevicePickerProps) {
    const [availableDevices, setAvailableDevices] = useState<AvailableDevice[] | undefined>(undefined)
    const [selectedTransport, setSelectedTransport] = useState<TransportFactory | undefined>(undefined)
    const [ignore, setIgnore] = useState<boolean>(false)

    async function connectTransport() {
        try {
            const transport = await selectedTransport?.connect?.()

            if (!ignore) {
                if (transport) {
                    onTransportCreated(transport, selectedTransport!.communication)
                }
            }

            setSelectedTransport(undefined)
        } catch (e) {
            if (!ignore) {
                if (e instanceof Error && !(e instanceof UserCancelledError)) {
	                console.error(e.message)
                    toast.error("Failed to connect to the selected device.", {
                        description: e.message,
                    })
                }
            }
            setSelectedTransport(undefined)
        }
    }

    async function loadAvailableDevices() {
        const devices = await selectedTransport?.pick_and_connect?.list()
        console.log(devices)
        setAvailableDevices(devices)
    }

    useEffect(() => {
        // Reset ignore state at the start of each new connection attempt
        setIgnore(false)
        if (!selectedTransport) {
            setAvailableDevices(undefined)
            return
        }


        if (selectedTransport.connect) {
            connectTransport()
        } else {
            loadAvailableDevices()
        }

        return () => {
            setIgnore(true)
        }
    }, [selectedTransport])

    const connections = transports.map((t) => (
        <li key={t.label} className="list-none">
            <Button
                type="button"
                onClick={async () => setSelectedTransport(t)}
            >
                {t.label}
            </Button>
        </li>
    ))

    return (
        <div>
            <p className="text-sm">Select a connection type.</p>
            <ul className="flex gap-2 pt-2">{connections}</ul>
            {selectedTransport && availableDevices && (
                <ul>
                    {availableDevices.map((d) => (
                        <li
                            key={d.id}
                            className="m-1 p-1 cursor-pointer hover:bg-base-300 rounded p-2"
                            onClick={async () => {
                                try {
                                    const transport = await selectedTransport!.pick_and_connect!.connect(d)
                                    onTransportCreated(transport, selectedTransport!.communication)
                                } catch (e) {
                                    console.log(e)
                                    if (e instanceof Error && !(e instanceof UserCancelledError)) {
                                        toast.error("Failed to connect to the selected device.", {
                                            description: e.message,
                                        })

                                    }
                                }
                                setSelectedTransport(undefined)
                            }}
                        >
                            {d.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
