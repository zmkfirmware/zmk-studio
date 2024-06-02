import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';

import type { RpcTransport } from "ts-zmk-rpc-core/transport/index";
import { AvailableDevice } from '.';

export async function list_devices(): Promise<Array<AvailableDevice>> {
  return await invoke("serial_list_devices");
}

export async function connect(dev: AvailableDevice): Promise<RpcTransport> {
  if (!await invoke("serial_connect", dev)) {
    throw new Error("Failed to connect");
  }

  let writable = new WritableStream({
    async write(chunk, _controller) {
      await invoke("transport_send_data", new Uint8Array(chunk));
    }
  });

  let { writable: response_writable, readable } = new TransformStream();

  console.log(response_writable);
  console.log(readable);

  const unlisten_data = await listen('connection_data', async (event: { payload: Array<number> }) => {
    let writer = response_writable.getWriter();
    await writer.write(new Uint8Array(event.payload));
    writer.releaseLock();
  });

  const unlisten_disconnected = await listen('connection_disconnected', async (event: any) => {
    unlisten_data();
    unlisten_disconnected();
    response_writable.close();
  });

  return { label: dev.label, readable, writable };
}