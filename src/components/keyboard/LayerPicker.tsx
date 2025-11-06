import { EllipsisVertical, Plus, Trash } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { DropIndicator, useDragAndDrop } from "react-aria-components"
import undoRedoStore from "../../stores/UndoRedoStore.ts"
import useConnectionStore from "../../stores/ConnectionStore.ts"
import useLayerSelectionStore from "../../stores/LayerSelectionStore.ts"
import EditLabel from "../EditLabel.tsx"

import {
	SidebarGroupAction,
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
import { addLayer, changeName, removeLayer, restore } from "@/services/RpcEventsLayerService.ts"
import { toast } from "sonner"
import {Tooltip, TooltipContent, TooltipTrigger} from "@/components/ui/tooltip.tsx";


interface Layer {
	id: number
	name?: string
}

export type LayerClickCallback = ( index: number ) => void
export type LayerMovedCallback = ( index: number, destination: number ) => void

interface LayerPickerProps {
	layers: Array<Layer>
	canAdd?: boolean
	canRemove?: boolean

	onLayerClicked?: LayerClickCallback // todo remove if not needed
	setKeymap?: any
	keymap?: any
	setSelectedKey?: any
}

interface EditLabelData {
	id: number
	name: string
}

export const LayerPicker = ( {
	layers,
	canAdd,
	canRemove,
	onLayerClicked,
	setSelectedKey,
	setKeymap,
	keymap,
	...props
}: LayerPickerProps ) => {
	const [ editLabelData, setEditLabelData ] = useState<EditLabelData | null>( null )
	const [ dropdownOpen, setDropdownOpen ] = useState<number | null>( null )
	const { doIt } = undoRedoStore()
	const { connection } = useConnectionStore()
	const { selectedLayerIndex, setSelectedLayerIndex } = useLayerSelectionStore()

	const layersArray = useMemo( () => {
		return layers.map( ( l, i ) => ({
			name: l.name || i.toLocaleString(),
			id: l.id,
			index: i,
			selected: i === selectedLayerIndex
		}) )
	}, [ layers, selectedLayerIndex ] )

	// console.log(layer_items)

	const selectionChanged = useCallback( ( layerIndex: number | string ) => {
			if ( layerIndex === "all" ) return
			if ( typeof layerIndex !== "number" ) return
			// console.log( s, layersArray.findIndex( ( layer ) => s === layer.index ) )
			// onLayerClicked?.( layersArray.findIndex( ( layer ) => s === layer.index ))
			//todo check if the index is always a number and the id is the same as the index
			setSelectedLayerIndex( layerIndex )
		},
		[ onLayerClicked, layersArray ]
	)

	// const { dragAndDropHooks } = useDragAndDrop( {
	// 	renderDropIndicator ( target ) {
	// 		return (
	// 			<DropIndicator
	// 				target={ target }
	// 				className={
	// 					"data-[drop-target]:outline outline-1 outline-accent"
	// 				}
	// 			/>
	// 		)
	// 	},
	// 	getItems: ( keys ) =>
	// 		[ ...keys ].map( ( key ) => ({ "text/plain": key.toLocaleString() }) ),
	// 	onReorder ( e ) {
	// 		const startIndex = layer_items.findIndex( ( l ) => e.keys.has( l.id ) )
	// 		const endIndex = layer_items.findIndex( ( l ) => l.id === e.target.key )
	// 		moveLayer?.( startIndex, endIndex )
	// 	}
	// } )


	// const moveLayer = useCallback( ( start: number, end: number ) => {
	// 		const doMove = async ( startIndex: number, destIndex: number ) => {
	// 			if ( !connection ) {
	// 				return
	// 			}
	//
	// 			const resp = await callRemoteProcedureControl( connection, {
	// 				keymap: { moveLayer: { startIndex, destIndex } }
	// 			} )
	//
	// 			if ( resp.keymap?.moveLayer?.ok ) {
	// 				setKeymap( resp.keymap?.moveLayer?.ok )
	// 				setSelectedLayerIndex( destIndex )
	// 			} else {
	// 				console.error( "Error moving", resp )
	// 			}
	// 		}
	//
	// 		doIt?.( async () => {
	// 			await doMove( start, end )
	// 			return () => doMove( end, start )
	// 		} )
	// 	}, [ connection, doIt, setKeymap, setSelectedLayerIndex ]
	// )

	const add = useCallback( () => {
		doIt?.( async () => {
			const index = await addLayer( keymap, setKeymap, setSelectedLayerIndex )
			return () => removeLayer( index, setKeymap )
		} )
	}, [ connection, doIt, keymap, setKeymap, setSelectedLayerIndex ] )


	const remove = useCallback( ( layerIndex: number ) => {
		if ( !keymap ) toast.error( "No keymap loaded" )

		const index = layerIndex
		const layerId = keymap.layers[index].id

		doIt?.( async () => {
			await removeLayer( index, setKeymap )
			return () => restore( layerId, index, setKeymap, setSelectedLayerIndex )
		} )
	}, [ connection, doIt, keymap, selectedLayerIndex, setKeymap, setSelectedLayerIndex ] )


	const changeLayerName = useCallback(
		( id: number, oldName: string, newName: string ) => {
			doIt?.( async () => {
				await changeName( id, newName, setKeymap )
				return async () => {
					await changeName( id, oldName, setKeymap )
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

		const layer = keymap.layers.find( layer => layer.id === selectedLayerIndex )

		if ( !layer ) setSelectedLayerIndex( keymap.layers[0].id )

	}, [ keymap, selectedLayerIndex, setSelectedKey, setSelectedLayerIndex ] )

	// Close dropdown when clicking outside
	useEffect( () => {
		const handleClickOutside = () => {
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
			<SidebarGroupLabel>Layers</SidebarGroupLabel>
			<SidebarGroupAction title="Add Layer" onClick={ add } disabled={ !canAdd }>
				<Tooltip>
					<TooltipTrigger><Plus className="size-4" /></TooltipTrigger>
					<TooltipContent>
						<p>Add Layer</p>
					</TooltipContent>
				</Tooltip>
			</SidebarGroupAction>
			<SidebarMenu>
				{ layersArray.map( ( item ) => (
					<SidebarMenuItem key={ item.name }>
						<SidebarMenuButton
							asChild
							isActive={ item.index === selectedLayerIndex }
							onClick={ () => {
								selectionChanged( item.index )
								onLayerClicked?.( item.index )
							} }
						>
							<span>{ item.name }</span>
						</SidebarMenuButton>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuAction showOnHover className="data-[state=open]:bg-accent rounded-sm">
									<EllipsisVertical /> <span className="sr-only">More</span>
								</SidebarMenuAction>
							</DropdownMenuTrigger>
							<DropdownMenuContent side="right" align="start">
								<DropdownMenuItem onSelect={ ( e ) => e.preventDefault() }>
									<EditLabel
										onClose={ () => setEditLabelData( null ) }
										editLabelData={ item }
										handleSaveNewLabel={ handleSaveNewLabel }
									/>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem variant="destructive" disabled={ !canRemove } onClick={ ( e ) => {
									e.stopPropagation()
									remove( item.index )
								} }>
									<Trash />
									<span>Delete</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				) ) }
			</SidebarMenu>
		</>
	)
}
