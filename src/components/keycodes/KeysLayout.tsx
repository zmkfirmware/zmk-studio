import { useState, useEffect, useCallback, useMemo } from "react"
import { keyboards } from "../../data/keys"
import Keycode from "./Keycode.tsx"
import React from "react";
import { Key } from "react-aria-components"

/**
 * KeysLayout Component
 * 
 * A keyboard layout picker that works like HidUsagePicker:
 * - Shows the currently selected key from the keyboard
 * - Allows changing the selected key by clicking on keys in the layout
 * - Maintains keyboard-like visual display with key positions
 * - Supports modifier keys for HID usage behaviors
 * - Combines key value with modifier flags using bitwise OR
 */
interface KeysLayoutProps {
	value?: number;
	label?: string;
	onValueChanged?: (value?: number) => void;
}

// Modifier key IDs (from keyboard data)
const MODIFIER_KEY_IDS = [224, 225, 226, 227, 228, 229, 230, 231]; // Left/Right Control, Shift, Alt, GUI

// Modifier key definitions (same as HidUsagePicker)
enum Mods {
	LeftControl = 0x01,
	LeftShift = 0x02,
	LeftAlt = 0x04,
	LeftGUI = 0x08,
	RightControl = 0x10,
	RightShift = 0x20,
	RightAlt = 0x40,
	RightGUI = 0x80,
}

const mod_labels: Record<Mods, string> = {
	[Mods.LeftControl]: 'L Ctrl',
	[Mods.LeftShift]: 'L Shift',
	[Mods.LeftAlt]: 'L Alt',
	[Mods.LeftGUI]: 'L GUI',
	[Mods.RightControl]: 'R Ctrl',
	[Mods.RightShift]: 'R Shift',
	[Mods.RightAlt]: 'R Alt',
	[Mods.RightGUI]: 'R GUI',
}

const all_mods = [
	Mods.LeftControl,
	Mods.LeftShift,
	Mods.LeftAlt,
	Mods.LeftGUI,
	Mods.RightControl,
	Mods.RightShift,
	Mods.RightAlt,
	Mods.RightGUI,
]

// Map keyboard IDs to modifier flags
const KEY_ID_TO_MOD: Record<number, Mods> = {
	224: Mods.LeftControl,   // Keyboard LeftControl
	225: Mods.LeftShift,     // Keyboard LeftShift
	226: Mods.LeftAlt,       // Keyboard LeftAlt
	227: Mods.LeftGUI,       // Keyboard Left GUI
	228: Mods.RightControl,  // Keyboard RightControl
	229: Mods.RightShift,    // Keyboard RightShift
	230: Mods.RightAlt,      // Keyboard RightAlt
	231: Mods.RightGUI,      // Keyboard Right GUI
}

function mods_to_flags(mods: Mods[]): number {
	return mods.reduce((a, v) => a + v, 0)
}

function mask_mods(value: number) {
	return value & ~(mods_to_flags(all_mods) << 24)
}

// Function to convert ZMK key codes to HID usage codes
// This is needed because ZMK uses custom key codes that don't match standard HID usage codes
function convertZmkToHidUsage(zmkCode: number): number | undefined {
	// Check if it's already a valid HID usage code (1-231 for keyboard keys)
	if (zmkCode >= 1 && zmkCode <= 231) {
		// Verify it exists in our keyboard data
		for (const keyboard of keyboards) {
			const key = keyboard.UsageIds.find(k => {
				const kId = typeof k.Id === 'string' ? parseInt(k.Id) : k.Id;
				return kId === zmkCode;
			});
			if (key) {
				return zmkCode; // It's already a valid HID usage code
			}
		}
	}
	
	// If it's not a standard HID usage code, try to convert it using HID usage logic
	// This handles cases like 458767 which represents page 7, ID 15 (Keyboard L)
	const page = (zmkCode >> 16) & 0xffff;
	const id = zmkCode & 0xffff;
	
	console.log("Converting HID usage:", { zmkCode, page, id });
	
	// Check if this page and ID combination exists in our keyboard data
	for (const keyboard of keyboards) {
		if (keyboard.Id === page) {
			const key = keyboard.UsageIds.find(k => {
				const kId = typeof k.Id === 'string' ? parseInt(k.Id) : k.Id;
				return kId === id;
			});
			if (key) {
				return id; // Return the ID part as the selected key
			}
		}
	}
	
	// If the page is not a standard HID page (like 519), try to extract just the key ID
	// This handles complex ZMK binding values that include behavior information
	if (page > 100) { // Non-standard page, likely ZMK binding
		console.log("Non-standard HID page detected, trying to extract key ID from complex ZMK value");
		
		// Try different bit patterns to extract the actual key ID
		// ZMK binding values might have the key ID in different bit positions
		const possibleKeyIds = [
			id, // Standard 16-bit ID
			(zmkCode >> 8) & 0xff, // 8-bit ID at different position
			zmkCode & 0xff, // 8-bit ID at lowest position
			(zmkCode >> 24) & 0xff, // 8-bit ID at highest position
		];
		
		for (const keyId of possibleKeyIds) {
			if (keyId >= 1 && keyId <= 231) {
				// Verify this key ID exists in our keyboard data
				for (const keyboard of keyboards) {
					const key = keyboard.UsageIds.find(k => {
						const kId = typeof k.Id === 'string' ? parseInt(k.Id) : k.Id;
						return kId === keyId;
					});
					if (key) {
						console.log("Found valid key ID in complex ZMK value:", { keyId, keyLabel: key.Label });
						return keyId;
					}
				}
			}
		}
	}
	
	console.warn("Unable to convert HID usage to valid key:", { zmkCode, page, id });
	return undefined;
}

