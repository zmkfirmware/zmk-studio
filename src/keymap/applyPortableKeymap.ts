import type { RpcConnection } from "@zmkfirmware/zmk-studio-ts-client";
import type { GetBehaviorDetailsResponse } from "@zmkfirmware/zmk-studio-ts-client/behaviors";
import {
  SetLayerBindingResponse,
  SetLayerPropsResponse,
  type BehaviorBinding,
  type Keymap,
} from "@zmkfirmware/zmk-studio-ts-client/keymap";
import { call_rpc } from "../rpc/logging";
import {
  checkPortableKeymap,
  resolvePortableBindings,
  type PortableKeymap,
} from "./portableKeymap";

export class KeymapApplyError extends Error {
  keymap?: Keymap;

  constructor(message: string, keymap?: Keymap) {
    super(message);
    this.name = "KeymapApplyError";
    this.keymap = keymap;
  }
}

export async function applyPortableKeymap(
  conn: RpcConnection,
  portable: PortableKeymap,
  behaviors: Record<number, GetBehaviorDetailsResponse>,
  options: { save: boolean },
): Promise<Keymap> {
  let wrote = false;

  try {
    let working = await requireKeymap(conn);
    checkPortableKeymap(portable, working, behaviors);

    while (working.layers.length > portable.layers.length) {
      wrote = true;
      const layerIndex = working.layers.length - 1;
      const resp = await call_rpc(conn, {
        keymap: { removeLayer: { layerIndex } },
      });
      if (!resp?.keymap?.removeLayer?.ok) {
        throw new KeymapApplyError(
          `Failed to remove extra layer ${layerIndex + 1}`,
        );
      }
      working = {
        ...working,
        layers: working.layers.slice(0, -1),
        availableLayers: working.availableLayers + 1,
      };
    }

    while (working.layers.length < portable.layers.length) {
      wrote = true;
      const resp = await call_rpc(conn, { keymap: { addLayer: {} } });
      const added = resp?.keymap?.addLayer?.ok?.layer;
      if (!added) {
        throw new KeymapApplyError("Failed to add a layer");
      }
      working = {
        ...working,
        layers: [...working.layers, added],
        availableLayers: Math.max(0, working.availableLayers - 1),
      };
    }

    for (let i = 0; i < portable.layers.length; i++) {
      const layer = working.layers[i];
      const name = portable.layers[i].name;
      if (layer.name === name) {
        continue;
      }
      wrote = true;
      const resp = await call_rpc(conn, {
        keymap: { setLayerProps: { layerId: layer.id, name } },
      });
      if (
        resp?.keymap?.setLayerProps !==
        SetLayerPropsResponse.SET_LAYER_PROPS_RESP_OK
      ) {
        throw new KeymapApplyError(`Failed to rename layer ${i + 1}`);
      }
    }

    const fresh = await requireKeymap(conn);
    if (fresh.layers.length !== portable.layers.length) {
      throw new KeymapApplyError(
        "Keyboard layer count did not match the file after sync",
      );
    }

    const positions = portable.layers[0]?.bindings.length ?? 0;
    for (const layer of fresh.layers) {
      if (layer.bindings.length !== positions) {
        throw new KeymapApplyError("Keyboard key count changed during load");
      }
    }

    const resolved = resolvePortableBindings(
      portable,
      behaviors,
      fresh.layers.map((layer) => layer.id),
    );

    for (let i = 0; i < fresh.layers.length; i++) {
      const layer = fresh.layers[i];
      for (let key = 0; key < resolved[i].length; key++) {
        const next = resolved[i][key];
        const current = layer.bindings[key];
        if (current && sameBinding(current, next)) {
          continue;
        }
        wrote = true;
        const resp = await call_rpc(conn, {
          keymap: {
            setLayerBinding: {
              layerId: layer.id,
              keyPosition: key,
              binding: next,
            },
          },
        });
        if (
          resp?.keymap?.setLayerBinding !==
          SetLayerBindingResponse.SET_LAYER_BINDING_RESP_OK
        ) {
          throw new KeymapApplyError(
            `Layer ${i + 1} key ${key + 1}: ${bindingError(resp?.keymap?.setLayerBinding)}`,
          );
        }
      }
    }

    if (options.save) {
      wrote = true;
      const resp = await call_rpc(conn, { keymap: { saveChanges: true } });
      const saved = resp?.keymap?.saveChanges;
      if (!saved || saved.err) {
        throw new KeymapApplyError("Failed to save keymap to the keyboard");
      }
    }

    return await requireKeymap(conn);
  } catch (error) {
    if (!wrote) {
      throw error;
    }
    let refreshed: Keymap | undefined;
    try {
      refreshed = await requireKeymap(conn);
    } catch {
      refreshed = undefined;
    }
    const message =
      error instanceof Error ? error.message : "Failed to load keymap";
    throw new KeymapApplyError(message, refreshed);
  }
}

async function requireKeymap(conn: RpcConnection): Promise<Keymap> {
  const resp = await call_rpc(conn, { keymap: { getKeymap: true } });
  const keymap = resp?.keymap?.getKeymap;
  if (!keymap?.layers) {
    throw new KeymapApplyError("Failed to read keymap from keyboard");
  }
  return keymap;
}

function sameBinding(a: BehaviorBinding, b: BehaviorBinding): boolean {
  return (
    a.behaviorId === b.behaviorId &&
    a.param1 === b.param1 &&
    a.param2 === b.param2
  );
}

function bindingError(code: SetLayerBindingResponse | undefined): string {
  switch (code) {
    case SetLayerBindingResponse.SET_LAYER_BINDING_RESP_INVALID_LOCATION:
      return "keyboard rejected a key position";
    case SetLayerBindingResponse.SET_LAYER_BINDING_RESP_INVALID_BEHAVIOR:
      return "keyboard rejected a behavior";
    case SetLayerBindingResponse.SET_LAYER_BINDING_RESP_INVALID_PARAMETERS:
      return "keyboard rejected key parameters";
    default:
      return "keyboard rejected a key binding";
  }
}
