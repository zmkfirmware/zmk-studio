import { X } from "lucide-react"
import { KeysLayout } from "./keycodes/KeysLayout.tsx"
import { BehaviorBindingPicker } from "../behaviors/BehaviorBindingPicker.tsx"
import { BehaviorMap, useBehaviors } from "../helpers/Behaviors.ts"
import { BehaviorBinding, Keymap } from "@zmkfirmware/zmk-studio-ts-client/keymap"
import { useMemo, useState } from "react"

interface KeyEditorProps {
	selectedBinding?: BehaviorBinding,
	keymap?: Keymap,
	setSelectedKey?: ( value: ((( prevState: boolean ) => boolean) | boolean) ) => void,
	doUpdateBinding?: ( binding: BehaviorBinding ) => void,
	setSelectedKeyPosition?: ( value: ((( prevState: number ) => number) | number) ) => void,
	behaviors?: BehaviorMap
}

export function KeyEditor ( {
	selectedBinding,
	keymap,
	setSelectedKey,
	doUpdateBinding,
	setSelectedKeyPosition,
	behaviors
}: KeyEditorProps ) {
	const sortedBehaviors = useMemo(
		() =>
			Object.values( behaviors ).sort( ( a, b ) =>
				a.displayName.localeCompare( b.displayName )
			),
		[ behaviors ]
	)
	// const [ behaviorId, setBehaviorId ] = useState( selectedBinding.behaviorId )
	// const [ param1, setParam1 ] = useState<number | undefined>( selectedBinding.param1 )
	// const [ param2, setParam2 ] = useState<number | undefined>( selectedBinding.param2 )

	console.log(sortedBehaviors)
	return (
		<>
			<div className="p-2 col-start-2 row-start-2">
				<div className="card bg-base-100 shadow-xl">
					<div className="card-body p-4">
						<div className="card-actions w-full justify-between">
							<BehaviorBindingPicker
								binding={ selectedBinding }
								behaviors={ Object.values( behaviors ) }
								layers={ keymap.layers.map(
									( { id, name }, li ) => ({
										id,
										name: name || li.toLocaleString()
									})
								) }
								onBindingChanged={ doUpdateBinding }
							/>
							<button
								className="btn btn-square btn-sm"
								onClick={ () => {
									// setSelectedKey( false )
									setSelectedKeyPosition( undefined )
								} }
							>
								<X />
							</button>
						</div>
						<KeysLayout binding={ selectedBinding }></KeysLayout>
					</div>
				</div>
			</div>
		</>
	)
}