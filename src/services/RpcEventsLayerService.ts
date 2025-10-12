import { toast } from "sonner"
import {
	Layer,
	SetLayerPropsResponse
} from "@zmkfirmware/zmk-studio-ts-client/keymap"
import { produce } from "immer"
import { callRemoteProcedureControl } from "./CallRemoteProcedureControl"

export async function addLayer (
	keymap,
	setKeymap,
	setSelectedLayerIndex
): Promise<number> {
	if ( !keymap ) throw new Error( "Not connected" )

	const resp = await callRemoteProcedureControl( {
		keymap: { addLayer: {} }
	} )

	if ( !resp.keymap?.addLayer?.ok ) {
		console.error( "Add error", resp.keymap?.addLayer?.err )
		throw new Error( "Failed to add layer:" + resp.keymap?.addLayer?.err )
	}
	const newSelection = keymap.layers.length
	console.log(
		"Adding new layer, setting selectedLayerIndex to:",
		newSelection
	)
	setKeymap(
		produce( ( draft: any ) => {
			draft.layers.push( resp.keymap!.addLayer!.ok!.layer )
			draft.availableLayers--
		} )
	)

	setSelectedLayerIndex( newSelection )
	console.log( "setSelectedLayerIndex called with:", newSelection )

	return resp.keymap.addLayer.ok.index
}

export async function changeName ( layerId: number, name: string, setKeymap ) {
	const resp = await callRemoteProcedureControl( {
		keymap: { setLayerProps: { layerId, name } }
	} )

	if (
		resp.keymap?.setLayerProps !=
		SetLayerPropsResponse.SET_LAYER_PROPS_RESP_OK
	) {
		throw new Error(
			"Failed to change layer name:" + resp.keymap?.setLayerProps
		)
	}

	setKeymap(
		produce( ( draft: any ) => {
			const layer_index = draft.layers.findIndex(
				( l: Layer ) => l.id == layerId
			)
			draft.layers[layer_index].name = name
		} )
	)
}

export async function removeLayer ( layerIndex: number, setKeymap ) {
	const resp = await callRemoteProcedureControl( {
		keymap: { removeLayer: { layerIndex } }
	} )

	if ( !resp.keymap?.removeLayer?.ok ) {
		console.error( "Remove error", resp.keymap?.removeLayer?.err )
		throw new Error(
			"Failed to remove layer:" + resp.keymap?.removeLayer?.err
		)
	}

	setKeymap(
		produce( ( draft: any ) => {
			draft.layers.splice( layerIndex, 1 )
			draft.availableLayers++
		} )
	)
}

export async function restore (
	layerId: number,
	atIndex: number,
	setKeymap,
	setSelectedLayerIndex
) {
	const resp = await callRemoteProcedureControl( {
		keymap: { restoreLayer: { layerId, atIndex } }
	} )

	console.log( resp )
	if ( !resp.keymap?.restoreLayer?.ok ) {
		console.error( "Remove error", resp.keymap?.restoreLayer?.err )
		toast.error( "Failed to restore layer:" + resp.keymap?.restoreLayer?.err )
	}

	setKeymap(
		produce( ( draft: any ) => {
			draft.layers.splice( atIndex, 0, resp!.keymap!.restoreLayer!.ok )
			draft.availableLayers--
		} )
	)
	console.log( atIndex )
	setSelectedLayerIndex( atIndex )
}
