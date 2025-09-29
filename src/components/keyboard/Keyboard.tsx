import { useEffect, useState, useCallback } from "react"
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
}

export default function Keyboard({
	keymap,
	selectedLayerIndex,
	setSelectedLayerIndex,
	selectedKeyPosition,
	setSelectedKeyPosition
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

	// State for tracking pressed keys
	const [pressedKeys, setPressedKeys] = useState<Set<number>>(new Set())

	// Function to map key codes to key positions
	const mapKeyCodeToPosition = useCallback((keyCode: string): number | null => {
		if (!layouts || !keymap?.layers?.[selectedLayerIndex]) return null
		
		const currentLayout = layouts[selectedPhysicalLayoutIndex]
		const currentLayer = keymap.layers[selectedLayerIndex]
		
		console.log('Key pressed:', keyCode)
		console.log('Current layer bindings:', currentLayer.bindings)
		console.log('Behaviors:', behaviors)
		
		// Create a mapping from key codes to HID usage codes
		const keyCodeToHidMap: Record<string, number> = {
			'KeyA': 4, 'KeyB': 5, 'KeyC': 6, 'KeyD': 7, 'KeyE': 8, 'KeyF': 9, 'KeyG': 10,
			'KeyH': 11, 'KeyI': 12, 'KeyJ': 13, 'KeyK': 14, 'KeyL': 15, 'KeyM': 16, 'KeyN': 17,
			'KeyO': 18, 'KeyP': 19, 'KeyQ': 20, 'KeyR': 21, 'KeyS': 22, 'KeyT': 23, 'KeyU': 24,
			'KeyV': 25, 'KeyW': 26, 'KeyX': 27, 'KeyY': 28, 'KeyZ': 29,
			'Digit1': 30, 'Digit2': 31, 'Digit3': 32, 'Digit4': 33, 'Digit5': 34,
			'Digit6': 35, 'Digit7': 36, 'Digit8': 37, 'Digit9': 38, 'Digit0': 39,
			'Enter': 40, 'Escape': 41, 'Backspace': 42, 'Tab': 43, 'Space': 44,
			'Minus': 45, 'Equal': 46, 'BracketLeft': 47, 'BracketRight': 48, 'Backslash': 49,
			'Semicolon': 51, 'Quote': 52, 'Backquote': 53, 'Comma': 54, 'Period': 55, 'Slash': 56,
			'CapsLock': 57, 'F1': 58, 'F2': 59, 'F3': 60, 'F4': 61, 'F5': 62, 'F6': 63,
			'F7': 64, 'F8': 65, 'F9': 66, 'F10': 67, 'F11': 68, 'F12': 69,
			'PrintScreen': 70, 'ScrollLock': 71, 'Pause': 72, 'Insert': 73, 'Home': 74,
			'PageUp': 75, 'Delete': 76, 'End': 77, 'PageDown': 78, 'ArrowRight': 79,
			'ArrowLeft': 80, 'ArrowDown': 81, 'ArrowUp': 82, 'NumLock': 83,
			'NumpadDivide': 84, 'NumpadMultiply': 85, 'NumpadSubtract': 86, 'NumpadAdd': 87,
			'NumpadEnter': 88, 'Numpad1': 89, 'Numpad2': 90, 'Numpad3': 91, 'Numpad4': 92,
			'Numpad5': 93, 'Numpad6': 94, 'Numpad7': 95, 'Numpad8': 96, 'Numpad9': 97, 'Numpad0': 98,
			'NumpadDecimal': 99, 'IntlBackslash': 100, 'ContextMenu': 101, 'Power': 102,
			'NumpadEqual': 103, 'F13': 104, 'F14': 105, 'F15': 106, 'F16': 107, 'F17': 108,
			'F18': 109, 'F19': 110, 'F20': 111, 'F21': 112, 'F22': 113, 'F23': 114, 'F24': 115,
			'ControlLeft': 224, 'ShiftLeft': 225, 'AltLeft': 226, 'MetaLeft': 227,
			'ControlRight': 228, 'ShiftRight': 229, 'AltRight': 230, 'MetaRight': 231
		}
		
		const hidUsageCode = keyCodeToHidMap[keyCode]
		console.log('Looking for HID usage code:', hidUsageCode)
		
		if (!hidUsageCode) return null
		
		// Find the key position that matches the HID usage code
		for (let i = 0; i < currentLayer.bindings.length && i < currentLayout.keys.length; i++) {
			const binding = currentLayer.bindings[i]
			const behavior = behaviors[binding.behaviorId]
			
			// Extract HID usage ID from ZMK binding value
			// ZMK binding format: (page << 16) | id
			// So we need to extract the lower 16 bits to get the HID usage ID
			const hidUsageIdFromBinding = binding.param1 & 0xFFFF
			
			console.log(`Position ${i}:`, {
				binding,
				behavior: behavior?.displayName,
				param1: binding.param1,
				param1Hex: binding.param1?.toString(16),
				hidUsageIdFromBinding,
				hidUsageIdFromBindingHex: hidUsageIdFromBinding.toString(16),
				expectedHidUsageCode: hidUsageCode,
				matches: hidUsageIdFromBinding === hidUsageCode
			})
			
			// Check if the extracted HID usage ID matches our expected code
			if (hidUsageIdFromBinding === hidUsageCode) {
				console.log('Found match at position:', i)
				return i
			}
		}
		
		// Fallback: Try to match by behavior display name
		console.log('Trying fallback matching by behavior name...')
		const keyNameMap: Record<string, string> = {
			'KeyA': 'A', 'KeyB': 'B', 'KeyC': 'C', 'KeyD': 'D', 'KeyE': 'E', 'KeyF': 'F', 'KeyG': 'G',
			'KeyH': 'H', 'KeyI': 'I', 'KeyJ': 'J', 'KeyK': 'K', 'KeyL': 'L', 'KeyM': 'M', 'KeyN': 'N',
			'KeyO': 'O', 'KeyP': 'P', 'KeyQ': 'Q', 'KeyR': 'R', 'KeyS': 'S', 'KeyT': 'T', 'KeyU': 'U',
			'KeyV': 'V', 'KeyW': 'W', 'KeyX': 'X', 'KeyY': 'Y', 'KeyZ': 'Z',
			'Digit1': '1', 'Digit2': '2', 'Digit3': '3', 'Digit4': '4', 'Digit5': '5',
			'Digit6': '6', 'Digit7': '7', 'Digit8': '8', 'Digit9': '9', 'Digit0': '0',
			'Enter': 'Enter', 'Escape': 'Escape', 'Backspace': 'Backspace', 'Tab': 'Tab', 'Space': 'Space',
			'Minus': '-', 'Equal': '=', 'BracketLeft': '[', 'BracketRight': ']', 'Backslash': '\\',
			'Semicolon': ';', 'Quote': "'", 'Backquote': '`', 'Comma': ',', 'Period': '.', 'Slash': '/',
			'CapsLock': 'Caps Lock', 'F1': 'F1', 'F2': 'F2', 'F3': 'F3', 'F4': 'F4', 'F5': 'F5', 'F6': 'F6',
			'F7': 'F7', 'F8': 'F8', 'F9': 'F9', 'F10': 'F10', 'F11': 'F11', 'F12': 'F12'
		}
		
		const expectedName = keyNameMap[keyCode]
		if (expectedName) {
			for (let i = 0; i < currentLayer.bindings.length && i < currentLayout.keys.length; i++) {
				const binding = currentLayer.bindings[i]
				const behavior = behaviors[binding.behaviorId]
				
				if (behavior?.displayName === expectedName) {
					console.log('Found fallback match at position:', i, 'for name:', expectedName)
					return i
				}
			}
		}
		
		console.log('No match found for key:', keyCode)
		return null
	}, [layouts, keymap, selectedLayerIndex, selectedPhysicalLayoutIndex, behaviors])

	// Keyboard event handlers
	const handleKeyDown = useCallback((event: KeyboardEvent) => {
		// Prevent default behavior for certain keys to avoid conflicts
		console.log(event)
		if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
			return
		}
		
		const keyPosition = mapKeyCodeToPosition(event.code)
		if (keyPosition !== null) {
			setPressedKeys(prev => new Set(prev).add(keyPosition))
		}
		console.log(keyPosition)
	}, [mapKeyCodeToPosition])

	const handleKeyUp = useCallback((event: KeyboardEvent) => {
		const keyPosition = mapKeyCodeToPosition(event.code)
		if (keyPosition !== null) {
			setPressedKeys(prev => {
				const newSet = new Set(prev)
				newSet.delete(keyPosition)
				return newSet
			})
		}
	}, [mapKeyCodeToPosition])

	// Add keyboard event listeners
	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown)
		window.addEventListener('keyup', handleKeyUp)
		return () => {
			window.removeEventListener('keydown', handleKeyDown)
			window.removeEventListener('keyup', handleKeyUp)
		}
	}, [handleKeyDown, handleKeyUp])

	// Clear pressed keys when layer changes
	useEffect(() => {
		setPressedKeys(new Set())
	}, [selectedLayerIndex])

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
