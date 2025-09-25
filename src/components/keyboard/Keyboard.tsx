import { useEffect } from "react"
import { Keymap, } from "@zmkfirmware/zmk-studio-ts-client/keymap"
import { KeyboardLayout } from "./KeyboardLayout.tsx"
import { useLocalStorageState } from "../../misc/useLocalStorageState.ts"
import { deserializeLayoutZoom, LayoutZoom } from "../../helpers/helpers.ts"
import { useLayout } from "../../helpers/useLayouts.ts"
import { Zoom } from "../Zoom.tsx"
import useConnectionStore from "../../stores/ConnectionStore.ts"
import { useBehaviors } from "../../helpers/Behaviors.ts"
import { getKeymapLayout } from "@/services/RpcEventsService.ts"

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

	//todo change to zustand storing system

	const [ keymapScale, setKeymapScale ] = useLocalStorageState<LayoutZoom>(
		"keymapScale",
		"auto",
		{ deserialize: deserializeLayoutZoom }
	)
	const behaviors = useBehaviors()
	const { connection } = useConnectionStore()

	// useEffect( () => {
	// 	setSelectedLayerIndex( 0 )
	// 	setSelectedKeyPosition( undefined )
	// }, [ connection, setSelectedLayerIndex, setSelectedKeyPosition ] )

	useEffect( () => {
		(async ()=> {
			await getKeymapLayout( selectedPhysicalLayoutIndex, layouts )
		})()

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
							setKeymapScale( deserializeLayoutZoom( e ) )
						} }
					/>
				</div>
			) }
		</>
	)
}
