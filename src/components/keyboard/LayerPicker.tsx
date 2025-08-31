import { EllipsisVertical, Plus, Trash } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
	DropIndicator,
	Selection,
	useDragAndDrop
} from "react-aria-components"
import { callRemoteProcedureControl } from "../../rpc/logging.ts"
import undoRedoStore from "../../stores/UndoRedoStore.ts"
import useConnectionStore from "../../stores/ConnectionStore.ts"
import { produce } from "immer"
import { SetLayerPropsResponse } from "@zmkfirmware/zmk-studio-ts-client/keymap"
import EditLabelModal from "../EditLabelModal.tsx"

import {
	SidebarGroupAction,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu, SidebarMenuAction, SidebarMenuButton,
	SidebarMenuItem
} from "@/components/ui/sidebar.tsx"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.tsx"

// import { useModalRef } from "../../misc/useModalRef.ts"
// import { GenericModal } from "../GenericModal.tsx"
// import EditLabelModal from '../EditLabelModal.tsx'

interface Layer {
	id: number
	name?: string
}

export type LayerClickCallback = ( index: number ) => void
export type LayerMovedCallback = ( index: number, destination: number ) => void

interface LayerPickerProps {
	layers: Array<Layer>
	selectedLayerIndex: number
	canAdd?: boolean
	canRemove?: boolean

	onLayerClicked?: LayerClickCallback
	setKeymap?: any
	setSelectedLayerIndex?: any
	keymap?: any
	setSelectedKey?: any
}

interface EditLabelData {
	id: number
	name: string
}

// const EditLabelModal = ( {
// 	open,
// 	onClose,
// 	editLabelData,
// 	handleSaveNewLabel
// }: {
// 	open: boolean
// 	onClose: () => void
// 	editLabelData: EditLabelData
// 	handleSaveNewLabel: (
// 		id: number,
// 		oldName: string,
// 		newName: string | null
// 	) => void
// } ) => {
// 	const ref = useModalRef( open )
// 	const [ newLabelName, setNewLabelName ] = useState( editLabelData.name )
//
// 	const handleSave = () => {
// 		handleSaveNewLabel( editLabelData.id, editLabelData.name, newLabelName )
// 		onClose()
// 	}
//
// 	return (
// 		<GenericModal
// 			ref={ ref }
// 			onClose={ onClose }
// 			className="min-w-min w-[30vw] flex flex-col"
// 		>
// 			<span className="mb-3 text-lg">New Layer Name</span>
// 			<input
// 				className="p-1 border rounded border-base-content border-solid"
// 				type="text"
// 				defaultValue={ editLabelData.name }
// 				autoFocus
// 				onChange={ ( e ) => setNewLabelName( e.target.value ) }
// 				onKeyDown={ ( e ) => {
// 					if ( e.key === "Enter" ) {
// 						e.preventDefault()
// 						handleSave()
// 					}
// 				} }
// 			/>
// 			<div className="mt-4 flex justify-end">
// 				<button className="py-1.5 px-2" type="button" onClick={ onClose }>
// 					Cancel
// 				</button>
// 				<button
// 					className="py-1.5 px-2 ml-4 rounded-md bg-gray-100 text-black hover:bg-gray-300"
// 					type="button"
// 					onClick={ () => {
// 						handleSave()
// 					} }
// 				>
// 					Save
// 				</button>
// 			</div>
// 		</GenericModal>
// 	)
// }

