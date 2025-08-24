import { useEffect } from "react"
import { callRemoteProcedureControl } from "../../rpc/logging.ts"
import { Keymap, } from "@zmkfirmware/zmk-studio-ts-client/keymap"
import { KeyboardLayout } from "./KeyboardLayout.tsx"
import { LayoutZoom } from "./PhysicalLayout.tsx"
import { useLocalStorageState } from "../../misc/useLocalStorageState.ts"
import { deserializeLayoutZoom } from "../../helpers/helpers.ts"
import { useLayout } from "../../helpers/useLayouts.ts"
import { Zoom } from "../Zoom.tsx"
import useConnectionStore from "../../stores/ConnectionStore.ts"
import { useBehaviors } from "../../helpers/Behaviors.ts"

interface KeyboardProps {
	keymap: Keymap | undefined;
	selectedLayerIndex: number;
	setSelectedLayerIndex: (index: number) => void;
	selectedKeyPosition: number | undefined;
	setSelectedKeyPosition: (position: number | undefined) => void;
	selectedKey?: boolean;
	setSelectedKey?: (value: boolean) => void;
}

export default function Keyboard({
	keymap,
	selectedLayerIndex,
	setSelectedLayerIndex,
	selectedKeyPosition,
	setSelectedKeyPosition,
	selectedKey,
	setSelectedKey
}: KeyboardProps) {
	const { layouts, selectedPhysicalLayoutIndex } = useLayout()

	const [ keymapScale, setKeymapScale ] = useLocalStorageState<LayoutZoom>(
		"keymapScale",
		"auto",
		{ deserialize: deserializeLayoutZoom }
	)
	const behaviors = useBehaviors()
	const { connection } = useConnectionStore()

	useEffect( () => {
		setSelectedLayerIndex( 0 )
		setSelectedKeyPosition( undefined )
	}, [ connection, setSelectedLayerIndex, setSelectedKeyPosition ] )

	useEffect( () => {
		async function performSetRequest () {
			if ( !connection || !layouts ) return

			const resp = await callRemoteProcedureControl( connection, {
				keymap: { setActivePhysicalLayout: selectedPhysicalLayoutIndex }
			} )

			const new_keymap = resp?.keymap?.setActivePhysicalLayout?.ok
			if ( new_keymap ) {
				console.log( "New keymap received from physical layout change" )
			} else {
				console.error( "Failed to set the active physical layout err:", resp?.keymap?.setActivePhysicalLayout?.err )
			}
		}

		performSetRequest()
	}, [ selectedPhysicalLayoutIndex, connection, layouts ] )

	useEffect( () => {
		if ( !keymap?.layers ) return

		const layers = keymap.layers.length - 1

		if ( selectedLayerIndex > layers ) setSelectedLayerIndex( layers )

	}, [ keymap, selectedLayerIndex, setSelectedLayerIndex ] )

	return (
		<>
			{ layouts && keymap && behaviors && (
				<div className="p-2 col-start-2 row-start-1 items-center justify-center relative min-w-0 flex h-full bg-base-300">
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
		</>
	)
}
