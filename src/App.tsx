import './App.css'
import { AppHeader } from './AppHeader';

import { create_rpc_connection, RpcConnection } from "ts-zmk-rpc-core";
import { ConnectionContext } from './rpc/ConnectionContext';
import React, { useState } from 'react';
import { ConnectModal, TransportFactory } from './ConnectModal';

import type { RpcTransport } from "ts-zmk-rpc-core/transport/index";
import { connect as gatt_connect } from "ts-zmk-rpc-core/transport/gatt";
import { connect as serial_connect } from "ts-zmk-rpc-core/transport/serial";
import { connect as tauri_ble_connect, list_devices as ble_list_devices } from './tauri/ble';
import { connect as tauri_serial_connect, list_devices as serial_list_devices } from './tauri/serial';
import Keyboard from './keyboard/Keyboard';

declare global {
  interface Window { __TAURI_INTERNALS__?: object; }
}

const TRANSPORTS: TransportFactory[] = [
  navigator.bluetooth && { label: "BLE", connect: gatt_connect },
  navigator.serial && { label: "Serial", connect: serial_connect },
  ... window.__TAURI_INTERNALS__ ? [{ label: "BLE", pick_and_connect: {connect: tauri_ble_connect, list: ble_list_devices } }] : [],
  ... window.__TAURI_INTERNALS__ ? [{ label: "Serial", pick_and_connect: { connect: tauri_serial_connect, list: serial_list_devices }}] : [],
].filter((t) => t !== undefined);

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

async function connect(transport: RpcTransport, setConn: React.Dispatch<RpcConnection | null>) {
  let rpc_conn = await create_rpc_connection(transport);

  listen_for_notifications(rpc_conn.notification_readable).then(() => {
    setConn(null);
  });

  setConn(rpc_conn);
}

function App() {
  const [conn, setConn] = useState<RpcConnection | null>(null);

  return (
    <ConnectionContext.Provider value={conn}>
      <ConnectModal open={!conn} transports={TRANSPORTS} onTransportCreated={(t) => connect(t, setConn)} />
      <div className='zmk-app'>
        <AppHeader connectedDeviceLabel={conn?.label} />
        <Keyboard />
      </div>
    </ConnectionContext.Provider>
  )
}

export default App
