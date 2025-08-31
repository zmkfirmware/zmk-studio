import { callRemoteProcedureControl } from "./rpc/logging"
import { useEffect, useState } from "react"
import { ConnectModal } from "./components/Modals/ConnectModal.tsx"
import type { RpcTransport } from "@zmkfirmware/zmk-studio-ts-client/transport/index"
import { useEmitter } from "./helpers/usePubSub.ts"
import { LockState } from "@zmkfirmware/zmk-studio-ts-client/core"
import { UnlockModal } from "./components/UnlockModal.tsx"
import { connect } from "./services/RPCService.ts"
import { Header } from "./layout/Header.tsx"
import { Footer } from "./layout/Footer.tsx"
import useConnectionStore from "./stores/ConnectionStore.ts"
import useLockStore from "./stores/LockStateStore.ts"
import undoRedoStore from "./stores/UndoRedoStore.ts"
import { createRoot } from "react-dom/client"
import Alert from "@/components/ui/Alert.tsx"
import { Keymap } from "@zmkfirmware/zmk-studio-ts-client/keymap"
import { useConnectedDeviceData } from "./rpc/useConnectedDeviceData.ts"
import { KeyboardEditor } from "./components/KeyboardEditor.tsx"
import { NewDrawer } from "@/layout/NewDrawer.tsx"
import { SidebarInset, SidebarProvider } from "./components/ui/sidebar.tsx"
import { ThemeProvider } from "@/providers/ThemeProvider.tsx"

function App () {
	const { connection, setConnection } = useConnectionStore()
	const [ connectedDeviceName, setConnectedDeviceName ] = useState<string | undefined>( undefined )
	const { reset } = undoRedoStore()
	const [ connectionAbort ] = useState( new AbortController() )
	const { setLockState } = useLockStore()
	const { publish, subscribe } = useEmitter()

	const [ keymap, setKeymap ] = useConnectedDeviceData<Keymap>(
		{ keymap: { getKeymap: true } },
		( keymap ) => {
			console.log( "Got the keymap!" )
			return keymap?.keymap?.getKeymap
		},
		true
	)

	useEffect( () => {
		return subscribe( "rpc_notification.core.lockStateChanged", ( data ) => {
			console.log( "lockStateChanged:", data )
			setLockState( data )
		} )
	}, [ subscribe ] )

	// console.log("app", connection)
	// useSub('rpc_notification.core.lockStateChanged', (ls) => {
	//     console.log(ls)
	//     setLockState(ls)
	// })

	useEffect( () => {
		if ( !connection ) {
			console.log( connection )
			reset()
			setLockState( LockState.ZMK_STUDIO_CORE_LOCK_STATE_LOCKED )
		}

		// console.log(connection)

		async function updateLockState () {
			if ( !connection ) return
			// console.log(connection)

			const locked_resp = await callRemoteProcedureControl( connection, {
				core: { getLockState: true }
			} )
			console.log( connection )
			// console.log(locked_resp, locked_resp.core?.getLockState)
			setLockState(
				locked_resp.core?.getLockState ||
				LockState.ZMK_STUDIO_CORE_LOCK_STATE_LOCKED
			)
		}

		updateLockState()
	}, [ connection, setLockState ] )

	const onConnect = async ( t: RpcTransport, communication: "serial" | "ble" ) => {
		const connection = await connect(
			t,
			setConnection,
			setConnectedDeviceName,
			connectionAbort.signal,
			communication
		)
		if ( typeof connection === "string" ) {
			renderAlert( connection )
		}
		// setConnection(connection)
	}

	function renderAlert ( message: string ) {
		const alertContainer = document.createElement( "div" )
		document.body.appendChild( alertContainer )

		// Create a React root and render the Alert component
		const alertRoot = createRoot( alertContainer )
		alertRoot.render(
			<Alert message={ message } duration={ 5 } container={ alertContainer } />
		)
	}

	return (
		<>
			<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
				{ connection ? (
					<>
						<UnlockModal />
						<SidebarProvider>
							<NewDrawer connectedDeviceLabel={ connectedDeviceName } />
							<SidebarInset>
								<Header connectedDeviceLabel={ connectedDeviceName } />
								<KeyboardEditor
									keymap={ keymap }
									setKeymap={ setKeymap }
								/>
								<Footer />
							</SidebarInset>
						</SidebarProvider>
					</>
				) : (
					<ConnectModal
						open={ !connection }
						onTransportCreated={ onConnect }
						usedFor="connectModal"
						modalButton={ "" }
						opened={ !connection }
						hideCloseButton
						hideXButton
					/>
				) }
			</ThemeProvider>
		</>
	)
}

export default App
