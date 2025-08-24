import { useEffect, useState } from "react"
import { useConnectedDeviceData } from "../rpc/useConnectedDeviceData.ts"
import { useEmitter } from "../helpers/usePubSub.ts"
import { LockState } from "@zmkfirmware/zmk-studio-ts-client/core"
import {
	Redo2,
	Save,
	Trash2,
	Undo2
} from "lucide-react"
import { RestoreStock } from "../components/RestoreStock.tsx"
import { callRemoteProcedureControl } from "../rpc/logging.ts"
import useConnectionStore from "../stores/ConnectionStore.ts"
import useLockStore from "../stores/LockStateStore.ts"
import undoRedoStore from "../stores/UndoRedoStore.ts"
import { Settings } from "../components/Modals/Settings.tsx"
import { SidebarTrigger } from "@/components/ui/sidebar.tsx"
import { Button } from "@/components/ui/button.tsx"
import { Separator } from "@/components/ui/separator.tsx"
import { DarkModeToggle } from "@/components/DarkModeToggle.tsx"

export interface AppHeaderProps {
	connectedDeviceLabel?: string
}

export const Header = ( { connectedDeviceLabel }: AppHeaderProps ) => {
	const { connection } = useConnectionStore()
	const { undo, redo, canUndo, canRedo, reset } = undoRedoStore()
	const [ showSettingsReset, setShowSettingsReset ] = useState( false )
	const [ connectionAbort, setConnectionAbort ] = useState( new AbortController() )
	const { lockState } = useLockStore()
	const { subscribe } = useEmitter()

	const [ unsaved, setUnsaved ] = useConnectedDeviceData<boolean>(
		{ keymap: { checkUnsavedChanges: true } },
		( request ) => request.keymap?.checkUnsavedChanges
	)

	useEffect( () => {
		console.log( unsaved )
		return subscribe(
			"rpc_notification.keymap.unsavedChangesStatusChanged",
			( ls ) => {
				console.log( ls )
				setUnsaved( ls )
			}
		)
	}, [ setUnsaved, subscribe, unsaved ] )

	useEffect( () => {
		if ( (!connection || lockState !== LockState.ZMK_STUDIO_CORE_LOCK_STATE_UNLOCKED) && showSettingsReset ) {
			setShowSettingsReset( false )
		}
	}, [ connection, lockState, showSettingsReset ] )

	const performAction = async ( action: string, payload: {
		[key: string]: { [key: string]: string | boolean }
	}, postAction?: () => void ) => {
		if ( !connection ) {
			console.error("No connection available for action:", action)
			return
		}

		// Add additional validation
		if (lockState !== LockState.ZMK_STUDIO_CORE_LOCK_STATE_UNLOCKED) {
			console.error("Device is locked, cannot perform action:", action)
			return
		}

		try {
			const resp = await callRemoteProcedureControl( connection, payload )
			console.log(`RPC Response for ${action}:`, resp)

			if ( !resp[action] || resp[action].err ) {
				console.error( `Failed to ${ action }`, {
					action,
					payload,
					response: resp,
					actionResponse: resp[action],
					lockState,
					connectionValid: !!connection
				})

				// Add user-facing error notification here if you have a toast system
			} else {
				console.log(`Successfully performed ${action}:`, resp[action])
			}

			if ( postAction ) postAction()
		} catch (error) {
			console.error(`Exception during ${action}:`, error, {
				action,
				payload,
				lockState,
				connectionValid: !!connection
			})
		}
	}

	async function disconnect () {
		if ( !connection ) return
		console.log( connection )
		await connection.request_writable.close().finally( () => {
			connectionAbort.abort( "User disconnected" )
			setConnectionAbort( new AbortController() )
		} )
	}

	return (
		<header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
			<div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
				<SidebarTrigger className="-ml-1" />
				<Separator
					orientation="vertical"
					className="mx-2 data-[orientation=vertical]:h-4"
				/>
				<img src="/zmk.svg" alt="ZMK Logo" className="h-8 rounded ps-3" /> <span className="px-3">Studio</span>
				<div className="ml-auto flex items-center gap-2">
					<DarkModeToggle></DarkModeToggle>
					<Settings />
					<button className="btn btn-ghost btn-circle tooltip tooltip-bottom mx-1" disabled={ !canUndo() }
					        onClick={ undo } data-tip="Undo"><Undo2 aria-label="Undo" /></button>
					<button className="btn btn-ghost btn-circle tooltip tooltip-bottom mx-1" disabled={ !canRedo() }
					        onClick={ redo } data-tip="Redo"><Redo2 aria-label="Redo" /></button>
					<button
						className="btn btn-ghost btn-circle tooltip tooltip-bottom mx-1"
						disabled={ !unsaved || !connection || lockState !== LockState.ZMK_STUDIO_CORE_LOCK_STATE_UNLOCKED }
						data-tip="Save"
						onClick={ () => {
							console.log("Save button clicked, state:", {
								unsaved,
								connection: !!connection,
								lockState,
								canSave: unsaved && !!connection && lockState === LockState.ZMK_STUDIO_CORE_LOCK_STATE_UNLOCKED
							})
							performAction( "saveChanges", { keymap: { saveChanges: true } } )
						}}
					>
						<Save aria-label="Save" />
					</button>
					<button className="btn btn-ghost btn-circle tooltip tooltip-bottom mx-1" disabled={ !unsaved }
					        data-tip="Discard"
					        onClick={ () => performAction( "discardChanges", { keymap: { discardChanges: true } }, reset ) }>
						<Trash2 aria-label="Discard" /></button>
				</div>
			</div>
		</header>
		// <header>
		// 	<div className="navbar bg-base-100">
		// 		<div className="navbar-start">
		// 			<img src="/zmk.svg" alt="ZMK Logo" className="h-8 rounded ps-3" />
		// 			<span className="px-3">Studio</span>
		// 		</div>
		// 		<div className="navbar-center">
		// 			<div className={ `dropdown ${ !connectedDeviceLabel ? "btn-disabled" : "" }` }>
		// 				<div tabIndex={ 0 } role="button" className="btn btn-soft btn-primary text-white">
		// 					{ connectedDeviceLabel }
		// 				</div>
		// 				<ul tabIndex={ 0 }
		// 				    className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
		// 					<li onClick={ () => performAction( "disconnect", {}, disconnect ) }>
		// 						<a>Disconnect</a>
		// 					</li>
		// 					<RestoreStock
		// 						onOk={ () => performAction( "resetSettings", { core: { resetSettings: true } } ) } />
		// 				</ul>
		// 			</div>
		// 		</div>
		// 		<div className="navbar-end">
		// 			<Settings />
		// 			<button className="btn btn-ghost btn-circle tooltip tooltip-bottom mx-1" disabled={ !canUndo() }
		// 			        onClick={ undo } data-tip="Undo"><Undo2 aria-label="Undo" /></button>
		// 			<button className="btn btn-ghost btn-circle tooltip tooltip-bottom mx-1" disabled={ !canRedo() }
		// 			        onClick={ redo } data-tip="Redo"><Redo2 aria-label="Redo" /></button>
		// 			<button className="btn btn-ghost btn-circle tooltip tooltip-bottom mx-1" disabled={ !unsaved }
		// 			        data-tip="Save"
		// 			        onClick={ () => performAction( "saveChanges", { keymap: { saveChanges: true } } ) }><Save
		// 				aria-label="Save" /></button>
		// 			<button className="btn btn-ghost btn-circle tooltip tooltip-bottom mx-1" disabled={ !unsaved }
		// 			        data-tip="Discard"
		// 			        onClick={ () => performAction( "discardChanges", { keymap: { discardChanges: true } }, reset ) }>
		// 				<Trash2 aria-label="Discard" /></button>
		// 		</div>
		// 	</div>
		// </header>
	)
}
