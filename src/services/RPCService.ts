import type { Notification } from '@zmkfirmware/zmk-studio-ts-client/studio'
// import { usePub } from '../helpers/usePubSub.ts'
import { Dispatch } from 'react'
import {
    create_rpc_connection as createRpcConnection,
    RpcConnection,
} from '@zmkfirmware/zmk-studio-ts-client'
import { callRemoteProcedureControl } from '../rpc/logging.ts'
import { valueAfter } from '../helpers/async.ts'
import { RpcTransport } from '@zmkfirmware/zmk-studio-ts-client/transport/index'

export async function listenForNotifications(
    notification_stream: ReadableStream<Notification>,
    signal: AbortSignal,
    callback?: (notification: Notification) => void
): Promise<void> {
    const reader = notification_stream.getReader()
    const onAbort = () => {
        reader.cancel()
        reader.releaseLock()
    }
    signal.addEventListener('abort', onAbort, { once: true })
    // do {
    // const pub = usePub()

    // try {
    //     const { done, value } = await reader.read()
    //     if (done || !value) return
    //     console.log('done value', done, value)
    //     console.log('Notification', value)
    //     pub('rpc_notification', value)
    //
    //     const subsystem = Object.entries(value).find(
    //         ([_k, v]) => v !== undefined,
    //     )
    //     if (!subsystem) return
    //
    //     const [subId, subData] = subsystem
    //     const event = Object.entries(subData).find(([_k, v]) => v !== undefined)
    //
    //     if (!event) return
    //
    //     const [eventName, eventData] = event
    //     const topic = ['rpc_notification', subId, eventName].join('.')
    //     console.log(topic)
    //     pub(topic, eventData)
    //
    // } catch (e) {
    //     console.log(e)
    //     signal.removeEventListener('abort', onAbort)
    //     reader.releaseLock()
    //     throw e
    // }
    // } while (true);
    // signal.removeEventListener('abort', onAbort)
    // reader.releaseLock()
    // notification_stream.cancel()

    let result: any;
    while (!(result = await reader.read()).done) {
        callback?.(result.value)
    }
}

export async function connect(
    transport: RpcTransport,
    setConnection: Dispatch<RpcConnection | null>,
    setConnectedDeviceName: Dispatch<string | undefined>,
    signal: AbortSignal,
) {
    const conn = await createRpcConnection(transport, { signal })
    console.log('Connect function', conn)
    const details = await Promise.race([
        callRemoteProcedureControl(conn, { core: { getDeviceInfo: true } })
            .then((r) => r?.core?.getDeviceInfo)
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
    setConnection(conn)
}
