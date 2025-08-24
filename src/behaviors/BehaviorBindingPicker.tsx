import { useEffect, useMemo, useState } from "react"

import {
	GetBehaviorDetailsResponse,
	BehaviorBindingParametersSet
} from "@zmkfirmware/zmk-studio-ts-client/behaviors"
import { BehaviorBinding } from "@zmkfirmware/zmk-studio-ts-client/keymap"
import { BehaviorParametersPicker } from "./BehaviorParametersPicker"
import { validateValue } from "./parameters"

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

	const metadata = useMemo( () =>
			behaviors.find( ( b ) => b.id == behaviorId )?.metadata,
		[ behaviorId, behaviors ]
	)

	const sortedBehaviors = useMemo(
		() =>
			behaviors.sort( ( a, b ) =>
				a.displayName.localeCompare( b.displayName )
			),
		[ behaviors ]
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

	return (
		<div className="flex flex-row gap-2 w-full">
			<ul className="menu bg-base-200 rounded-box w-50 flex-nowrap flex-col h-96 overflow-auto">
				{ sortedBehaviors.map( ( b ) => (
					<li key={ b.id }>
						<a
							aria-label={ b.displayName }
							data-behavior-id={ b.id }
							onClick={ ( e ) => {
								const target = e.target as HTMLAnchorElement;
								const behaviorId = parseInt( target.getAttribute( 'data-behavior-id' ) || '0' );
								setBehaviorId( behaviorId );
								setParam1( 0 );
								setParam2( 0 );
							} }
						>
							{ b.displayName }
						</a>
					</li>
				) ) }
			</ul>
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
