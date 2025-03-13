import { useState, useRef } from "react"
import { keyboards } from "../../data/keys"
import Keycode from "./Keycode.tsx"
import { BehaviorBinding } from "@zmkfirmware/zmk-studio-ts-client/keymap"

interface KeysLayoutProps {
	binding?: BehaviorBinding
}

export function KeysLayout ( { binding }: KeysLayoutProps ) {
	const [ activeTab, setActiveTab ] = useState( 0 )
	const containerRef = useRef<HTMLDivElement>( null )
	const [ behaviorId, setBehaviorId ] = useState( binding.behaviorId )
	const [ param1, setParam1 ] = useState<number | undefined>( binding.param1 )
	const [ param2, setParam2 ] = useState<number | undefined>( binding.param2 )

	function handleTabClick ( index: number ) {
		console.log( param1, param2, behaviorId )
		setActiveTab( index )
	}

	return (
		<>

			<div className="tabs tabs-lift tabs-sm">
				{ keyboards.map( ( tab, index ) => (
					<>
						<label className="tab">
							<input
								type="radio"
								name="tabs"
								// key={ tab.slug }
								onClick={ () => handleTabClick( index ) } />
							{ tab.Name }
						</label>

						<div className="tab-content bg-base-100 border-base-300 p-6 relative overflow-auto" style={ { height:"auto", minHeight: `350px`, marginTop: `1rem` } }>
							{ tab.UsageIds.map( ( key, index ) => (
								<Keycode
									key={ key.Id + "-" + index }
									id={ key.UsageId }
									label={ key.Label }
									width={ key.w / 2 || 50 }
									height={ key.h / 2 || 50 }
									x={ key.x / 100 }
									y={ key.y / 100 }
									keyCode={ key }
									onSelect={ ( data ) => {
										console.log( data )
									} }
								/>
							) ) }
						</div>
					</>
				) ) }
			</div>
			{/*<div className="p-2 col-start-2 row-start-2 bg-base-200">*/}
			{/*	<div className=""> /!*Tab Navigation*!/*/}
			{/*		<nav className="-mb-px flex gap-6">*/}
			{/*			{ keyboards.map( ( tab, index ) => (*/}
			{/*				<button*/}
			{/*					key={ index }*/}
			{/*					onClick={ () => handleTabClick( index ) }*/}
			{/*					className={ `shrink-0 border-b-2 p-3 text-sm font-medium ${*/}
			{/*						activeTab === index ? "border-sky-600 text-sky-600" : "border-transparent text-gray-500 hover:text-gray-700"*/}
			{/*					}` }*/}
			{/*				>*/}
			{/*					{ tab.Name }*/}
			{/*				</button>*/}
			{/*			) ) }*/}
			{/*		</nav>*/}
			{/*	</div>*/}

			{/*	<div*/}
			{/*		ref={ containerRef }*/}
			{/*		className="p-4 relative overflow-auto"*/}
			{/*		style={ { height: `350px`, marginTop: `1rem` } }*/}
			{/*	> /!*Tab Content*!/*/}
			{/*		{ keyboards[activeTab].UsageIds.map( ( key, index ) => (*/}
			{/*			<Keycode*/}
			{/*				key={ keyboards[activeTab].Id + "-" + index }*/}
			{/*				id={ key.UsageId }*/}
			{/*				label={ key.Label }*/}
			{/*				width={ key.w / 2 || 50 }*/}
			{/*				height={ key.h / 2 || 50 }*/}
			{/*				x={ key.x / 100 }*/}
			{/*				y={ key.y / 100 }*/}
			{/*				keyCode={ key }*/}
			{/*				onSelect={ ( data ) => {*/}
			{/*					console.log( data )*/}
			{/*				} }*/}
			{/*			/>*/}
			{/*		) ) }*/}
			{/*	</div>*/}
			{/*</div>*/}
		</>
	)
}
