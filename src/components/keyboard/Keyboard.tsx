import { useCallback, useEffect, useMemo, useState } from "react"

import { callRemoteProcedureControl } from "../../rpc/logging.ts"
import {
	Keymap,
	BehaviorBinding,
	SetLayerBindingResponse
} from "@zmkfirmware/zmk-studio-ts-client/keymap"

import { KeyboardLayout } from "./KeyboardLayout.tsx"
import { useConnectedDeviceData } from "../../rpc/useConnectedDeviceData.ts"

import { produce } from "immer"
import { LayoutZoom } from "./PhysicalLayout.tsx"
import { useLocalStorageState } from "../../misc/useLocalStorageState.ts"
import { deserializeLayoutZoom } from "../../helpers/helpers.ts"
import { useLayout } from "../../helpers/useLayouts.ts"
import { Zoom } from "../Zoom.tsx"
import useConnectionStore from "../../stores/ConnectionStore.ts"
import undoRedoStore from "../../stores/UndoRedoStore.ts"
import { useBehaviors } from "../../helpers/Behaviors.ts"
import { KeyEditor } from "../KeyEditor.tsx"

export default function Keyboard () {
	const { layouts, selectedPhysicalLayoutIndex } = useLayout()

	const [ keymap, setKeymap ] = useConnectedDeviceData<Keymap>(
		{ keymap: { getKeymap: true } },
		( keymap ) => {
			console.log( "Got the keymap!" )
			return keymap?.keymap?.getKeymap
		},
		true
	)

	const [ keymapScale, setKeymapScale ] = useLocalStorageState<LayoutZoom>(
		"keymapScale",
		"auto",
		{ deserialize: deserializeLayoutZoom }
	)
	const [ selectedLayerIndex, setSelectedLayerIndex ] = useState<number>( 0 )
	const [ selectedKeyPosition, setSelectedKeyPosition ] = useState<number | undefined>( undefined )
	const behaviors = useBehaviors()
	const { doIt } = undoRedoStore()
	const { connection } = useConnectionStore()
	const [ selectedKey, setSelectedKey ] = useState<boolean>( false )

	useEffect( () => {
		setSelectedLayerIndex( 0 )
		setSelectedKeyPosition( undefined )
	}, [ connection ] )

	useEffect( () => {
		async function performSetRequest () {
			if ( !connection || !layouts ) return

			// console.log(connection, selectedPhysicalLayoutIndex)
			const resp = await callRemoteProcedureControl( connection, {
				keymap: { setActivePhysicalLayout: selectedPhysicalLayoutIndex }
			} )

			const new_keymap = resp?.keymap?.setActivePhysicalLayout?.ok
			if ( new_keymap ) {
				setKeymap( new_keymap )
			} else {
				console.error( "Failed to set the active physical layout err:", resp?.keymap?.setActivePhysicalLayout?.err )
			}
		}

		performSetRequest()
	}, [ selectedPhysicalLayoutIndex ] )

	// const doSelectPhysicalLayout = useCallback(
	//     (i: number) => {
	//         const oldLayout = selectedPhysicalLayoutIndex
	//         doIt?.(async () => {
	//             setSelectedPhysicalLayoutIndex(i)
	//
	//             return async () => {
	//                 setSelectedPhysicalLayoutIndex(oldLayout)
	//             }
	//         })
	//     },
	//     [doIt, selectedPhysicalLayoutIndex],
	// )

	const doUpdateBinding = useCallback(
		( binding: BehaviorBinding ) => {
			if ( !keymap || selectedKeyPosition === undefined ) {
				console.error( "Can't update binding without a selected key position and loaded keymap" )
				return
			}
			const layer = selectedLayerIndex
			const layerId = keymap.layers[layer].id
			const keyPosition = selectedKeyPosition
			const oldBinding = keymap.layers[layer].bindings[keyPosition]

			doIt?.( async () => {
				if ( !connection ) throw new Error( "Not connected" )

				const resp = await callRemoteProcedureControl( connection, {
					keymap: {
						setLayerBinding: { layerId, keyPosition, binding }
					}
				} )
				// console.log(resp)
				if ( resp.keymap?.setLayerBinding === SetLayerBindingResponse.SET_LAYER_BINDING_RESP_OK ) {
					setKeymap( produce( ( draft ) => {
						draft.layers[layer].bindings[keyPosition] = binding
					} ) )
				} else {
					console.error( "Failed to set binding", resp.keymap?.setLayerBinding )
				}

				return async () => {
					if ( !connection ) return

					const resp = await callRemoteProcedureControl( connection, {
						keymap: {
							setLayerBinding: {
								layerId,
								keyPosition,
								binding: oldBinding
							}
						}
					} )
					if ( resp.keymap?.setLayerBinding === SetLayerBindingResponse.SET_LAYER_BINDING_RESP_OK ) {
						setKeymap( produce( ( draft ) => draft.layers[layer].bindings[keyPosition] = oldBinding ) )
					} else {
						console.error( "Failed to set binding", resp.keymap?.setLayerBinding )
					}
				}
			} )
		},
		[ connection, keymap, doIt, selectedLayerIndex, selectedKeyPosition ]
	)

	const selectedBinding = useMemo( () => {
		if ( keymap == null || selectedKeyPosition == null || !keymap.layers[selectedLayerIndex] ) return null

		setSelectedKey( true )

		return keymap.layers[selectedLayerIndex].bindings[selectedKeyPosition]
	}, [ keymap, selectedLayerIndex, selectedKeyPosition ] )

	useEffect( () => {
		if ( !keymap?.layers ) return

		const layers = keymap.layers.length - 1

		if ( selectedLayerIndex > layers ) setSelectedLayerIndex( layers )

	}, [ keymap, selectedLayerIndex, setSelectedKey ] )

	return (
		<div
			className="grid grid-cols-[auto_1fr] grid-rows-[1fr_minmax(10em,auto)] bg-base-300 max-w-full min-w-0 min-h-0 h-full">
			{ layouts && keymap && behaviors && (
				<div className="p-2 col-start-2 row-start-1 grid items-center justify-center relative min-w-0">
					<KeyboardLayout
						keymap={ keymap }
						layout={ layouts[selectedPhysicalLayoutIndex] }
						behaviors={ behaviors }
						scale={ keymapScale }
						selectedLayerIndex={ selectedLayerIndex }
						selectedKeyPosition={ selectedKeyPosition }
						onKeyPositionClicked={ setSelectedKeyPosition }
					/>
					<Zoom
						value={ keymapScale }
						onChange={ ( e ) => {
							const value = deserializeLayoutZoom( e.target.value )
							setKeymapScale( value )
						} }
					/>
				</div>
			) }
			{ selectedKey && (
				<KeyEditor
					selectedBinding = {selectedBinding}
					keymap={keymap}
					setSelectedKey={ setSelectedKey}
					doUpdateBinding={doUpdateBinding}
					setSelectedKeyPosition={setSelectedKeyPosition}
					behaviors = { behaviors }
				/>
			) }
		</div>
	)
}
