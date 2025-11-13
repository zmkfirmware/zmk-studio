import { useState, useEffect, useCallback, useMemo } from 'react'
import {KeyboardKeys, keyboards} from '../../data/keys'
import Keycode from './Keycode.tsx'
import { Key } from 'react-aria-components'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { hidUsageFromPageAndId, hidUsagePageAndIdFromUsage } from "@/helpers/hid-usages.ts"

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
    value?: number
    label?: string
    onValueChanged?: (value?: number) => void
    onKeySelected?: (key: number | undefined) => void
    onModifiersChanged?: (modifiers: Mods[]) => void
}

// Container dimensions - easily configurable
const CONTAINER_MAX_HEIGHT = 350 // Maximum height in pixels
const CONTAINER_MAX_WIDTH = '100%' // Maximum width (can be changed to a pixel value if needed)

// Modifier key IDs (from keyboard data)
const MODIFIER_KEY_IDS = [224, 225, 226, 227, 228, 229, 230, 231] // Left/Right Control, Shift, Alt, GUI

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
    224: Mods.LeftControl, // Keyboard LeftControl
    225: Mods.LeftShift, // Keyboard LeftShift
    226: Mods.LeftAlt, // Keyboard LeftAlt
    227: Mods.LeftGUI, // Keyboard Left GUI
    228: Mods.RightControl, // Keyboard RightControl
    229: Mods.RightShift, // Keyboard RightShift
    230: Mods.RightAlt, // Keyboard RightAlt
    231: Mods.RightGUI, // Keyboard Right GUI
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
            const key = keyboard.UsageIds.find((k) => {
                const kId = typeof k.Id === 'string' ? parseInt(k.Id) : k.Id
                return kId === zmkCode
            })
            if (key) {
                return zmkCode // It's already a valid HID usage code
            }
        }
    }

    // If it's not a standard HID usage code, try to convert it using HID usage logic
    // This handles cases like 458767 which represents page 7, ID 15 (Keyboard L)
    const page = (zmkCode >> 16) & 0xffff
    const id = zmkCode & 0xffff

    console.log('Converting HID usage:', { zmkCode, page, id })

    // Check if this page and ID combination exists in our keyboard data
    for (const keyboard of keyboards) {
        if (keyboard.Id === page) {
            const key = keyboard.UsageIds.find((k) => {
                const kId = typeof k.Id === 'string' ? parseInt(k.Id) : k.Id
                return kId === id
            })
            if (key) {
                return id // Return the ID part as the selected key
            }
        }
    }

    // If the page is not a standard HID page (like 519), try to extract just the key ID
    // This handles complex ZMK binding values that include behavior information
    if (page > 100) {
        // Non-standard page, likely ZMK binding
        console.log(
            'Non-standard HID page detected, trying to extract key ID from complex ZMK value',
        )

        // Try different bit patterns to extract the actual key ID
        // ZMK binding values might have the key ID in different bit positions
        const possibleKeyIds = [
            id, // Standard 16-bit ID
            (zmkCode >> 8) & 0xff, // 8-bit ID at different position
            zmkCode & 0xff, // 8-bit ID at lowest position
            (zmkCode >> 24) & 0xff, // 8-bit ID at highest position
        ]

        for (const keyId of possibleKeyIds) {
            if (keyId >= 1 && keyId <= 231) {
                // Verify this key ID exists in our keyboard data
                for (const keyboard of keyboards) {
                    const key = keyboard.UsageIds.find((k) => {
                        const kId =
                            typeof k.Id === 'string' ? parseInt(k.Id) : k.Id
                        return kId === keyId
                    })
                    if (key) {
                        console.log(
                            'Found valid key ID in complex ZMK value:',
                            { keyId, keyLabel: key.Label },
                        )
                        return keyId
                    }
                }
            }
        }
    }

    console.warn('Unable to convert HID usage to valid key:', {
        zmkCode,
        page,
        id,
    })
    return undefined
}

