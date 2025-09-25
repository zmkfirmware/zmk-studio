import { call_rpc, Request, RequestResponse } from "@zmkfirmware/zmk-studio-ts-client"
import { toast } from "sonner"
import useConnectionStore from "@/stores/ConnectionStore.ts"
import { PhysicalLayout } from "@zmkfirmware/zmk-studio-ts-client/keymap"
import { GetBehaviorDetailsResponse } from "@zmkfirmware/zmk-studio-ts-client/behaviors"

export async function callRemoteProcedureControl (
    request: Omit<Request, "requestId">
): Promise<RequestResponse> {
    const { connection } = useConnectionStore()

    if ( !connection ){
        toast.error('Connection not found')
        return
    }
    // console.trace('RPC Request', conn, req);
    console.log( connection, request )

    return call_rpc( connection, request )
        .then( ( r ) => {
            // console.log('RPC Response', r);
            return r
        } )
        .catch( ( e ) => {
            // console.log('RPC Error', e);
            return e
        } )
}

export async function getKeymapLayout (
    layoutIndex: number,
    layouts: PhysicalLayout[]
): Promise<void> {
    if ( !layouts ) return

    const resp = await callRemoteProcedureControl({
        keymap: { setActivePhysicalLayout: layoutIndex }
    })

    const new_keymap = resp?.keymap?.setActivePhysicalLayout?.ok
    if ( new_keymap ) {
        console.log( "New keymap received from physical layout change" )
    } else {
        console.error( "Failed to set the active physical layout err:", resp?.keymap?.setActivePhysicalLayout?.err )
    }
}

export async function getBehaviors (): Promise<RequestResponse> {

    const behaviorsRequest: Request = {
        behaviors: { listAllBehaviors: true },
        requestId: 0,
    };

    return  await callRemoteProcedureControl( behaviorsRequest);
}

export async function getBehavior (behavior: number): Promise<GetBehaviorDetailsResponse> {

    const details_req = {
        behaviors: { getBehaviorDetails: { behaviorId: behavior } },
        requestId: 0,
    };
    const behaviorDetailsResponse = await callRemoteProcedureControl(
        details_req
    );
    return behaviorDetailsResponse?.behaviors?.getBehaviorDetails
}