import React, { useEffect, useState } from "react"
import { ConnectModal } from "./components/Modals/ConnectModal.tsx"
import type { RpcTransport } from "@zmkfirmware/zmk-studio-ts-client/transport/index"
import { useEmitter, useSub } from "./helpers/usePubSub.ts"
import { LockState } from "@zmkfirmware/zmk-studio-ts-client/core"
import { UnlockModal } from "./components/UnlockModal.tsx"
import { connect } from "./services/RpcConnectionService.ts"
import useConnectionStore from "./stores/ConnectionStore.ts"
import undoRedoStore from "./stores/UndoRedoStore.ts"
import { KeyboardEditor } from "./components/KeyboardEditor.tsx"
import { Drawer } from "@/Layout/Drawer.tsx"
import { SidebarInset, SidebarProvider } from "./components/ui/sidebar.tsx"
import { ThemeProvider } from "@/providers/ThemeProvider.tsx"
import { Toaster } from "@/components/ui/sonner.tsx"
import { Header } from "@/Layout/Header.tsx"
import { Footer } from "@/Layout/Footer.tsx"
import { toast } from "sonner"
import { callRemoteProcedureControl } from "@/services/CallRemoteProcedureControl.ts"

function App () {
	const { connection, setConnection, setDeviceName, setLockState } = useConnectionStore()
	const { reset } = undoRedoStore()
	const [ connectionAbort ] = useState( new AbortController() )
	const { subscribe } = useEmitter()

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

		const locked_resp = await callRemoteProcedureControl({
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
			toast.error("Failed to connect to the selected device.", {
				description: connection,
			})
		}
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

						<Drawer />
						<SidebarInset>
							<Header/>
							<KeyboardEditor />
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