export function KeysLayout({
    value,
    label,
    onValueChanged,
    onKeySelected,
    onModifiersChanged,
}: KeysLayoutProps) {
    const [activeTab, setActiveTab] = useState('0')
    const [selectedKey, setSelectedKey] = useState<number | undefined>(
        undefined,
    )
    const [selectedModifiers, setSelectedModifiers] = useState<Mods[]>([])
    const [searchQuery, setSearchQuery] = useState('')

	const mods = useMemo(() => {
		const flags = value ? value >> 24 : 0

		return all_mods.filter((m) => m & flags).map((m) => m.toLocaleString())
	}, [value])

	const handleKeySelect = useCallback(
		(e: Key | null) => {

			let value = typeof e == 'number' ? e : undefined
			if (value !== undefined) {
				const mod_flags = mods_to_flags(mods.map((m) => parseInt(m)))
				value = value | (mod_flags << 24)
			}

			// console.log(all_mods, mods, value)
            setSelectedKey(value)
			onValueChanged(value)
		},
		[onValueChanged, mods],
	)


    // // Initialize selectedKey and modifiers from value if provided
    // useEffect(() => {
    //     if (value !== undefined && value !== 0) {
    //         console.log('KeysLayout received value:', value)
	//
    //         // Try to convert ZMK key code to HID usage code
    //         const hidUsageCode = convertZmkToHidUsage(value)
    //         console.log('Converted to HID usage code:', hidUsageCode)
	//
    //         if (hidUsageCode !== undefined) {
    //             // Use the converted HID usage code
    //             setSelectedKey(hidUsageCode)
    //             setSelectedModifiers([]) // No modifiers for now
    //         } else {
    //             // Fallback to the old logic for HID usage behaviors
    //             const maskedValue = mask_mods(value)
    //             const modifierFlags = value >> 24
	//
    //             // Set selected key (excluding modifiers)
    //             if (maskedValue > 0) {
    //                 setSelectedKey(maskedValue)
    //             } else {
    //                 setSelectedKey(undefined)
    //             }
	//
    //             // Set selected modifiers
    //             const mods = all_mods.filter((m) => m & modifierFlags)
    //             setSelectedModifiers(mods)
	//
    //             // If we still couldn't find a valid key, show the raw value for debugging
    //             if (maskedValue === 0 && value > 0) {
    //                 console.warn(
    //                     'Could not convert value to valid key, showing raw value for debugging:',
    //                     value,
    //                 )
    //                 // Don't set selectedKey to undefined here, keep the raw value for display
    //             }
    //         }
    //     } else {
    //         setSelectedKey(undefined)
    //         setSelectedModifiers([])
    //     }
    // }, [value])
	//
    // // Notify parent of key selection changes
    useEffect(() => {
        setSelectedKey(value)
    }, [value])

    // Set the active tab based on the selected key's HID usage page
    useEffect(() => {
        if (value !== undefined && value !== 0) {
            // Extract HID usage page and ID from value
            // HID usage format: (page << 16) | id
            // Modifiers are stored in bits 24-31, so we mask them out first
            const maskedValue = value & 0x00FFFFFF // Mask out modifier flags in upper 8 bits
            const [page, id] = hidUsagePageAndIdFromUsage(maskedValue)

            // Find which keyboard tab contains this key
            for (let i = 0; i < keyboards.length; i++) {
                const keyboard = keyboards[i]
                // Check if this keyboard's page matches
                if (keyboard.Id === page) {
                    // Verify the key ID exists in this keyboard
                    const key = keyboard.UsageIds.find((k) => {
                        const kId = typeof k.Id === 'string' ? parseInt(k.Id) : k.Id
                        return kId === id
                    })
                    if (key) {
                        // Found the matching keyboard tab
                        setActiveTab(i.toString())
                        return
                    }
                }
            }

            // Fallback: if page doesn't match, try to find by key ID only
            // This handles cases where the value might be just the key ID (1-231)
            // or where the page format is different
            if (id >= 1 && id <= 231) {
                for (let i = 0; i < keyboards.length; i++) {
                    const keyboard = keyboards[i]
                    const key = keyboard.UsageIds.find((k) => {
                        const kId = typeof k.Id === 'string' ? parseInt(k.Id) : k.Id
                        return kId === id
                    })
                    if (key) {
                        setActiveTab(i.toString())
                        return
                    }
                }
            }
        }
    }, [value])
	//
    // // Notify parent of modifier changes
    // useEffect(() => {
    //     onModifiersChanged?.(selectedModifiers)
    // }, [selectedModifiers, onModifiersChanged])
	//
    // // Handle key selection - this is the main change to work like HidUsagePicker
    // function handleKeySelect(keyCode: string) {
    //     const numericValue = parseInt(keyCode)
    //     if (!isNaN(numericValue)) {
    //         console.log('KeysLayout handleKeySelect:', {
    //             keyCode,
    //             numericValue,
    //             isModifier: MODIFIER_KEY_IDS.includes(numericValue),
    //         })
	//
    //         // Check if this is a modifier key
    //         if (MODIFIER_KEY_IDS.includes(numericValue)) {
    //             const modifier = KEY_ID_TO_MOD[numericValue]
    //             if (modifier) {
    //                 console.log('Handling modifier key:', {
    //                     numericValue,
    //                     modifier,
    //                     currentSelectedKey: selectedKey,
    //                 })
    //                 setSelectedModifiers((prev) => {
    //                     const isSelected = prev.includes(modifier)
    //                     const newModifiers = isSelected
    //                         ? prev.filter((m) => m !== modifier)
    //                         : [...prev, modifier]
	//
    //                     console.log('Modifier state update:', {
    //                         prev,
    //                         newModifiers,
    //                         isSelected,
    //                     })
	//
    //                     // For modifier keys, only update if we have a selected key
    //                     // This prevents modifiers from breaking key selection
    //                     if (selectedKey !== undefined) {
    //                         console.log(
    //                             'Updating parent with key + modifiers:',
    //                             { selectedKey, newModifiers },
    //                         )
    //                         // Update parent component with current key + new modifiers
    //                         updateParentValue(selectedKey, newModifiers)
    //                     } else {
    //                         console.log(
    //                             'No key selected, not updating parent for modifier',
    //                         )
    //                     }
    //                     return newModifiers
    //                 })
    //             }
    //         } else {
    //             console.log('Handling regular key:', {
    //                 numericValue,
    //                 currentModifiers: selectedModifiers,
    //             })
    //             // For regular keys, set as the selected key (single selection like HidUsagePicker)
    //             setSelectedKey(numericValue)
	//
    //             // Update parent component immediately like HidUsagePicker
    //             // Use current modifiers with the new key
    //             updateParentValue(numericValue, selectedModifiers)
    //         }
    //     }
    // }
	//
    // // Helper function to update parent component (like HidUsagePicker's selectionChanged)
    // function updateParentValue(
    //     keyValue: number | undefined,
    //     modifiers: Mods[],
    // ) {
    //     // If no key is selected and no modifiers, don't update parent
    //     if (keyValue === undefined && modifiers.length === 0) {
    //         console.log('No key or modifiers selected, not updating parent')
    //         onValueChanged?.(undefined)
    //         return
    //     }
	//
    //     // If modifiers are being updated but no key is selected, don't update parent
    //     if (keyValue === undefined && modifiers.length > 0) {
    //         console.log('Modifiers selected but no key, not updating parent')
    //         return
    //     }
	//
    //     // Convert the key ID back to HID usage format
    //     // If the original value was a HID usage (like 458767), we need to maintain that format
    //     let finalValue: number
	//
    //     if (keyValue !== undefined) {
    //         // Check if the original value was a HID usage format
    //         if (value && value > 0xffff) {
    //             // Original value was HID usage format (like 458767), maintain that format
    //             const page = (value >> 16) & 0xffff
    //             finalValue = (page << 16) | keyValue // Combine page with new key ID
    //         } else {
    //             // Original value was not HID usage format, use simple key ID
    //             finalValue = keyValue
    //         }
	//
    //         // Add modifier flags if any
    //         const modifierFlags = mods_to_flags(modifiers) << 24
    //         finalValue = finalValue | modifierFlags
    //     } else {
    //         finalValue = 0
    //     }
	//
    //     console.log('KeysLayout updating parent with value:', {
    //         keyValue,
    //         modifiers,
    //         finalValue,
    //         originalValue: value,
    //         hidUsageFormat: value && value > 0xffff ? 'yes' : 'no',
    //     })
	//
    //     // Send the properly formatted value
    //     if (finalValue >= 0 && finalValue <= 0xffffffff) {
    //         console.log('Calling onValueChanged with:', finalValue)
    //         onValueChanged?.(finalValue > 0 ? finalValue : undefined)
    //     } else {
    //         console.error('Invalid value generated:', finalValue)
    //         onValueChanged?.(undefined)
    //     }
    // }
	//
    // // Helper function to get key info by ID
    // function getKeyInfo(keyId: number) {
    //     for (const keyboard of keyboards) {
    //         const key = keyboard.UsageIds.find((k) => {
    //             const kId = typeof k.Id === 'string' ? parseInt(k.Id) : k.Id
    //             return kId === keyId
    //         })
    //         if (key) {
    //             return { ...key, keyboardName: keyboard.Name }
    //         }
    //     }
    //     return null
    // }
	//
    // // Helper function to get numeric ID from key
	//
    // // Helper function to check if a key is selected (including modifiers)
    function isKeySelected(keyId: number): boolean {
        const isSelected = selectedKey === keyId
        if (isSelected) {
            console.log(`Key ${keyId} is selected in KeysLayout`)
        }
        return isSelected
    }
	//
    // // Helper function to get display label for selected key
    // function getSelectedKeyDisplayLabel(): string {
    //     if (selectedKey === undefined) return ''
	//
    //     const keyInfo = getKeyInfo(selectedKey)
    //     if (keyInfo) {
    //         // Prefer Label over Name, and ensure we have a readable string
    //         const label = keyInfo.Label || keyInfo.Name
    //         if (label && label.trim() !== '') {
    //             return label
    //         }
    //     }
	//
    //     // If we can't get a proper label, try to find it in the keyboard data
    //     // This is a fallback for when the conversion might have failed
    //     for (const keyboard of keyboards) {
    //         const key = keyboard.UsageIds.find((k) => {
    //             const kId = typeof k.Id === 'string' ? parseInt(k.Id) : k.Id
    //             return kId === selectedKey
    //         })
    //         if (key && key.Label && key.Label.trim() !== '') {
    //             return key.Label
    //         }
    //     }
	//
    //     // Last resort: show a generic label
    //     return `Key ${selectedKey}`
    // }

    // Helper function to filter keys by search query
    const filterKeysBySearch = useCallback((keys: typeof keyboards[0]['UsageIds'], query: string) => {
        if (!query.trim()) {
            return keys
        }
        const lowerQuery = query.toLowerCase()
        return keys.filter((key) => {
            const label = key.Label || ''
            // Remove HTML tags for search comparison
            const textContent = label.replace(/<[^>]*>/g, '').toLowerCase()
            return textContent.includes(lowerQuery)
        })
    }, [])

    // Check which keyboards have matching keycodes for the search query
    const keyboardsWithMatches = useMemo(() => {
        return keyboards.map((keyboard, index) => {
            const filteredKeys = filterKeysBySearch(keyboard.UsageIds, searchQuery)
            return {
                index,
                hasMatches: filteredKeys.length > 0
            }
        })
    }, [searchQuery, filterKeysBySearch])

    // Switch to first enabled tab if current tab becomes disabled
    useEffect(() => {
        if (searchQuery.trim()) {
            const currentTabIndex = parseInt(activeTab)
            const currentKeyboard = keyboardsWithMatches[currentTabIndex]
            
            // If current tab has no matches, switch to first tab with matches
            if (currentKeyboard && !currentKeyboard.hasMatches) {
                const firstEnabledTab = keyboardsWithMatches.find(k => k.hasMatches)
                if (firstEnabledTab) {
                    setActiveTab(firstEnabledTab.index.toString())
                }
            }
        }
    }, [searchQuery, activeTab, keyboardsWithMatches])

	function keysList ( keyboard: KeyboardKeys, key, keyIndex: number ) {
		const keyId = hidUsageFromPageAndId( keyboard.Id, (key.Id as number) )
		const keyWidth = ('w' in key && key.w) ? key.w / 2 : 50
		const keyHeight = ('h' in key && key.h) ? key.h / 2 : 50

		return (
			<div
				key={key.Id + '-' + keyIndex}
				style={{
					position: 'relative',
					width: `${keyWidth}px`,
					height: `${keyHeight}px`,
					flexShrink: 0,
				}}
			>
				<Keycode
					value={keyId}
					label={key.Label}
					width={keyWidth}
					height={keyHeight}
					x={0}
					y={0}
					baseKeyValue={key.Id}
					onSelect={handleKeySelect}
					isSelected={isKeySelected( keyId )}
				/>
			</div>
		)
	}

	return (
        <>
            <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
            >
                <div className="flex items-center gap-4 mb-4">
                    <TabsList className="flex-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {keyboards.map((keyboard, index) => {
                            const keyboardMatch = keyboardsWithMatches[index]
                            const isDisabled = searchQuery.trim() !== '' && !keyboardMatch?.hasMatches
                            
                            return (
                                <TabsTrigger
                                    key={keyboard.Name}
                                    value={index.toString()}
                                    disabled={isDisabled}
                                >
                                    {keyboard.Name}
                                </TabsTrigger>
                            )
                        })}
                    </TabsList>
                    <Input
                        type="text"
                        placeholder="Search keycodes by label..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-64 flex-shrink-0 flex"
                    />
                </div>

                {keyboards.map((keyboard, index) => {
                    // Filter keys by search query first
                    const filteredKeys = filterKeysBySearch(keyboard.UsageIds, searchQuery)
                    
                    // Separate keys with positions from keys without positions
                    const keysWithPositions = filteredKeys.filter(
                        (key) => key.x !== undefined && key.y !== undefined && key.x !== null && key.y !== null
                    )
                    const keysWithoutPositions = filteredKeys.filter(
                        (key) => key.x === undefined || key.y === undefined || key.x === null || key.y === null
                    )

                    // Calculate the maximum bottom position needed for keys with positions
                    const keySize = 50 // base key size used in Keycode component
                    let maxBottomPosition = 0
                    keysWithPositions.forEach((key) => {
                        const keyHeight = ('h' in key && key.h) ? key.h / 2 : 50
                        const bottomPosition = (key.y / 100) * keySize + keyHeight
                        if (bottomPosition > maxBottomPosition) {
                            maxBottomPosition = bottomPosition
                        }
                    })

                    // Calculate approximate height needed for keys without positions (wrapping)
                    // Estimate based on average key width and container width
                    // Keys wrap, so we estimate rows needed
                    let keysWithoutPosHeight = 0
                    if (keysWithoutPositions.length > 0) {
                        const avgKeyWidth = 60 // average key width in pixels
                        const containerWidth = 800 // approximate container width
                        const keysPerRow = Math.floor(containerWidth / avgKeyWidth)
                        const numRows = Math.ceil(keysWithoutPositions.length / keysPerRow)
                        keysWithoutPosHeight = numRows * 60 // 60px per row (key height + gap)
                    }

                    // Set container height to accommodate all content, with padding
                    const calculatedHeight = Math.max(maxBottomPosition + 48, keysWithoutPosHeight + 48, 350) // +48 for padding (24px top + 24px bottom)

                    return (
                        <TabsContent
                            key={keyboard.Name}
                            value={index.toString()}
                            className="mt-4"
                        >
                            <div
                                className="relative p-6"
                                style={{ 
                                    minHeight: `${Math.min(calculatedHeight, CONTAINER_MAX_HEIGHT)}px`,
                                    maxHeight: `${CONTAINER_MAX_HEIGHT}px`,
                                    overflowY: 'auto',
                                    overflowX: 'hidden'
                                }}
                            >
                                {/* Render keys with positions using absolute positioning */}
                                {keysWithPositions.map((key, keyIndex) => {
                                    const keyId = hidUsageFromPageAndId(keyboard.Id, (key.Id as number))
                                    const keyWidth = ('w' in key && key.w) ? key.w / 2 : 50
                                    const keyHeight = ('h' in key && key.h) ? key.h / 2 : 50

                                    return (
                                        <Keycode
                                            key={key.Id + '-' + keyIndex}
                                            value={keyId}
                                            label={key.Label}
                                            width={keyWidth}
                                            height={keyHeight}
                                            x={key.x / 100}
                                            y={key.y / 100}
                                            baseKeyValue={key.Id}
                                            onSelect={handleKeySelect}
                                            isSelected={isKeySelected(keyId)}
                                        />
                                    )
                                })}

                                {/* Render keys without positions in a horizontal flow with wrapping */}
                                {keysWithoutPositions.length > 0 && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: '0px',
                                            left: '0px',
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '4px',
                                            width: '100%',
                                            maxWidth: '100%',
                                        }}
                                    >
                                        {keysWithoutPositions.map((key, keyIndex) => {
	                                        return keysList( keyboard, key, keyIndex );
                                        })}
                                    </div>
                                )}
                                {/* Spacer to ensure container scroll height includes all absolutely positioned content */}
                                {calculatedHeight > CONTAINER_MAX_HEIGHT && (
                                    <div
                                        style={{
                                            position: 'relative',
                                            width: '1px',
                                            height: `${calculatedHeight - CONTAINER_MAX_HEIGHT}px`,
                                            pointerEvents: 'none',
                                            opacity: 0
                                        }}
                                    />
                                )}
                            </div>
                        </TabsContent>
                    )
                })}
            </Tabs>
        </>
    )
}
