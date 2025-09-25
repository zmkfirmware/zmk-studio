import type { Notification } from "@zmkfirmware/zmk-studio-ts-client/studio"
// import { usePub } from '../helpers/usePubSub.ts'
import React, { Dispatch, SetStateAction, useEffect, useState } from "react"
import {
    call_rpc,
    create_rpc_connection as createRpcConnection,
    Request,
    RequestResponse,
    RpcConnection
} from "@zmkfirmware/zmk-studio-ts-client"
import { valueAfter } from "../helpers/async.ts"
import { RpcTransport } from "@zmkfirmware/zmk-studio-ts-client/transport/index"
import { usePub } from "../helpers/usePubSub.ts"
import { toast } from "sonner"
import useConnectionStore from "@/stores/ConnectionStore.ts"
import { LockState } from "@zmkfirmware/zmk-studio-ts-client/core"

// export async function listenForNotifications(
//     notification_stream: ReadableStream<Notification>,
//     signal: AbortSignal,
//     callback?: (notification: Notification) => void
// ): Promise<void> {
//     const reader = notification_stream.getReader()
//     const onAbort = () => {
//         reader.cancel()
//         reader.releaseLock()
//     }
//     signal.addEventListener('abort', onAbort, { once: true })
//     do {
//     const pub = usePub()
//
//     try {
//         const { done, value } = await reader.read()
//         if (done || !value) return
//         console.log('done value', done, value)
//         console.log('Notification', value)
//         pub('rpc_notification', value)
//
//         const subsystem = Object.entries(value).find(
//             ([_k, v]) => v !== undefined,
//         )
//         if (!subsystem) return
//
//         const [subId, subData] = subsystem
//         const event = Object.entries(subData).find(([_k, v]) => v !== undefined)
//
//         if (!event) return
//
//         const [eventName, eventData] = event
//         const topic = ['rpc_notification', subId, eventName].join('.')
//         console.log(topic)
//         pub(topic, eventData)
//
//     } catch (e) {
//         console.log(e)
//         signal.removeEventListener('abort', onAbort)
//         reader.releaseLock()
//         toast.error(e.message)
//         throw e
//     }
//     } while (true);
//     // signal.removeEventListener('abort', onAbort)
//     // reader.releaseLock()
//     // notification_stream.cancel()
//
//     let result: any;
//     while (!(result = await reader.read()).done) {
//         callback?.(result.value)
//     }
// }

async function listenForNotifications(
    notification_stream: ReadableStream<Notification>,
    signal: AbortSignal,
    callback?: (notification: Notification) => void
): Promise<void> {
    let reader = notification_stream.getReader();
    const onAbort = () => {
        reader.cancel();
        reader.releaseLock();
    };
    signal.addEventListener("abort", onAbort, { once: true });
    do {
        let pub = usePub();

        try {
            let { done, value } = await reader.read();
            if (done) {
                break;
            }

            if (!value) {
                continue;
            }

            console.log("Notification", value);
            pub("rpc_notification", value);

            const subsystem = Object.entries(value).find(
                ([_k, v]) => v !== undefined
            );
            if (!subsystem) {
                continue;
            }

            const [subId, subData] = subsystem;
            const event = Object.entries(subData).find(([_k, v]) => v !== undefined);

            if (!event) {
                continue;
            }

            const [eventName, eventData] = event;
            const topic = ["rpc_notification", subId, eventName].join(".");

            pub(topic, eventData);
        } catch (e) {
            signal.removeEventListener("abort", onAbort);
            reader.releaseLock();
            throw e;
        }
    } while (true);

    signal.removeEventListener("abort", onAbort);
    reader.releaseLock();
    notification_stream.cancel();
}


export async function callRemoteProcedureControl (
    conn: RpcConnection,
    req: Omit<Request, "requestId">
): Promise<RequestResponse> {
    // console.trace('RPC Request', conn, req);
    // console.log( conn, req )
    return call_rpc( conn, req )
        .then( ( r ) => {
            // console.log('RPC Response', r);
            return r
        } )
        .catch( ( e ) => {
            // console.log('RPC Error', e);
            return e
        } )
}

export async function connect(
    transport: RpcTransport,
    setConnection: any,
    setConnectedDeviceName: Dispatch<string | undefined>,
    signal: AbortSignal,
    communication: 'serial' | 'ble',
) {
    const conn = await createRpcConnection(transport, { signal })
    console.log('Connect function', conn)
    const details = await Promise.race([
        callRemoteProcedureControl(conn, { core: { getDeviceInfo: true } })
            .then( function ( response ) {
                console.log(response)
                return response?.core?.getDeviceInfo
            })
            .catch((e) => {
                console.error('Failed first RPC call', e)
                return undefined
            }),
        valueAfter(undefined, 1000),
    ])

    if (!details) {
        return 'Failed to connect to the chosen device'
    }

    listenForNotifications(conn.notification_readable, signal, (value) => {
        console.log('callback', value)
    })
        .then(() => {
            // setConnectedDeviceName(undefined)
            console.log('then test')
            // setConnection(null)
        })
        .catch((e) => {
            setConnectedDeviceName(undefined)
            console.log('connection lost', e)
            setConnection(null)
        })

    setConnectedDeviceName(details.name)
    setConnection(conn, communication)
}

export function useConnectedDeviceData<T> (
    req: Omit<Request, "requestId">,
    response_mapper: ( resp: RequestResponse ) => T | undefined,
    requireUnlock?: boolean
): [ T | undefined, React.Dispatch<SetStateAction<T | undefined>> ] {
    const { connection, lockState } = useConnectionStore()
    let [ data, setData ] = useState<T | undefined>( undefined )

    useEffect(
        () => {
            if (
                !connection ||
                (requireUnlock &&
                    lockState != LockState.ZMK_STUDIO_CORE_LOCK_STATE_UNLOCKED)
            ) {
                setData( undefined )
                return
            }
            console.log(req,response_mapper)

            async function startRequest () {
                setData( undefined )
                if ( !connection ) {
                    return
                }

                let response = response_mapper( await callRemoteProcedureControl( connection, req ) )
                console.log(response)
                if ( !ignore ) {
                    setData( response )
                }
            }

            let ignore = false
            startRequest()

            return () => {
                ignore = true
            }
        },
        requireUnlock
            ? [ connection, requireUnlock, lockState ]
            : [ connection, requireUnlock ]
    )

    return [ data, setData ]
}