export function KeysLayout({ value, label, onValueChanged }: KeysLayoutProps) {
	const [activeTab, setActiveTab] = useState(0)
	const [selectedKey, setSelectedKey] = useState<number | undefined>(undefined)
	const [selectedModifiers, setSelectedModifiers] = useState<Mods[]>([])

	// Initialize selectedKey and modifiers from value if provided
	useEffect(() => {
		if (value !== undefined && value !== 0) {
			console.log("KeysLayout received value:", value);
			
			// Try to convert ZMK key code to HID usage code
			const hidUsageCode = convertZmkToHidUsage(value);
			console.log("Converted to HID usage code:", hidUsageCode);
			
			if (hidUsageCode !== undefined) {
				// Use the converted HID usage code
				setSelectedKey(hidUsageCode);
				setSelectedModifiers([]); // No modifiers for now
			} else {
				// Fallback to the old logic for HID usage behaviors
				const maskedValue = mask_mods(value)
				const modifierFlags = value >> 24
				
				// Set selected key (excluding modifiers)
				if (maskedValue > 0) {
					setSelectedKey(maskedValue)
				} else {
					setSelectedKey(undefined)
				}
				
				// Set selected modifiers
				const mods = all_mods.filter(m => m & modifierFlags)
				setSelectedModifiers(mods)
				
				// If we still couldn't find a valid key, show the raw value for debugging
				if (maskedValue === 0 && value > 0) {
					console.warn("Could not convert value to valid key, showing raw value for debugging:", value);
					// Don't set selectedKey to undefined here, keep the raw value for display
				}
			}
		} else {
			setSelectedKey(undefined)
			setSelectedModifiers([])
		}
	}, [value])

	// Handle key selection - this is the main change to work like HidUsagePicker
	function handleKeySelect(keyCode: string) {
		const numericValue = parseInt(keyCode);
		if (!isNaN(numericValue)) {
			console.log("KeysLayout handleKeySelect:", { keyCode, numericValue, isModifier: MODIFIER_KEY_IDS.includes(numericValue) });
			
			// Check if this is a modifier key
			if (MODIFIER_KEY_IDS.includes(numericValue)) {
				const modifier = KEY_ID_TO_MOD[numericValue];
				if (modifier) {
					console.log("Handling modifier key:", { numericValue, modifier, currentSelectedKey: selectedKey });
					setSelectedModifiers(prev => {
						const isSelected = prev.includes(modifier);
						const newModifiers = isSelected 
							? prev.filter(m => m !== modifier)
							: [...prev, modifier];
						
						console.log("Modifier state update:", { prev, newModifiers, isSelected });
						
						// For modifier keys, only update if we have a selected key
						// This prevents modifiers from breaking key selection
						if (selectedKey !== undefined) {
							console.log("Updating parent with key + modifiers:", { selectedKey, newModifiers });
							// Update parent component with current key + new modifiers
							updateParentValue(selectedKey, newModifiers);
						} else {
							console.log("No key selected, not updating parent for modifier");
						}
						return newModifiers;
					});
				}
			} else {
				console.log("Handling regular key:", { numericValue, currentModifiers: selectedModifiers });
				// For regular keys, set as the selected key (single selection like HidUsagePicker)
				setSelectedKey(numericValue);
				
				// Update parent component immediately like HidUsagePicker
				// Use current modifiers with the new key
				updateParentValue(numericValue, selectedModifiers);
			}
		}
	}

	// Helper function to update parent component (like HidUsagePicker's selectionChanged)
	function updateParentValue(keyValue: number | undefined, modifiers: Mods[]) {
		// If no key is selected and no modifiers, don't update parent
		if (keyValue === undefined && modifiers.length === 0) {
			console.log("No key or modifiers selected, not updating parent");
			onValueChanged?.(undefined);
			return;
		}
		
		// If modifiers are being updated but no key is selected, don't update parent
		if (keyValue === undefined && modifiers.length > 0) {
			console.log("Modifiers selected but no key, not updating parent");
			return;
		}
		
		// Convert the key ID back to HID usage format
		// If the original value was a HID usage (like 458767), we need to maintain that format
		let finalValue: number;
		
		if (keyValue !== undefined) {
			// Check if the original value was a HID usage format
			if (value && value > 0xffff) {
				// Original value was HID usage format (like 458767), maintain that format
				const page = (value >> 16) & 0xffff;
				finalValue = (page << 16) | keyValue; // Combine page with new key ID
			} else {
				// Original value was not HID usage format, use simple key ID
				finalValue = keyValue;
			}
			
			// Add modifier flags if any
			const modifierFlags = mods_to_flags(modifiers) << 24;
			finalValue = finalValue | modifierFlags;
		} else {
			finalValue = 0;
		}
		
		console.log("KeysLayout updating parent with value:", {
			keyValue,
			modifiers,
			finalValue,
			originalValue: value,
			hidUsageFormat: value && value > 0xffff ? 'yes' : 'no'
		});
		
		// Send the properly formatted value
		if (finalValue >= 0 && finalValue <= 0xFFFFFFFF) {
			console.log("Calling onValueChanged with:", finalValue);
			onValueChanged?.(finalValue > 0 ? finalValue : undefined);
		} else {
			console.error("Invalid value generated:", finalValue);
			onValueChanged?.(undefined);
		}
	}

	function removeSelectedKey(keyId: number) {
		console.log("removeSelectedKey called with:", { keyId, selectedKey, selectedModifiers });
		
		// Check if this is a modifier key
		if (MODIFIER_KEY_IDS.includes(keyId)) {
			const modifier = KEY_ID_TO_MOD[keyId];
			if (modifier) {
				console.log("Removing modifier:", { modifier, currentModifiers: selectedModifiers });
				setSelectedModifiers(prev => {
					const newModifiers = prev.filter(m => m !== modifier);
					console.log("Modifiers after removal:", { prev, newModifiers });
					
					// Only update parent if we have a selected key
					if (selectedKey !== undefined) {
						console.log("Updating parent after modifier removal:", { selectedKey, newModifiers });
						updateParentValue(selectedKey, newModifiers);
					} else {
						console.log("No key selected, not updating parent after modifier removal");
					}
					return newModifiers;
				});
			}
		} else {
			// Remove the selected key
			console.log("Removing selected key:", { keyId, selectedKey });
			setSelectedKey(undefined);
			// Update parent component immediately
			updateParentValue(undefined, selectedModifiers);
		}
	}

	function clearAllSelected() {
		console.log("clearAllSelected called, current state:", { selectedKey, selectedModifiers });
		setSelectedKey(undefined);
		setSelectedModifiers([]);
		// Update parent component immediately
		updateParentValue(undefined, []);
		console.log("clearAllSelected completed");
	}

	// Helper function to get key info by ID
	function getKeyInfo(keyId: number) {
		for (const keyboard of keyboards) {
			const key = keyboard.UsageIds.find(k => {
				const kId = typeof k.Id === 'string' ? parseInt(k.Id) : k.Id;
				return kId === keyId;
			});
			if (key) {
				return { ...key, keyboardName: keyboard.Name };
			}
		}
		return null;
	}

	// Helper function to get numeric ID from key
	function getKeyId(key: any): number {
		return typeof key.Id === 'string' ? parseInt(key.Id) : key.Id;
	}

	// Helper function to check if a key is selected (including modifiers)
	function isKeySelected(keyId: number): boolean {
		if (MODIFIER_KEY_IDS.includes(keyId)) {
			const modifier = KEY_ID_TO_MOD[keyId];
			return modifier ? selectedModifiers.includes(modifier) : false;
		}
		const isSelected = selectedKey === keyId;
		if (isSelected) {
			console.log(`Key ${keyId} is selected in KeysLayout`);
		}
		return isSelected;
	}

	// Helper function to get display label for selected key
	function getSelectedKeyDisplayLabel(): string {
		if (selectedKey === undefined) return "";
		
		const keyInfo = getKeyInfo(selectedKey);
		if (keyInfo) {
			// Prefer Label over Name, and ensure we have a readable string
			const label = keyInfo.Label || keyInfo.Name;
			if (label && label.trim() !== "") {
				return label;
			}
		}
		
		// If we can't get a proper label, try to find it in the keyboard data
		// This is a fallback for when the conversion might have failed
		for (const keyboard of keyboards) {
			const key = keyboard.UsageIds.find(k => {
				const kId = typeof k.Id === 'string' ? parseInt(k.Id) : k.Id;
				return kId === selectedKey;
			});
			if (key && key.Label && key.Label.trim() !== "") {
				return key.Label;
			}
		}
		
		// Last resort: show a generic label
		return `Key ${selectedKey}`;
	}

	return (
		<>
			{/* Selected Key Display - shows the currently selected key like HidUsagePicker */}
			{(selectedKey !== undefined || selectedModifiers.length > 0) && (
				<div className="mb-4 p-3 bg-base-200 rounded-lg">
					<div className="flex items-center justify-between mb-2">
						<h3 className="text-sm font-semibold">Selected Key & Modifiers:</h3>
						<button 
							onClick={clearAllSelected}
							className="btn btn-xs btn-ghost"
						>
							Clear All
						</button>
					</div>
					<div className="flex flex-wrap gap-2">
						{/* Display selected key */}
						{selectedKey !== undefined && (
							<div className="badge badge-primary gap-1">
								{getSelectedKeyDisplayLabel()}
								<button 
									onClick={() => setSelectedKey(undefined)}
									className="btn btn-xs btn-ghost p-0 h-4 w-4"
								>
									×
								</button>
							</div>
						)}
						{/* Display selected modifiers */}
						{selectedModifiers.map(modifier => {
							// Find the key ID that corresponds to this modifier
							const keyId = Object.keys(KEY_ID_TO_MOD).find(k => KEY_ID_TO_MOD[parseInt(k)] === modifier);
							const keyInfo = keyId ? getKeyInfo(parseInt(keyId)) : null;
							
							console.log("Displaying modifier:", { 
								modifier, 
								keyId, 
								keyInfo, 
								modLabel: mod_labels[modifier] 
							});
							
							return (
								<div key={`mod-${modifier}`} className="badge badge-secondary gap-1">
									{keyInfo?.Label || mod_labels[modifier]}
									<button 
										onClick={() => {
											console.log("Modifier X button clicked for:", { modifier, keyId });
											if (keyId) {
												removeSelectedKey(parseInt(keyId));
											}
										}}
										className="btn btn-xs btn-ghost p-0 h-4 w-4"
									>
										×
									</button>
								</div>
							);
						})}
					</div>
				</div>
			)}

			<div className="tabs tabs-lift tabs-sm">
				{keyboards.map((tab, index) => (
					<React.Fragment key={tab.Name}>
						<label className="tab">
							<input
								type="radio"
								name={tab.Name}
								checked={activeTab === index}
								onChange={() => setActiveTab(index)}
							/>
							{tab.Name}
						</label>

						{activeTab === index && (
							<div
								className="tab-content p-6 relative "
								style={{ height: "auto", minHeight: "350px", marginTop: "1rem" }}
							>
								{tab.UsageIds.map((key, keyIndex) => {
									const keyId = getKeyId(key);
									return (
										<Keycode
											key={key.Id + "-" + keyIndex}
											id={keyId}
											label={key.Label}
											width={key.w / 2 || 50}
											height={key.h / 2 || 50}
											x={key.x / 100}
											y={key.y / 100}
											keyCode={keyId.toString()}
											baseKeyValue={keyId}
											onSelect={handleKeySelect}
											isSelected={isKeySelected(keyId)}
										/>
									);
								})}
							</div>
						)}
					</React.Fragment>
				))}
			</div>
		</>
	)
}
