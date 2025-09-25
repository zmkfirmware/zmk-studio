import React, { useEffect, useState } from "react"
import { ConnectModal } from "./components/Modals/ConnectModal.tsx"
import type { RpcTransport } from "@zmkfirmware/zmk-studio-ts-client/transport/index"
import { useEmitter, useSub } from "./helpers/usePubSub.ts"
import { LockState } from "@zmkfirmware/zmk-studio-ts-client/core"
import { UnlockModal } from "./components/UnlockModal.tsx"
import { callRemoteProcedureControl, connect, useConnectedDeviceData } from "./services/RpcConnectionService.ts"
import { Header } from "./layout/Header.tsx"
import { Footer } from "./layout/Footer.tsx"
import useConnectionStore from "./stores/ConnectionStore.ts"
import undoRedoStore from "./stores/UndoRedoStore.ts"
import { createRoot } from "react-dom/client"
import Alert from "@/components/ui/Alert.tsx"
import { Keymap } from "@zmkfirmware/zmk-studio-ts-client/keymap"
import { KeyboardEditor } from "./components/KeyboardEditor.tsx"
import { Drawer } from "@/layout/Drawer.tsx"
import { SidebarInset, SidebarProvider } from "./components/ui/sidebar.tsx"
import { ThemeProvider } from "@/providers/ThemeProvider.tsx"
import { Toaster } from "@/components/ui/sonner.tsx"

function App () {
	const { connection, setConnection, setDeviceName, deviceName, setLockState } = useConnectionStore()
	const { reset } = undoRedoStore()
	const [ connectionAbort ] = useState( new AbortController() )
	// Remove this line: const { setLockState } = useLockStore()
	const { publish, subscribe } = useEmitter()
	
	// Shared state for layer selection between Drawer and KeyboardEditor
	const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(0)

	useEffect( () => {
		return subscribe( "rpc_notification.core.lockStateChanged", ( data ) => {
			console.log( "lockStateChanged:", data )
			setLockState( data )
		} )
	}, [ subscribe ] )


	useSub('rpc_notification.core.lockStateChanged', (ls) => {
	    console.log(ls)
	    setLockState(ls)
	})

	useEffect( () => {
		console.log( connection )
		if ( !connection ) {
			reset()
			setLockState( LockState.ZMK_STUDIO_CORE_LOCK_STATE_LOCKED )
		}

		updateLockState()
	}, [ connection, setLockState ] )

	async function updateLockState () {
		if ( !connection ) return

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

	const onConnect = async ( t: RpcTransport, communication: "serial" | "ble" ) => {
		const connection = await connect(
			t,
			setConnection,
			setDeviceName,
			connectionAbort.signal,
			communication
		)
		if ( typeof connection === "string" ) {
			renderAlert( connection )
		}
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
		<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			{ connection ? (
				<>
					<UnlockModal />
					<SidebarProvider style={
						{
							"--sidebar-width": "calc(var(--spacing) * 72)",
							"--header-height": "calc(var(--spacing) * 12)",
							"--footer-height": "calc(var(--spacing) * 8)",
						} as React.CSSProperties
					}>
						<Drawer selectedLayerIndex={selectedLayerIndex} setSelectedLayerIndex={setSelectedLayerIndex} />
						<SidebarInset>
							<Header/>
							<KeyboardEditor selectedLayerIndex={selectedLayerIndex} setSelectedLayerIndex={setSelectedLayerIndex} />
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
			<Toaster richColors position="top-center" />
		</ThemeProvider>
	)
}

export default App
