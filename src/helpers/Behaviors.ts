import { useEffect, useState } from "react"
import { LockState } from "@zmkfirmware/zmk-studio-ts-client/core"
import type { GetBehaviorDetailsResponse } from "@zmkfirmware/zmk-studio-ts-client/behaviors"
import useConnectionStore from "../stores/ConnectionStore.ts"
import { callRemoteProcedureControl } from "@/services/CallRemoteProcedureControl.ts"

export type BehaviorMap = Record<number, GetBehaviorDetailsResponse>;

export function useBehaviors (): BehaviorMap {
	const { connection, lockState } = useConnectionStore()
	const [ behaviors, setBehaviors ] = useState<BehaviorMap>( {} )

	useEffect( () => {
		// Only fetch if connection exists and device is unlocked.
		if ( !connection || lockState !== LockState.ZMK_STUDIO_CORE_LOCK_STATE_UNLOCKED ) {
			setBehaviors( {} )
			return
		}

		let isCancelled = false

		const fetchBehaviors = async () => {
			// Reset behaviors before fetching new data.
			setBehaviors( {} )

			try {
				console.log( "Fetching behaviors with connection:", connection, "lockState:", lockState )

				const listRequest = {
					behaviors: { listAllBehaviors: true },
					requestId: 0
				}

				const behaviorListResponse = await callRemoteProcedureControl( listRequest )
				if ( isCancelled ) return

				const behaviorMap: BehaviorMap = {}
				const behaviorIds = behaviorListResponse?.behaviors?.listAllBehaviors?.behaviors || []

				for ( const behaviorId of behaviorIds ) {
					if ( isCancelled ) break

					const detailsRequest = {
						behaviors: { getBehaviorDetails: { behaviorId } },
						requestId: 0
					}

					const detailsResponse = await callRemoteProcedureControl( detailsRequest )
					const details: GetBehaviorDetailsResponse | undefined =
						detailsResponse?.behaviors?.getBehaviorDetails

					if ( details ) {
						behaviorMap[details.id] = details
					}
				}

				if ( !isCancelled ) {
					setBehaviors( behaviorMap )
				}
			} catch ( error ) {
				if ( !isCancelled ) {
					console.error( "Error fetching behaviors:", error )
					setBehaviors( {} )
				}
			}
		}

		fetchBehaviors()

		return () => {
			isCancelled = true
		}
	}, [ connection, lockState ] )

	return behaviors
}
