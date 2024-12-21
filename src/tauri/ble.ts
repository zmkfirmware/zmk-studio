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

  const abortController = new AbortController();

  const writable = new WritableStream({
    async write(chunk, _) {
      await invoke("transport_send_data", new Uint8Array(chunk));
    },
  });

  const { writable: response_writable, readable } = new TransformStream();

  const unlisten_data = await listen(
    "connection_data",
    async (event: { payload: Array<number> }) => {
      const writer = response_writable.getWriter();
      await writer.write(new Uint8Array(event.payload));
      writer.releaseLock();
    },
  );

  const unlisten_disconnected = await listen(
    "connection_disconnected",
    async (_: unknown) => {
      unlisten_data();
      unlisten_disconnected();
      response_writable.close();
    },
  );

  const signal = abortController.signal;

  const abort_cb = async (_: unknown) => {
    unlisten_data();
    unlisten_disconnected();
    await invoke("transport_close");
    signal.removeEventListener("abort", abort_cb);
  };

  signal.addEventListener("abort", abort_cb);

  return { label: dev.label, abortController, readable, writable };
}
