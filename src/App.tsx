import { AppHeader } from "./AppHeader";

import { create_rpc_connection } from "@zmkfirmware/zmk-studio-ts-client";
import { call_rpc } from "./rpc/logging";

import type { Notification } from "@zmkfirmware/zmk-studio-ts-client/studio";
import { ConnectionState, ConnectionContext } from "./rpc/ConnectionContext";
import { Dispatch, useCallback, useEffect, useRef, useState } from "react";
import { parseKeymapFile } from "./keymap-parser";
import { ConnectModal, TransportFactory } from "./ConnectModal";

import type { RpcTransport } from "@zmkfirmware/zmk-studio-ts-client/transport/index";
import { connect as gatt_connect } from "@zmkfirmware/zmk-studio-ts-client/transport/gatt";
import { connect as serial_connect } from "@zmkfirmware/zmk-studio-ts-client/transport/serial";
import {
  connect as tauri_ble_connect,
  list_devices as ble_list_devices,
} from "./tauri/ble";
import {
  connect as tauri_serial_connect,
  list_devices as serial_list_devices,
} from "./tauri/serial";
import Keyboard from "./keyboard/Keyboard";
import { UndoRedoContext, useUndoRedo } from "./undoRedo";
import { usePub, useSub } from "./usePubSub";
import { LockState } from "@zmkfirmware/zmk-studio-ts-client/core";
import { LockStateContext } from "./rpc/LockStateContext";
import { UnlockModal } from "./UnlockModal";
import { valueAfter } from "./misc/async";
import { AppFooter } from "./AppFooter";
import { AboutModal } from "./AboutModal";
import { LicenseNoticeModal } from "./misc/LicenseNoticeModal";

declare global {
  interface Window {
    __TAURI_INTERNALS__?: object;
  }
}

const TRANSPORTS: TransportFactory[] = [
  navigator.serial && { label: "USB", connect: serial_connect },
  ...(navigator.bluetooth && navigator.userAgent.indexOf("Linux") >= 0
    ? [{ label: "BLE", connect: gatt_connect }]
    : []),
  ...(window.__TAURI_INTERNALS__
    ? [
        {
          label: "BLE",
          isWireless: true,
          pick_and_connect: {
            connect: tauri_ble_connect,
            list: ble_list_devices,
          },
        },
      ]
    : []),
  ...(window.__TAURI_INTERNALS__
    ? [
        {
          label: "USB",
          pick_and_connect: {
            connect: tauri_serial_connect,
            list: serial_list_devices,
          },
        },
      ]
    : []),
].filter((t) => t !== undefined);

