import { useCallback, useEffect, useState } from "react"
import { Keymap } from "@zmkfirmware/zmk-studio-ts-client/keymap"
import { KeyboardLayout } from "./KeyboardLayout.tsx"
import { useLocalStorageState } from "../../misc/useLocalStorageState.ts"
import { deserializeLayoutZoom, LayoutZoom } from "../../helpers/helpers.ts"
import { useLayout } from "../../helpers/useLayouts.ts"
import { Zoom } from "../Zoom.tsx"
import useConnectionStore from "../../stores/ConnectionStore.ts"
import useLayerSelectionStore from "../../stores/LayerSelectionStore.ts"
import { useBehaviors } from "../../helpers/Behaviors.ts"
import { getKeymapLayout } from "@/services/RpcEventsService.ts"
import { keyboardKeypressService, KeypressDetectionConfig } from "@/services/KeyboardKeypressService.ts"

interface KeyboardProps {
	keymap: Keymap | undefined;
	selectedKeyPosition: number | undefined;
	setSelectedKeyPosition: (position: number | undefined) => void;
}

export default function Keyboard({
	keymap,
	selectedKeyPosition,
	setSelectedKeyPosition
}: KeyboardProps) {
	const { layouts, selectedPhysicalLayoutIndex } = useLayout()
	const { selectedLayerIndex, setSelectedLayerIndex } = useLayerSelectionStore()
	const behaviors = useBehaviors()
	const { connection } = useConnectionStore()

	// Reset layer selection when connection changes
	useEffect(() => {
		console.log('Connection changed, resetting layer selection to 0')
		setSelectedLayerIndex(0)
		setSelectedKeyPosition(undefined)
	}, [connection])

	useEffect( () => {
		if ( !keymap?.layers ) return

		const layer = keymap.layers.find(layer => layer.id === selectedLayerIndex)

		console.log('Keymap changed, current layer:', layer, 'layers:', keymap?.layers)

		if (!layer) {
			setSelectedLayerIndex(keymap.layers[0].id)
		}

	}, [ keymap, selectedLayerIndex, setSelectedLayerIndex ] )

	//todo change to zustand storing system

	const [ keymapScale, setKeymapScale ] = useLocalStorageState<LayoutZoom>(
		"keymapScale",
		"auto",
		{ deserialize: deserializeLayoutZoom }
	)

	// State for tracking pressed keys
	const [pressedKeys, setPressedKeys] = useState<Set<number>>(new Set())

	// Create keypress detection config
	const keypressConfig: KeypressDetectionConfig = {
		layouts: layouts || [],
		keymap: keymap!,
		selectedLayerIndex,
		selectedPhysicalLayoutIndex,
		behaviors
	}

	// Keyboard event handlers using the service
	const handleKeyPressed = useCallback((keyPosition: number) => {
		setPressedKeys(prev => new Set(prev).add(keyPosition))
	}, [])

	const handleKeyReleased = useCallback((keyPosition: number) => {
		setPressedKeys(prev => {
			const newSet = new Set(prev)
			newSet.delete(keyPosition)
			return newSet
		})
	}, [])

	// Set up keyboard event listeners using the service
	useEffect(() => {
		if (!layouts || !keymap || !behaviors) return

		return keyboardKeypressService.setupKeyboardListeners(
			keypressConfig,
			handleKeyPressed,
			handleKeyReleased
		)
	}, [layouts, keymap, behaviors, selectedLayerIndex, selectedPhysicalLayoutIndex, handleKeyPressed, handleKeyReleased])

	// Clear pressed keys when layer changes
	useEffect(() => {
		setPressedKeys(new Set())
	}, [selectedLayerIndex])

	useEffect( () => {
		(async ()=> {
			await getKeymapLayout( selectedPhysicalLayoutIndex, layouts )
		})()

	}, [ selectedPhysicalLayoutIndex, connection, layouts ] )

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
						pressedKeys={ pressedKeys }
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
