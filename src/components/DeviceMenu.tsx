import { useCallback, useState } from "react"
import { useEmitter } from "../helpers/usePubSub.ts"
import { LockState } from "@zmkfirmware/zmk-studio-ts-client/core"
import { RestoreStock } from "./RestoreStock.tsx"
import useConnectionStore from "../stores/ConnectionStore.ts"
import undoRedoStore from "../stores/UndoRedoStore.ts"
import { disconnect as disconnectSerial } from "../tauri/serial.ts"
import { disconnect as disconnectBle } from "../tauri/ble.ts"
import { Button } from "@/components/ui/button.tsx"
import { Settings, Power, Sun, Moon } from "lucide-react"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx"
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar.tsx"
import { useConnectedDeviceData } from "@/services/RpcConnectionService.ts"
import { callRemoteProcedureControl } from "@/services/RpcEventsService.ts"
import { toast } from "sonner"

export const DeviceMenu = () => {
	const { connection, resetConnection, setConnection, deviceName, lockState } = useConnectionStore()
	const { reset } = undoRedoStore()
	const [ connectionAbort, setConnectionAbort ] = useState( new AbortController() )
	const { subscribe } = useEmitter()

	const [ unsaved, setUnsaved ] = useConnectedDeviceData<boolean>(
		{ keymap: { checkUnsavedChanges: true } },
		( request ) => request.keymap?.checkUnsavedChanges
	)

	const performAction = async (
		action: string,
		payload: {
			[key: string]: { [key: string]: string | boolean }
		},
		postAction?: () => void
	) => {
		if ( !connection ) return
		console.log(connection, payload)
		const resp = await callRemoteProcedureControl( payload )
		if ( !resp[action] || resp[action].err ) {
			console.log( `Failed to ${ action }`, resp, resp[action] )
		}
		if ( postAction ) postAction()
	}

	async function disconnect () {
		if ( !connection ) return
		console.log( connection )

		try {
			// Properly close the writable stream by getting a writer and closing it
			const writer = connection.request_writable.getWriter()
			await writer.close()
			writer.releaseLock()
			
			// Also close the readable stream if it exists
			if (connection.notification_readable) {
				await connection.notification_readable.cancel()
			}
			
			// Abort the connection and reset
			connectionAbort.abort( "User disconnected" )
			setConnectionAbort( new AbortController() )
			
			// Reset the connection in the store
			resetConnection()
			
		} catch ( error ) {
			console.warn( "Error during disconnect:", error )
			toast.error( "Error during disconnect: " + error.message )
		}
	}
	const resetSettings = useCallback(() => {
		async function doReset() {
			if (!connection) {
				return;
			}

			let resp = await callRemoteProcedureControl( {
				core: { resetSettings: true },
			});
			if (!resp.core?.resetSettings) {
				console.error("Failed to settings reset", resp);
				toast.error("Failed to settings reset");
				return;
			}

			// Reset undo/redo stack
			reset();
			
			// Force UI refresh by temporarily clearing and restoring connection
			// This triggers useConnectedDeviceData hooks to refetch data
			const currentConnection = connection;
			setConnection(null);
			
			// Use setTimeout to ensure the null state is processed before restoring
			setTimeout(() => {
				setConnection(currentConnection);
			}, 0);
		}

		doReset();
	}, [connection, reset, setConnection]);

	const isDisabled = !deviceName || lockState !== LockState.ZMK_STUDIO_CORE_LOCK_STATE_UNLOCKED

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger className='w-full'>
						<Button
							variant="outline"
							className="w-full justify-between"
							disabled={ isDisabled }
						>
							<span className="truncate">
							{ deviceName || "No Device Connected" }
							</span>
							<Settings className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>

					<DropdownMenuContent>
						<DropdownMenuItem
							onClick={ () => performAction( "disconnect", {}, disconnect ) }
							className="text-destructive focus:text-destructive">
							<Power className="mr-2 h-4 w-4" />
							Disconnect
						</DropdownMenuItem>
						<RestoreStock
							onOk={ () => resetSettings() } />
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	)
} 