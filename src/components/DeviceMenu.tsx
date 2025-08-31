import { useState } from "react"
import { useConnectedDeviceData } from "../rpc/useConnectedDeviceData.ts"
import { useEmitter } from "../helpers/usePubSub.ts"
import { LockState } from "@zmkfirmware/zmk-studio-ts-client/core"
import { RestoreStock } from "./RestoreStock.tsx"
import { callRemoteProcedureControl } from "../rpc/logging.ts"
import useConnectionStore from "../stores/ConnectionStore.ts"
import useLockStore from "../stores/LockStateStore.ts"
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

export interface DeviceMenuProps {
	connectedDeviceLabel?: string
}

export const DeviceMenu = ( { connectedDeviceLabel }: DeviceMenuProps ) => {
	const { connection, resetConnection, communication } = useConnectionStore()
	const { reset } = undoRedoStore()
	const [ connectionAbort, setConnectionAbort ] = useState( new AbortController() )
	const { lockState } = useLockStore()
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
		const resp = await callRemoteProcedureControl( connection, payload )
		if ( !resp[action] || resp[action].err ) {
			console.error( `Failed to ${ action }`, resp, resp[action] )
		}
		if ( postAction ) postAction()
	}

	async function disconnect () {
		if ( !connection ) return
		console.log( connection )

		try {
			// Call the appropriate disconnect function based on transport type
			if ( communication === "serial" ) {
				await disconnectSerial()
			} else if ( communication === "ble" ) {
				await disconnectBle()
			}

			// Reset the connection store
			resetConnection()

			// Also reset the undo/redo store
			reset()

			// Clean up local state
			connectionAbort.abort( "User disconnected" )
			setConnectionAbort( new AbortController() )
		} catch ( error ) {
			console.warn( "Error during disconnect:", error )
			// Even if there's an error, still reset the connection
			resetConnection()
			reset()
		}
	}

	const isDisabled = !connectedDeviceLabel || lockState !== LockState.ZMK_STUDIO_CORE_LOCK_STATE_UNLOCKED

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
							{ connectedDeviceLabel || "No Device Connected" }
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
							onOk={ () => performAction( "resetSettings", { core: { resetSettings: true } } ) } />
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	)
} 