export const LayerPicker = ( {
	layers,
	selectedLayerIndex,
	canAdd,
	canRemove,
	onLayerClicked,
	setSelectedKey,
	setKeymap,
	keymap,
	setSelectedLayerIndex,
	...props
}: LayerPickerProps ) => {
	const [ editLabelData, setEditLabelData ] = useState<EditLabelData | null>( null )
	const [ dropdownOpen, setDropdownOpen ] = useState<number | null>( null )
	const { doIt } = undoRedoStore()
	const { connection } = useConnectionStore()

	const layer_items = useMemo( () => {
		return layers.map( ( l, i ) => ({
			name: l.name || i.toLocaleString(),
			id: l.id,
			index: i,
			selected: i === selectedLayerIndex
		}) )
	}, [ layers, selectedLayerIndex ] )

	console.log(layer_items)
	const selectionChanged = useCallback( ( s: any ) => {
			if ( s === "all" ) {
				return
			}
			console.log( s, layer_items.findIndex( ( l ) => s === l.index ) )
			onLayerClicked?.( layer_items.findIndex( ( l ) => s === l.index ))
		},
		[ onLayerClicked, layer_items ]
	)

	const { dragAndDropHooks } = useDragAndDrop( {
		renderDropIndicator ( target ) {
			return (
				<DropIndicator
					target={ target }
					className={
						"data-[drop-target]:outline outline-1 outline-accent"
					}
				/>
			)
		},
		getItems: ( keys ) =>
			[ ...keys ].map( ( key ) => ({ "text/plain": key.toLocaleString() }) ),
		onReorder ( e ) {
			const startIndex = layer_items.findIndex( ( l ) => e.keys.has( l.id ) )
			const endIndex = layer_items.findIndex( ( l ) => l.id === e.target.key )
			moveLayer?.( startIndex, endIndex )
		}
	} )


	const moveLayer = useCallback( ( start: number, end: number ) => {
			const doMove = async ( startIndex: number, destIndex: number ) => {
				if ( !connection ) {
					return
				}

				const resp = await callRemoteProcedureControl( connection, {
					keymap: { moveLayer: { startIndex, destIndex } }
				} )

				if ( resp.keymap?.moveLayer?.ok ) {
					setKeymap( resp.keymap?.moveLayer?.ok )
					setSelectedLayerIndex( destIndex )
				} else {
					console.error( "Error moving", resp )
				}
			}

			doIt?.( async () => {
				await doMove( start, end )
				return () => doMove( end, start )
			} )
		}, [ connection, doIt, setKeymap, setSelectedLayerIndex ]
	)
	const addLayer = useCallback( () => {
		async function doAdd (): Promise<number> {
			console.log( connection, keymap )
			if ( !connection || !keymap ) {
				throw new Error( "Not connected" )
			}

			const resp = await callRemoteProcedureControl( connection, {
				keymap: { addLayer: {} }
			} )
			console.log( resp )
			if ( resp.keymap?.addLayer?.ok ) {
				const newSelection = keymap.layers.length
				setKeymap(
					produce( ( draft: any ) => {
						draft.layers.push( resp.keymap!.addLayer!.ok!.layer )
						draft.availableLayers--
					} )
				)

				setSelectedLayerIndex( newSelection )

				return resp.keymap.addLayer.ok.index
			} else {
				console.error( "Add error", resp.keymap?.addLayer?.err )
				throw new Error(
					"Failed to add layer:" + resp.keymap?.addLayer?.err
				)
			}
		}

		async function doRemove ( layerIndex: number ) {
			if ( !connection ) throw new Error( "Not connected" )

			const resp = await callRemoteProcedureControl( connection, {
				keymap: { removeLayer: { layerIndex } }
			} )

			console.log( resp )
			if ( resp.keymap?.removeLayer?.ok ) {
				setKeymap(
					produce( ( draft: any ) => {
						draft.layers.splice( layerIndex, 1 )
						draft.availableLayers++
					} )
				)
			} else {
				console.error( "Remove error", resp.keymap?.removeLayer?.err )
				throw new Error(
					"Failed to remove layer:" + resp.keymap?.removeLayer?.err
				)
			}
		}

		doIt?.( async () => {
			const index = await doAdd()
			return () => doRemove( index )
		} )
	}, [ connection, doIt, keymap, setKeymap, setSelectedLayerIndex ] )


	const removeLayer = useCallback( () => {
		async function doRemove ( layerIndex: number ): Promise<void> {
			if ( !connection || !keymap ) {
				throw new Error( "Not connected" )
			}

			const resp = await callRemoteProcedureControl( connection, {
				keymap: { removeLayer: { layerIndex } }
			} )

			if ( resp.keymap?.removeLayer?.ok ) {
				if ( layerIndex == keymap.layers.length - 1 ) {
					setSelectedLayerIndex( layerIndex - 1 )
				}
				setKeymap(
					produce( ( draft: any ) => {
						draft.layers.splice( layerIndex, 1 )
						draft.availableLayers++
					} )
				)
			} else {
				console.error( "Remove error", resp.keymap?.removeLayer?.err )
				throw new Error(
					"Failed to remove layer:" + resp.keymap?.removeLayer?.err
				)
			}
		}

		async function doRestore ( layerId: number, atIndex: number ) {
			if ( !connection ) throw new Error( "Not connected" )

			const resp = await callRemoteProcedureControl( connection, {
				keymap: { restoreLayer: { layerId, atIndex } }
			} )

			console.log( resp )
			if ( resp.keymap?.restoreLayer?.ok ) {
				setKeymap(
					produce( ( draft: any ) => {
						draft.layers.splice( atIndex, 0, resp!.keymap!.restoreLayer!.ok )
						draft.availableLayers--
					} )
				)
				setSelectedLayerIndex( atIndex )
			} else {
				console.error( "Remove error", resp.keymap?.restoreLayer?.err )
				throw new Error(
					"Failed to restore layer:" + resp.keymap?.restoreLayer?.err
				)
			}
		}

		if ( !keymap ) {
			throw new Error( "No keymap loaded" )
		}

		const index = selectedLayerIndex
		const layerId = keymap.layers[index].id
		doIt?.( async () => {
			await doRemove( index )
			return () => doRestore( layerId, index )
		} )
	}, [ connection, doIt, keymap, selectedLayerIndex, setKeymap, setSelectedLayerIndex ] )


	const changeLayerName = useCallback(
		( id: number, oldName: string, newName: string ) => {
			async function changeName ( layerId: number, name: string ) {
				if ( !connection ) {
					throw new Error( "Not connected" )
				}

				const resp = await callRemoteProcedureControl( connection, {
					keymap: { setLayerProps: { layerId, name } }
				} )

				if ( resp.keymap?.setLayerProps == SetLayerPropsResponse.SET_LAYER_PROPS_RESP_OK ) {
					setKeymap(
						produce( ( draft: any ) => {
							const layer_index = draft.layers.findIndex( ( l: Layer ) => l.id == layerId )
							draft.layers[layer_index].name = name
						} )
					)
				} else {
					throw new Error( "Failed to change layer name:" + resp.keymap?.setLayerProps )
				}
			}

			doIt?.( async () => {
				await changeName( id, newName )
				return async () => {
					await changeName( id, oldName )
				}
			} )
		},
		[ connection, doIt, setKeymap ]
	)

	const handleSaveNewLabel = useCallback(
		( id: number, oldName: string, newName: string | null ) => {
			if ( newName !== null ) {
				changeLayerName?.( id, oldName, newName )
			}
		},
		[ changeLayerName ]
	)
	useEffect( () => {
		if ( !keymap?.layers ) return

		const layers = keymap.layers.length - 1

		if ( selectedLayerIndex > layers ) {
			setSelectedLayerIndex( layers )
		}

	}, [ keymap, selectedLayerIndex, setSelectedKey, setSelectedLayerIndex ] )

	// Close dropdown when clicking outside
	useEffect( () => {
		const handleClickOutside = ( event: MouseEvent ) => {
			if ( dropdownOpen !== null ) {
				setDropdownOpen( null )
			}
		}

		document.addEventListener( "mousedown", handleClickOutside )
		return () => {
			document.removeEventListener( "mousedown", handleClickOutside )
		}
	}, [ dropdownOpen ] )

	// Close dropdown when edit modal opens
	useEffect( () => {
		if ( editLabelData !== null ) {
			setDropdownOpen( null )
		}
	}, [ editLabelData ] )

	return (
		<>
			<SidebarGroupContent>
				<SidebarGroupLabel>Layers</SidebarGroupLabel>
				<SidebarGroupAction title="Add Layer" onClick={ addLayer } disabled={ !canAdd }>
					{/*<Button onClick={addLayer} disabled={ !canAdd } variant="ghost" size="icon" className="size-8" >*/ }
					<Plus className="size-4" /> <span className="sr-only">Add Layer</span>
					{/*</Button>*/ }
				</SidebarGroupAction>
				<SidebarMenu>
					{ layer_items.map( ( item ) => (
						<SidebarMenuItem key={ item.name }>
							<SidebarMenuButton
								asChild
								isActive={ item.index === selectedLayerIndex }
								onClick={ (event) => {
									onLayerClicked?.( item.index )
									selectionChanged( item.index)
								} }
							>
								<span>{ item.name }</span>
							</SidebarMenuButton>
							<DropdownMenu>
								<DropdownMenuTrigger>
									<SidebarMenuAction showOnHover className="data-[state=open]:bg-accent rounded-sm">
										<EllipsisVertical /> <span className="sr-only">More</span>
									</SidebarMenuAction>
								</DropdownMenuTrigger>
								<DropdownMenuContent side="right" align="start">
									<DropdownMenuItem>
										<EditLabelModal
											onClose={ () => setEditLabelData( null ) }
											editLabelData={ item }
											handleSaveNewLabel={ handleSaveNewLabel }
										/>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem variant="destructive" disabled={ !canRemove } onClick={ ( e ) => {
										e.stopPropagation()
										removeLayer()
									} }>
										<Trash />
										<span>Delete</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						</SidebarMenuItem>
					) ) }
				</SidebarMenu>
			</SidebarGroupContent>
			{/*<div className="flex flex-col min-w-40">*/ }
			{/*	<ListBox*/ }
			{/*		aria-label="Keymap Layer"*/ }
			{/*		selectionMode="single"*/ }
			{/*		items={ layer_items }*/ }
			{/*		disallowEmptySelection={ true }*/ }
			{/*		selectedKeys={*/ }
			{/*			layer_items[selectedLayerIndex]*/ }
			{/*				? [ layer_items[selectedLayerIndex].id ]*/ }
			{/*				: []*/ }
			{/*		}*/ }
			{/*		className="ml-2 items-center justify-center cursor-pointer"*/ }
			{/*		onSelectionChange={ selectionChanged }*/ }
			{/*		dragAndDropHooks={ dragAndDropHooks }*/ }
			{/*		{ ...props }*/ }
			{/*	>*/ }
			{/*		{ ( layer_item ) => (*/ }
			{/*			<ListBoxItem*/ }
			{/*				textValue={ layer_item.name }*/ }
			{/*				className="p-1 b-1 my-1 group grid grid-cols-[1fr_auto] items-center aria-selected:bg-primary aria-selected:text-primary-content border rounded border-transparent border-solid hover:bg-base-300"*/ }
			{/*			>*/ }
			{/*				<span>{ layer_item.name }</span>*/ }

			{/*				<div className="relative">*/ }
			{/*					<MoreVertical*/ }
			{/*						className="h-4 w-4 mx-1 invisible group-hover:visible cursor-pointer"*/ }
			{/*						onClick={ (e) => {*/ }
			{/*							e.stopPropagation()*/ }
			{/*							setDropdownOpen(dropdownOpen === layer_item.index ? null : layer_item.index)*/ }
			{/*						} }*/ }
			{/*					/>*/ }
			{/*					{ dropdownOpen === layer_item.index && (*/ }
			{/*						<div className="absolute right-0 top-6 z-50 bg-base-100 border border-base-300 rounded-md shadow-lg min-w-32 py-1">*/ }
			{/*							<button*/ }
			{/*								className="w-full text-left px-3 py-2 hover:bg-base-200 text-sm"*/ }
			{/*								onClick={ (e) => {*/ }
			{/*									e.stopPropagation()*/ }
			{/*									setEditLabelData({*/ }
			{/*										id: layer_item.id,*/ }
			{/*										name: layer_item.name*/ }
			{/*									})*/ }
			{/*									setDropdownOpen(null)*/ }
			{/*								} }*/ }
			{/*							>*/ }
			{/*								Rename*/ }
			{/*							</button>*/ }
			{/*							{ canRemove && (*/ }
			{/*								<button*/ }
			{/*									className={`w-full text-left px-3 py-2 text-sm ${*/ }
			{/*										layer_item.index === selectedLayerIndex*/ }
			{/*											? 'hover:bg-base-200 text-error'*/ }
			{/*											: 'text-gray-400 cursor-not-allowed'*/ }
			{/*									}`}*/ }
			{/*									disabled={layer_item.index !== selectedLayerIndex}*/ }
			{/*									title={layer_item.index === selectedLayerIndex ? "Delete this layer" : "Can only delete the currently selected layer"}*/ }
			{/*									onClick={ (e) => {*/ }
			{/*										e.stopPropagation()*/ }
			{/*										// Only allow deletion if this is the currently selected layer*/ }
			{/*										if (layer_item.index === selectedLayerIndex) {*/ }
			{/*											removeLayer()*/ }
			{/*										}*/ }
			{/*										setDropdownOpen(null)*/ }
			{/*									} }*/ }
			{/*								>*/ }
			{/*									Delete*/ }
			{/*								</button>*/ }
			{/*							) }*/ }
			{/*						</div>*/ }
			{/*					) }*/ }
			{/*				</div>*/ }
			{/*			</ListBoxItem>*/ }
			{/*		) }*/ }
			{/*	</ListBox>*/ }
			{/*</div>*/ }
		</>
	)
}
