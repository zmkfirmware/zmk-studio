import { Keymap } from "@zmkfirmware/zmk-studio-ts-client/keymap"
import { PhysicalLayout } from "@zmkfirmware/zmk-studio-ts-client/keymap"

export interface KeypressDetectionConfig {
	layouts: PhysicalLayout[]
	keymap: Keymap
	selectedLayerIndex: number
	selectedPhysicalLayoutIndex: number
	behaviors: Record<number, any>
}

export class KeyboardKeypressService {
	private keyCodeToHidMap: Record<string, number> = {
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

	private keyNameMap: Record<string, string> = {
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

	// Cache for key position mappings to avoid repeated calculations
	private keyPositionCache = new Map<string, number | null>()
	private lastConfigHash: string | null = null

	/**
	 * Creates a hash for the current config to detect changes
	 */
	private getConfigHash(config: KeypressDetectionConfig): string {
		return `${config.selectedLayerIndex}-${config.selectedPhysicalLayoutIndex}-${config.keymap?.layers?.length || 0}`
	}

	/**
	 * Maps a key code to a key position on the keyboard layout
	 * @param keyCode - The keyboard event code (e.g., 'KeyA', 'Digit1')
	 * @param config - Configuration containing layouts, keymap, and behaviors
	 * @returns The key position index or null if not found
	 */
	mapKeyCodeToPosition(keyCode: string, config: KeypressDetectionConfig): number | null {
		if (!config.layouts || !config.keymap?.layers?.[config.selectedLayerIndex]) {
			return null
		}

		// Check if config changed and clear cache if needed
		const configHash = this.getConfigHash(config)
		if (this.lastConfigHash !== configHash) {
			this.keyPositionCache.clear()
			this.lastConfigHash = configHash
		}

		// Check cache first
		if (this.keyPositionCache.has(keyCode)) {
			return this.keyPositionCache.get(keyCode)!
		}

		const currentLayout = config.layouts[config.selectedPhysicalLayoutIndex]
		const currentLayer = config.keymap.layers[config.selectedLayerIndex]

		const hidUsageCode = this.keyCodeToHidMap[keyCode]
		if (!hidUsageCode) {
			this.keyPositionCache.set(keyCode, null)
			return null
		}

		// Find the key position that matches the HID usage code
		for (let i = 0; i < currentLayer.bindings.length && i < currentLayout.keys.length; i++) {
			const binding = currentLayer.bindings[i]
			const behavior = config.behaviors[binding.behaviorId]

			// Extract HID usage ID from ZMK binding value
			// ZMK binding format: (page << 16) | id
			// So we need to extract the lower 16 bits to get the HID usage ID
			const hidUsageIdFromBinding = binding.param1 & 0xFFFF

			// Check if the extracted HID usage ID matches our expected code
			if (hidUsageIdFromBinding === hidUsageCode) {
				this.keyPositionCache.set(keyCode, i)
				return i
			}
		}

		// Fallback: Try to match by behavior display name
		const expectedName = this.keyNameMap[keyCode]
		if (expectedName) {
			for (let i = 0; i < currentLayer.bindings.length && i < currentLayout.keys.length; i++) {
				const binding = currentLayer.bindings[i]
				const behavior = config.behaviors[binding.behaviorId]

				if (behavior?.displayName === expectedName) {
					this.keyPositionCache.set(keyCode, i)
					return i
				}
			}
		}

		this.keyPositionCache.set(keyCode, null)
		return null
	}

	/**
	 * Creates a keydown event handler with debouncing
	 * @param config - Configuration for keypress detection
	 * @param onKeyPressed - Callback function when a key is pressed
	 * @returns The keydown event handler function
	 */
	createKeyDownHandler(
		config: KeypressDetectionConfig,
		onKeyPressed: (keyPosition: number) => void
	) {
		return (event: KeyboardEvent) => {
			// Prevent default behavior for certain keys to avoid conflicts
			if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
				return
			}

			const keyPosition = this.mapKeyCodeToPosition(event.code, config)
			if (keyPosition !== null) {
				onKeyPressed(keyPosition)
			}
		}
	}

	/**
	 * Creates a keyup event handler with debouncing
	 * @param config - Configuration for keypress detection
	 * @param onKeyReleased - Callback function when a key is released
	 * @returns The keyup event handler function
	 */
	createKeyUpHandler(
		config: KeypressDetectionConfig,
		onKeyReleased: (keyPosition: number) => void
	) {
		return (event: KeyboardEvent) => {
			const keyPosition = this.mapKeyCodeToPosition(event.code, config)
			if (keyPosition !== null) {
				onKeyReleased(keyPosition)
			}
		}
	}

	/**
	 * Sets up keyboard event listeners
	 * @param config - Configuration for keypress detection
	 * @param onKeyPressed - Callback function when a key is pressed
	 * @param onKeyReleased - Callback function when a key is released
	 * @returns Cleanup function to remove event listeners
	 */
	setupKeyboardListeners(
		config: KeypressDetectionConfig,
		onKeyPressed: (keyPosition: number) => void,
		onKeyReleased: (keyPosition: number) => void
	) {
		const keyDownHandler = this.createKeyDownHandler(config, onKeyPressed)
		const keyUpHandler = this.createKeyUpHandler(config, onKeyReleased)

		window.addEventListener('keydown', keyDownHandler)
		window.addEventListener('keyup', keyUpHandler)

		// Return cleanup function
		return () => {
			window.removeEventListener('keydown', keyDownHandler)
			window.removeEventListener('keyup', keyUpHandler)
		}
	}
}

// Export a singleton instance
export const keyboardKeypressService = new KeyboardKeypressService()
