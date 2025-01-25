import type { Notification } from '@zmkfirmware/zmk-studio-ts-client/studio';
import { usePub } from '../helpers/usePubSub.ts';
import { Dispatch } from 'react';
import { ConnectionState } from '../rpc/ConnectionContext.ts';
import { create_rpc_connection } from '@zmkfirmware/zmk-studio-ts-client';
import { callRemoteProcedureControl } from '../rpc/logging.ts';
import { valueAfter } from '../helpers/async.ts';
import { RpcTransport } from '@zmkfirmware/zmk-studio-ts-client/transport/index';
import useConnectionStore from '../stores/ConnectionStore.ts';

export async function listenForNotifications(
    notification_stream: ReadableStream<Notification>,
    signal: AbortSignal,
): Promise<void> {
    const reader = notification_stream.getReader();
    const onAbort = () => {
        reader.cancel();
        reader.releaseLock();
    };
    signal.addEventListener('abort', onAbort, { once: true });
    // do {
    const pub = usePub();

    try {
        const { done, value } = await reader.read();
        if (done) return;

        if (!value) return;

        console.log('Notification', value);
        pub('rpc_notification', value);

        const subsystem = Object.entries(value).find(
            ([_k, v]) => v !== undefined,
        );
        if (!subsystem) return;

        const [subId, subData] = subsystem;
        const event = Object.entries(subData).find(
            ([_k, v]) => v !== undefined,
        );

        if (!event) return;

        const [eventName, eventData] = event;
        const topic = ['rpc_notification', subId, eventName].join('.');

        pub(topic, eventData);
    } catch (e) {
        signal.removeEventListener('abort', onAbort);
        reader.releaseLock();
        throw e;
    }
    // } while (true);

    signal.removeEventListener('abort', onAbort);
    reader.releaseLock();
    notification_stream.cancel();
}

export async function connect(
    transport: RpcTransport,
    setConnectedDeviceName: Dispatch<string | undefined>,
    signal: AbortSignal,
) {
    const conn = await create_rpc_connection(transport, { signal });
    const { setConnection } = useConnectionStore.getState();

    const details = await Promise.race([
        callRemoteProcedureControl(conn, { core: { getDeviceInfo: true } })
            .then((r) => r?.core?.getDeviceInfo)
            .catch((e) => {
                console.error('Failed first RPC call', e);
                return undefined;
            }),
        valueAfter(undefined, 1000),
    ]);

    if (!details) {
        // TODO: Show a proper toast/alert not using `window.alert`
        window.alert('Failed to connect to the chosen device');
        return;
    }

    listenForNotifications(conn.notification_readable, signal)
        .then(() => {
            setConnectedDeviceName(undefined);
            setConnection(null);
        })
        .catch(() => {
            setConnectedDeviceName(undefined);
            setConnection(null);
        });

    setConnectedDeviceName(details.name);
    console.log(conn);
    setConnection(conn);
}
