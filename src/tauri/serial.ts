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
      await invoke("transport_send_data", { data: Array.from(chunk) });
    }
  });

  let { writable: response_writable, readable } = new TransformStream();

  /* const unlisten = */ await listen('connection_data', async (event: { payload: Array<number> }) => {
    console.log(event);
    let writer = response_writable.getWriter();
    await writer.write(new Uint8Array(event.payload));
    writer.releaseLock();
  })

  return { readable, writable };
}