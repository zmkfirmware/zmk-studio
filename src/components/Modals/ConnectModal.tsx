import { useMemo } from 'react'

import type { RpcTransport } from '@zmkfirmware/zmk-studio-ts-client/transport/index'
import type { AvailableDevice } from '../../tauri'
import { ExternalLink } from '../../misc/ExternalLink.tsx'
import { DeviceList } from '../DeviceList.tsx'
import { SimpleDevicePicker } from '../SimpleDevicePicker.tsx'
import { TRANSPORTS } from '../../helpers/transports.ts'
import { OldModal, ModalProps } from "@/components/ui/OldModal.tsx"
import useConnectionStore from "../../stores/ConnectionStore.ts"
import { Modal } from "@/components/ui/Modal.tsx"

export type TransportFactory = {
    label: string
    communication: 'serial' | 'ble'
    isWireless?: boolean
    connect?: () => Promise<RpcTransport>
    pick_and_connect?: {
        list: () => Promise<Array<AvailableDevice>>
        connect: (dev: AvailableDevice) => Promise<RpcTransport>
    }
}

export interface ConnectModalProps extends ModalProps{
    open?: boolean
    onTransportCreated: (t: RpcTransport, communication: 'serial' | 'ble') => void
    usedFor?: string
    modalButton?: string
    opened?: boolean
    hideCloseButton?: boolean
    hideXButton?: boolean
}

export const ConnectModal = ({
    open,
    onTransportCreated,
}: ConnectModalProps) => {
    const transports = TRANSPORTS
    const haveTransports = useMemo(() => transports.length > 0, [transports])

    function connectOptions(
        transports: TransportFactory[],
        onTransportCreated: (t: RpcTransport, communication: 'serial' | 'ble') => void,
        open?: boolean,
    ) {
        const useSimplePicker = useMemo( () =>
                transports.every((t) => !t.pick_and_connect),
            [transports],
        )

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
        )
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
        )
    }

    return (
        <Modal opened={open} close={false} xButton={false} success={false} customModalBoxClass='w-11/14 max-w-2xl' isDismissable={true}>
            <h1 className="text-xl text-center">Welcome to ZMK Studio</h1>
            {haveTransports
                ? connectOptions(transports, onTransportCreated, open)
                : noTransportsOptionsPrompt()}
        </Modal>
    )
}