async function listen_for_notifications(
  notification_stream: ReadableStream<Notification>,
  signal: AbortSignal
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

async function connect(
  transport: RpcTransport,
  setConn: Dispatch<ConnectionState>,
  setConnectedDeviceName: Dispatch<string | undefined>,
  signal: AbortSignal
) {
  let conn = await create_rpc_connection(transport, { signal });

  let details = await Promise.race([
    call_rpc(conn, { core: { getDeviceInfo: true } })
      .then((r) => r?.core?.getDeviceInfo)
      .catch((e) => {
        console.error("Failed first RPC call", e);
        return undefined;
      }),
    valueAfter(undefined, 1000),
  ]);

  if (!details) {
    // TODO: Show a proper toast/alert not using `window.alert`
    window.alert("Failed to connect to the chosen device");
    return;
  }

  listen_for_notifications(conn.notification_readable, signal)
    .then(() => {
      setConnectedDeviceName(undefined);
      setConn({ conn: null });
    })
    .catch((_e) => {
      setConnectedDeviceName(undefined);
      setConn({ conn: null });
    });

  setConnectedDeviceName(details.name);
  setConn({ conn });
}

function App() {
  const [conn, setConn] = useState<ConnectionState>({ conn: null });
  const [connectedDeviceName, setConnectedDeviceName] = useState<
    string | undefined
  >(undefined);
  const [doIt, undo, redo, canUndo, canRedo, reset] = useUndoRedo();
  const [showAbout, setShowAbout] = useState(false);
  const [showLicenseNotice, setShowLicenseNotice] = useState(false);
  const [connectionAbort, setConnectionAbort] = useState(new AbortController());

  const [lockState, setLockState] = useState<LockState>(
    LockState.ZMK_STUDIO_CORE_LOCK_STATE_LOCKED
  );

  useSub("rpc_notification.core.lockStateChanged", (ls) => {
    setLockState(ls);
  });

  useEffect(() => {
    if (!conn) {
      reset();
      setLockState(LockState.ZMK_STUDIO_CORE_LOCK_STATE_LOCKED);
    }

    async function updateLockState() {
      if (!conn.conn) {
        return;
      }

      let locked_resp = await call_rpc(conn.conn, {
        core: { getLockState: true },
      });

      setLockState(
        locked_resp.core?.getLockState ||
          LockState.ZMK_STUDIO_CORE_LOCK_STATE_LOCKED
      );
    }

    updateLockState();
  }, [conn, setLockState]);

  const save = useCallback(() => {
    async function doSave() {
      if (!conn.conn) {
        return;
      }

      let resp = await call_rpc(conn.conn, { keymap: { saveChanges: true } });
      if (!resp.keymap?.saveChanges || resp.keymap?.saveChanges.err) {
        console.error("Failed to save changes", resp.keymap?.saveChanges);
      }
    }

    doSave();
  }, [conn]);

  const discard = useCallback(() => {
    async function doDiscard() {
      if (!conn.conn) {
        return;
      }

      let resp = await call_rpc(conn.conn, {
        keymap: { discardChanges: true },
      });
      if (!resp.keymap?.discardChanges) {
        console.error("Failed to discard changes", resp);
      }

      reset();
      setConn({ conn: conn.conn });
    }

    doDiscard();
  }, [conn]);

  const resetSettings = useCallback(() => {
    async function doReset() {
      if (!conn.conn) {
        return;
      }

      let resp = await call_rpc(conn.conn, {
        core: { resetSettings: true },
      });
      if (!resp.core?.resetSettings) {
        console.error("Failed to settings reset", resp);
      }

      reset();
      setConn({ conn: conn.conn });
    }

    doReset();
  }, [conn]);

  const disconnect = useCallback(() => {
    async function doDisconnect() {
      if (!conn.conn) {
        return;
      }

      await conn.conn.request_writable.close();
      connectionAbort.abort("User disconnected");
      setConnectionAbort(new AbortController());
    }

    doDisconnect();
  }, [conn]);

  const exportKeymap = useCallback(() => {
    async function doExport() {
      if (!conn.conn) {
        return;
      }

      let keymapResp = await call_rpc(conn.conn, { keymap: { getKeymap: true } });
      let keymap = keymapResp?.keymap?.getKeymap;
      if (!keymap) {
        console.error("Failed to fetch keymap for export", keymapResp);
        return;
      }

      let behaviorList = await call_rpc(conn.conn, { behaviors: { listAllBehaviors: true } });
      let behaviorIds = behaviorList?.behaviors?.listAllBehaviors?.behaviors || [];

      const behaviors: Record<number, string> = {};
      for (const id of behaviorIds) {
        let details = await call_rpc(conn.conn, { behaviors: { getBehaviorDetails: { behaviorId: id } } });
        let d = details?.behaviors?.getBehaviorDetails;
        if (d) {
          behaviors[d.id] = d.displayName;
        }
      }

      let content = `#include <behaviors.dtsi>\n#include <dt-bindings/zmk/keys.h>\n\n/ {\n  keymap {\n    compatible = "zmk,keymap";\n\n`;

      for (const layer of keymap.layers) {
        const layerName = layer.name?.replace(/[^a-zA-Z0-9_]/g, "_") || `layer_${layer.id}`;
        content += `    ${layerName} {\n      bindings = <\n`;
        const bindingStrs = layer.bindings.map((b: { behaviorId: number; param1: number; param2: number }) => {
          const name = behaviors[b.behaviorId] || `&unknown_${b.behaviorId}`;
          const base = name.replace(/^&/, "");
          const parts = [`&${base}`];
          if (b.param1 !== 0) parts.push(String(b.param1));
          if (b.param2 !== 0) parts.push(String(b.param2));
          return parts.join(" ");
        });
        // Pad all bindings to the same width for column alignment
        const maxLen = Math.max(...bindingStrs.map((s: string) => s.length));
        const padded = bindingStrs.map((s: string) => s.padEnd(maxLen));
        content += padded.map((s: string) => `        ${s}`).join("\n") + "\n";
        content += `      >;\n    };\n\n`;
      }

      content += `  };\n};\n`;

      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${connectedDeviceName || "zmk"}.keymap`;
      a.click();
      URL.revokeObjectURL(url);
    }

    doExport();
  }, [conn, connectedDeviceName]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const importKeymap = useCallback(() => {
    if (!conn.conn) return;
    fileInputRef.current?.click();
  }, [conn]);

  const handleFileImport = useCallback(() => {
    async function doImport(file: File) {
      if (!conn.conn) return;

      const text = await file.text();
      const parsedLayers = parseKeymapFile(text);
      if (parsedLayers.length === 0) {
        console.error("No layers found in imported keymap");
        return;
      }

      // Fetch current keymap to get layer IDs
      let keymapResp = await call_rpc(conn.conn, { keymap: { getKeymap: true } });
      let keymap = keymapResp?.keymap?.getKeymap;
      if (!keymap) {
        console.error("Failed to fetch current keymap", keymapResp);
        return;
      }

      // Fetch behavior list to map names to IDs
      let behaviorList = await call_rpc(conn.conn, { behaviors: { listAllBehaviors: true } });
      let behaviorIds = behaviorList?.behaviors?.listAllBehaviors?.behaviors || [];

      const behaviorNameToId: Record<string, number> = {};
      for (const id of behaviorIds) {
        let details = await call_rpc(conn.conn, { behaviors: { getBehaviorDetails: { behaviorId: id } } });
        let d = details?.behaviors?.getBehaviorDetails;
        if (d) {
          const name = d.displayName.replace(/^&/, "");
          behaviorNameToId[name.toLowerCase()] = d.id;
          behaviorNameToId[d.displayName.toLowerCase()] = d.id;
        }
      }

      // Apply each parsed layer's bindings
      for (let li = 0; li < parsedLayers.length && li < keymap.layers.length; li++) {
        const parsedLayer = parsedLayers[li];
        const targetLayer = keymap.layers[li];

        for (let ki = 0; ki < parsedLayer.bindings.length && ki < targetLayer.bindings.length; ki++) {
          const parsedBinding = parsedLayer.bindings[ki];
          const behaviorName = parsedBinding.behavior.toLowerCase();

          // Handle special behaviors
          if (behaviorName === "trans" || behaviorName === "transparent") {
            continue; // Skip transparent, keep existing
          }
          if (behaviorName === "none") {
            continue; // Skip none, keep existing
          }

          const behaviorId = behaviorNameToId[behaviorName];
          if (behaviorId === undefined) {
            console.warn(`Unknown behavior: &${parsedBinding.behavior}, skipping`);
            continue;
          }

          const param1 = parsedBinding.params[0] || 0;
          const param2 = parsedBinding.params[1] || 0;

          await call_rpc(conn.conn, {
            keymap: { setLayerBinding: { layerId: targetLayer.id, keyPosition: ki, binding: { behaviorId, param1, param2 } } },
          });
        }
      }

      // Refresh the keymap state
      setConn({ conn: conn.conn });
    }

    const file = fileInputRef.current?.files?.[0];
    if (file) {
      doImport(file);
      // Reset input so same file can be re-imported
      fileInputRef.current!.value = "";
    }
  }, [conn]);

  const onConnect = useCallback(
    (t: RpcTransport) => {
      const ac = new AbortController();
      setConnectionAbort(ac);
      connect(t, setConn, setConnectedDeviceName, ac.signal);
    },
    [setConn, setConnectedDeviceName, setConnectedDeviceName]
  );

  return (
    <ConnectionContext.Provider value={conn}>
      <LockStateContext.Provider value={lockState}>
        <UndoRedoContext.Provider value={doIt}>
          <input
            ref={fileInputRef}
            type="file"
            accept=".keymap"
            className="hidden"
            onChange={handleFileImport}
          />
          <UnlockModal />
          <ConnectModal
            open={!conn.conn}
            transports={TRANSPORTS}
            onTransportCreated={onConnect}
          />
          <AboutModal open={showAbout} onClose={() => setShowAbout(false)} />
          <LicenseNoticeModal
            open={showLicenseNotice}
            onClose={() => setShowLicenseNotice(false)}
          />
          <div className="bg-base-100 text-base-content h-full max-h-[100vh] w-full max-w-[100vw] inline-grid grid-cols-[auto] grid-rows-[auto_1fr_auto] overflow-hidden">
            <AppHeader
              connectedDeviceLabel={connectedDeviceName}
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={undo}
              onRedo={redo}
              onSave={save}
              onDiscard={discard}
              onDisconnect={disconnect}
              onResetSettings={resetSettings}
              onExportKeymap={exportKeymap}
              onImportKeymap={importKeymap}
            />
            <Keyboard />
            <AppFooter
              onShowAbout={() => setShowAbout(true)}
              onShowLicenseNotice={() => setShowLicenseNotice(true)}
            />
          </div>
        </UndoRedoContext.Provider>
      </LockStateContext.Provider>
    </ConnectionContext.Provider>
  );
}

export default App;
