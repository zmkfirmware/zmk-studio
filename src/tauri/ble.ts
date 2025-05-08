import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

import type { RpcTransport } from "@zmkfirmware/zmk-studio-ts-client/transport/index";
import { AvailableDevice } from ".";

export async function list_devices(): Promise<Array<AvailableDevice>> {
  return await invoke("gatt_list_devices");
}

export async function connect(dev: AvailableDevice): Promise<RpcTransport> {
  if (!(await invoke("gatt_connect", dev))) {
    throw new Error("Failed to connect");
  }

  let abortController = new AbortController();

  let writable = new WritableStream({
    async write(chunk, _controller) {
      await invoke("transport_send_data", new Uint8Array(chunk));
    },
  });

  let { writable: response_writable, readable } = new TransformStream();

  const unlisten_data = await listen(
    "connection_data",
    async (event: { payload: Array<number> }) => {
      let writer = response_writable.getWriter();
      await writer.write(new Uint8Array(event.payload));
      writer.releaseLock();
    }
  );

  const unlisten_disconnected = await listen(
    "connection_disconnected",
    async (_ev: any) => {
      unlisten_data();
      unlisten_disconnected();
      response_writable.close();
    }
  );

  let signal = abortController.signal;

  let abort_cb = async (_reason: any) => {
    unlisten_data();
    unlisten_disconnected();
    await invoke("transport_close");
    signal.removeEventListener("abort", abort_cb);
  };

  signal.addEventListener("abort", abort_cb);

  return { label: dev.label, abortController, readable, writable };
}
