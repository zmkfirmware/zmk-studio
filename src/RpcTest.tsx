
import { useState, Dispatch } from 'react';
 
import { create_rpc_connection, RpcConnection } from "ts-zmk-rpc-core";

import type { RpcTransport } from "ts-zmk-rpc-core/transport/index";
import type { Notification } from "ts-zmk-rpc-core/transport/core";
import { connect as gatt_connect } from "ts-zmk-rpc-core/transport/gatt";
import { connect as serial_connect } from "ts-zmk-rpc-core/transport/serial";
import type { AvailableDevice } from './tauri/index';
import { connect as tauri_ble_connect, list_devices as ble_list_devices } from './tauri/ble';
import { connect as tauri_serial_connect, list_devices as serial_list_devices } from './tauri/serial';

import { ConnectionContext } from './rpc/ConnectionContext';
import Keyboard from './keyboard/Keyboard';

type TransportFactory = { label: string, connect?: () => Promise<RpcTransport>, pick_and_connect?: { list: () => Promise<Array<AvailableDevice>>, connect: (dev: AvailableDevice) => Promise<RpcTransport>  }};

declare global {
  interface Window { __TAURI_INTERNALS__?: object; }
}

const TRANSPORTS: TransportFactory[] = [
  navigator.bluetooth && { label: "BLE", connect: gatt_connect },
  navigator.serial && { label: "Serial", connect: serial_connect },
  ... window.__TAURI_INTERNALS__ ? [{ label: "BLE", pick_and_connect: {connect: tauri_ble_connect, list: ble_list_devices } }] : [],
  ... window.__TAURI_INTERNALS__ ? [{ label: "Serial", pick_and_connect: { connect: tauri_serial_connect, list: serial_list_devices }}] : [],
];

async function listen_for_notifications(notification_stream: ReadableStream<Notification>): Promise<void> {
  let reader = notification_stream.getReader();
  do {
    try {
      let { done, value } = await reader.read();
      if (done) {
        break;
      }

      // TODO: Do something with the notifications 
      console.log("Notification", value);
    } catch (e) {
      reader.releaseLock();
      throw e;
    }
  } while (true)

  reader.releaseLock();
}

async function connect_via_factory(factory: TransportFactory, setConn: Dispatch<RpcConnection | null>) {
  let transport = null;
  if (factory.connect) {
    transport = await factory.connect();
  } else if (factory.pick_and_connect) {
    let devices = await factory.pick_and_connect.list();
    console.log(devices);
    transport = await factory.pick_and_connect.connect(devices[devices.length - 1]);
  }

  if (!transport) {
    return;
  }
  
  let rpc_conn = await create_rpc_connection(transport);

  listen_for_notifications(rpc_conn.notification_readable).then(() => {
    setConn(null);
  });

  setConn(rpc_conn);
}

export default function RpcTest() {
  const [conn, setConn] = useState<RpcConnection | null>(null);


  let connections = TRANSPORTS.filter((t) => t !== undefined).map((t) => <button key={t.label} onClick={() => connect_via_factory(t, setConn)}>{t.label}</button>);

  return (
    <div>
      <div>{!conn && connections}</div>
      <ConnectionContext.Provider value={conn}>
        <Keyboard />
      </ConnectionContext.Provider>
    </div>
  )
}
