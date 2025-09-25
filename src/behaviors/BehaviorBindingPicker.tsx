import { useEffect, useMemo, useState } from "react"

import {
	GetBehaviorDetailsResponse,
	BehaviorBindingParametersSet
} from "@zmkfirmware/zmk-studio-ts-client/behaviors"
import { BehaviorBinding } from "@zmkfirmware/zmk-studio-ts-client/keymap"
import { BehaviorParametersPicker } from "./BehaviorParametersPicker"
import { BehaviorSelector } from "./BehaviorSelector"
import { validateValue } from "./parameters"
import {
	Sidebar,
	SidebarFooter,
	SidebarGroupContent, SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem
} from "@/components/ui/sidebar"
import { SidebarContent, SidebarGroup, SidebarHeader } from "@/components/ui/sidebar.tsx"
import { SelectedKeysDisplay } from "@/components/keycodes/SelectedKeysDisplay"

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

export interface BehaviorBindingPickerProps {
	binding: BehaviorBinding
	behaviors: GetBehaviorDetailsResponse[]
	layers: { id: number; name: string }[]
	onBindingChanged: ( binding: BehaviorBinding ) => void
}

function validateBinding (
	metadata: BehaviorBindingParametersSet[],
	layerIds: number[],
	param1?: number,
	param2?: number
): boolean {
	if (
		(param1 === undefined || param1 === 0) &&
		metadata.every( ( s ) => !s.param1 || s.param1.length === 0 )
	) {
		return true
	}

	let matchingSet = metadata.find( ( s ) =>
		validateValue( layerIds, param1, s.param1 )
	)

	if ( !matchingSet ) {
		return false
	}

	return validateValue( layerIds, param2, matchingSet.param2 )
}

export const BehaviorBindingPicker = ( {
	binding,
	layers,
	behaviors,
	onBindingChanged
}: BehaviorBindingPickerProps ) => {
	const [ behaviorId, setBehaviorId ] = useState( binding.behaviorId )
	const [ param1, setParam1 ] = useState<number | undefined>( binding.param1 )
	const [ param2, setParam2 ] = useState<number | undefined>( binding.param2 )

	// Add state for selected keys display - with some test data to see the component
	const [ selectedKey, setSelectedKey ] = useState<number | undefined>(4) // Test with Space key
	const [ selectedModifiers, setSelectedModifiers ] = useState<Mods[]>([Mods.LeftControl, Mods.LeftShift]) // Test with some modifiers

	const metadata = useMemo( () =>
			behaviors.find( ( b ) => b.id == behaviorId )?.metadata,
		[ behaviorId, behaviors ]
	)

	useEffect( () => {
		if ( binding.behaviorId === behaviorId && binding.param1 === param1 && binding.param2 === param2 ) {
			return
		}

		console.log( binding.behaviorId === behaviorId && binding.param1 === param1 && binding.param2 === param2 )
		if ( !metadata ) {
			console.error(
				"Can't find metadata for the selected behaviorId",
				behaviorId
			)
			return
		}

		if ( validateBinding( metadata, layers.map( ( { id } ) => id ), param1, param2 ) ) {
			onBindingChanged( {
				behaviorId,
				param1: param1 || 0,
				param2: param2 || 0
			} )
		}
	}, [ behaviorId, param1, param2 ] )

	useEffect( () => {
		setBehaviorId( binding.behaviorId )
		setParam1( binding.param1 )
		setParam2( binding.param2 )
		console.log( binding )
	}, [ binding ] )

	const handleBehaviorSelected = (selectedBehaviorId: number) => {
		setBehaviorId(selectedBehaviorId)
		setParam1(0)
		setParam2(0)
	}

	// Handlers for SelectedKeysDisplay
	const handleClearAll = () => {
		setSelectedKey(undefined)
		setSelectedModifiers([])
	}

	const handleRemoveKey = (key: number) => {
		setSelectedKey(undefined)
	}

	const handleRemoveModifier = (keyId: number) => {
		// Find the modifier that corresponds to this keyId
		const modifier = KEY_ID_TO_MOD[keyId];
		if (modifier) {
			setSelectedModifiers(prev => prev.filter(m => m !== modifier));
		}
	}

	return (
		<div className="flex flex-col w-full">
			<div className="flex flex-row flex-1 gap-3">
				<BehaviorSelector
					behaviors={behaviors}
					selectedBehaviorId={behaviorId}
					onBehaviorSelected={handleBehaviorSelected}
					placeholder="Select behavior..."
				/>
				<SelectedKeysDisplay
					selectedKey={selectedKey}
					selectedModifiers={selectedModifiers}
					onClearAll={handleClearAll}
					onRemoveKey={handleRemoveKey}
					onRemoveModifier={handleRemoveModifier}
				/>
			</div>
			{ metadata && (
				<div className="flex-1">
					<BehaviorParametersPicker
						metadata={ metadata }
						param1={ param1 }
						param2={ param2 }
						layers={ layers }
						onParam1Changed={ setParam1 }
						onParam2Changed={ setParam2 }
					/>
				</div>
			) }
		</div>
	)
}
