import { callRemoteProcedureControl } from './rpc/logging'
import { useEffect, useState } from 'react'
import { ConnectModal } from './components/Modals/ConnectModal.tsx'
import type { RpcTransport } from '@zmkfirmware/zmk-studio-ts-client/transport/index'
import { useSub } from './helpers/usePubSub.ts'
import { LockState } from '@zmkfirmware/zmk-studio-ts-client/core'
import { UnlockModal } from './components/UnlockModal.tsx'
import { connect } from './services/RPCService.ts'
import { Header } from './layout/Header.tsx'
import Keyboard from './components/keyboard/Keyboard.tsx'
import { Footer } from './layout/Footer.tsx'
import useConnectionStore from './stores/ConnectionStore.ts'
import useLockStore from './stores/LockStateStore.ts'
import undoRedoStore from './stores/UndoRedoStore.ts'
import { createRoot } from 'react-dom/client'
import Alert from './components/UI/Alert.tsx'
import { Drawer } from "./layout/Drawer.tsx"

function App() {
    const { connection, setConnection } = useConnectionStore()
    const [connectedDeviceName, setConnectedDeviceName] = useState<
        string | undefined
    >(undefined)
    const { reset } = undoRedoStore()
    const [connectionAbort] = useState(new AbortController())
    const { setLockState } = useLockStore()
    // console.log("app", connection)
    useSub('rpc_notification.core.lockStateChanged', (ls) => {
        console.log(ls)
        setLockState(ls)
    })

    useEffect(() => {
        if (!connection) {
            // console.log(connection)
            reset()
            setLockState(LockState.ZMK_STUDIO_CORE_LOCK_STATE_LOCKED)
        }
        // console.log(connection)

        async function updateLockState() {
            if (!connection) return

            const locked_resp = await callRemoteProcedureControl(connection, {
                core: { getLockState: true },
            })
            // console.log(locked_resp, locked_resp.core?.getLockState)
            setLockState(
                locked_resp.core?.getLockState ||
                    LockState.ZMK_STUDIO_CORE_LOCK_STATE_LOCKED,
            )
        }

        updateLockState()
    }, [connection, setLockState])

    const onConnect = async (t: RpcTransport) => {
        const connection = await connect(
            t,
            setConnection,
            setConnectedDeviceName,
            connectionAbort.signal,
        )
        if (typeof connection === 'string') {
            renderAlert(connection)
        }
        // setConnection(connection)
    }

    function renderAlert(message: string) {
        const alertContainer = document.createElement('div')
        document.body.appendChild(alertContainer)

        // Create a React root and render the Alert component
        const alertRoot = createRoot(alertContainer)
        alertRoot.render(
            <Alert message={message} duration={5} container={alertContainer} />,
        )
    }

    if (connection) {
        return (
            <>
                <UnlockModal />
                <div className="bg-base-100 text-base-content h-full max-h-[100vh] w-full max-w-[100vw] inline-grid grid-cols-[auto] grid-rows-[auto_1fr_auto] overflow-hidden">
                    <Drawer>
                    <Header connectedDeviceLabel={connectedDeviceName} />

                    <Keyboard />
                    <Footer />
                    </Drawer>
                </div>
            </>
        )
    } else {
        return (
            <>
                <ConnectModal
                    open={!connection}
                    onTransportCreated={onConnect}
                    usedFor="connectModal"
                    modalButton={""}
                    opened={!connection}
                    hideCloseButton
                    hideXButton
                />
            </>
        )
    }
}

export default App
