import { useEffect, useState } from 'react'
import type { AvailableDevice } from '../tauri'
import { UserCancelledError } from '@zmkfirmware/zmk-studio-ts-client/transport/errors'
import { TransportFactory } from './Modals/ConnectModal.tsx'
import { RpcTransport } from '@zmkfirmware/zmk-studio-ts-client/transport/index'

interface SimpleDevicePickerProps {
    transports: TransportFactory[]
    onTransportCreated: (t: RpcTransport) => void
}

export function SimpleDevicePicker({
    transports,
    onTransportCreated,
}: SimpleDevicePickerProps) {
    {
        const [availableDevices, setAvailableDevices] = useState<AvailableDevice[] | undefined>(undefined)
        const [selectedTransport, setSelectedTransport] = useState<TransportFactory | undefined>(undefined)
        const [ignore, setIgnore] = useState<boolean>(false)

        async function connectTransport() {
            try {
                const transport = await selectedTransport?.connect?.()

                if (!ignore) {
                    if (transport) {
                        onTransportCreated(transport)
                    }
                    setSelectedTransport(undefined)
                }
            } catch (e) {
                if (!ignore) {
                    console.error(e)
                    if ( e instanceof Error && !(e instanceof UserCancelledError) ) {
                        alert(e.message)
                    }
                    setSelectedTransport(undefined)
                }
            }
        }
        async function loadAvailableDevices() {
            const devices =
                await selectedTransport?.pick_and_connect?.list()

            if (!ignore) {
                setAvailableDevices(devices)
            }
        }

        useEffect(() => {
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
        }, [selectedTransport,connectTransport,loadAvailableDevices])

        const connections = transports.map((t) => (
            <li key={t.label} className="list-none">
                <button
                    className="bg-base-300 hover:bg-primary hover:text-primary-content rounded px-2 py-1"
                    type="button"
                    onClick={async () => setSelectedTransport(t)}
                >
                    {t.label}
                </button>
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
                                className="m-1 p-1"
                                onClick={async () => {
                                    onTransportCreated(
                                        await selectedTransport!.pick_and_connect!.connect(
                                            d,
                                        ),
                                    )
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
}
