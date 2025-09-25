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
    // const { connection } = useConnectionStore()

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


// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// function deviceList(
//     open: boolean,
//     transports: TransportFactory[],
//     onTransportCreated: (t: RpcTransport) => void,
// ) {
//     const [devices, setDevices] = useState<
//         Array<[TransportFactory, AvailableDevice]>
//     >([])
//     const [selectedDev, setSelectedDev] = useState(new Set<Key>())
//     const [refreshing, setRefreshing] = useState(false)
//
//     async function LoadEm() {
//         setRefreshing(true)
//         const entries: Array<[TransportFactory, AvailableDevice]> = []
//         for (const t of transports.filter((t) => t.pick_and_connect)) {
//             const devices = await t.pick_and_connect?.list()
//             if (!devices) {
//                 continue
//             }
//
//             entries.push(
//                 ...devices.map<[TransportFactory, AvailableDevice]>((d) => {
//                     return [t, d]
//                 }),
//             )
//         }
//
//         setDevices(entries)
//         setRefreshing(false)
//     }
//
//     useEffect(() => {
//         setSelectedDev(new Set())
//         setDevices([])
//         console.log(open)
//         LoadEm()
//     }, [transports, open, setDevices])
//
//     const onRefresh = useCallback(() => {
//         setSelectedDev(new Set())
//         setDevices([])
//
//         LoadEm()
//     }, [setDevices])
//
//     const onSelect = useCallback(
//         async (keys: Selection) => {
//             if (keys === 'all') {
//                 return
//             }
//             const dev = devices.find(([_t, d]) => keys.has(d.id))
//             if (dev) {
//                 dev[0]
//                     .pick_and_connect!.connect(dev[1])
//                     .then(onTransportCreated)
//                     .catch((e) => alert(e))
//             }
//         },
//         [devices, onTransportCreated],
//     )
//
//     return (
//         <div>
//             <div className="grid grid-cols-[1fr_auto]">
//                 <label>Select A Device:</label>
//                 <button
//                     className="p-1 rounded hover:bg-base-300 disabled:bg-base-100 disabled:opacity-75"
//                     disabled={refreshing}
//                     onClick={onRefresh}
//                 >
//                     <RefreshCw
//                         className={`size-5 transition-transform ${refreshing ? 'animate-spin' : ''}`}
//                     />
//                 </button>
//             </div>
//             <ListBox
//                 aria-label="Device"
//                 items={devices}
//                 onSelectionChange={onSelect}
//                 selectionMode="single"
//                 selectedKeys={selectedDev}
//                 className="flex flex-col gap-1 pt-1"
//             >
//                 {([t, d]) => (
//                     <ListBoxItem
//                         className="grid grid-cols-[1em_1fr] rounded hover:bg-base-300 cursor-pointer px-1"
//                         id={d.id}
//                         aria-label={d.label}
//                     >
//                         {t.isWireless && (
//                             <Bluetooth className="w-4 justify-center content-center h-full" />
//                         )}
//                         <span className="col-start-2">{d.label}</span>
//                     </ListBoxItem>
//                 )}
//             </ListBox>
//         </div>
//     )
// }
