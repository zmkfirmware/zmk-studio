import type {
  BehaviorBindingParametersSet,
  BehaviorParameterValueDescription,
  GetBehaviorDetailsResponse,
} from "@zmkfirmware/zmk-studio-ts-client/behaviors";
import type {
  BehaviorBinding,
  Keymap,
} from "@zmkfirmware/zmk-studio-ts-client/keymap";
import { hid_usage_page_and_id_from_usage } from "../hid-usages";
import { validateValue } from "../behaviors/parameters";

export const PORTABLE_KEYMAP_FORMAT = "zmk-studio-keymap";
export const PORTABLE_KEYMAP_VERSION = 1;

export type PortableParam = number | { layer: number };

export interface PortableBinding {
  behavior: string;
  param1: PortableParam;
  param2: PortableParam;
}

export interface PortableLayer {
  name: string;
  bindings: PortableBinding[];
}

export interface PortableKeymap {
  format: typeof PORTABLE_KEYMAP_FORMAT;
  version: typeof PORTABLE_KEYMAP_VERSION;
  layers: PortableLayer[];
}

const MAX_UINT32 = 0xffffffff;

export function isLayerRef(param: PortableParam): param is { layer: number } {
  return typeof param === "object" && param !== null && "layer" in param;
}

export function toPortableKeymap(
  keymap: Keymap,
  behaviors: Record<number, GetBehaviorDetailsResponse>,
): PortableKeymap {
  const layerIds = keymap.layers.map((layer) => layer.id);

  return {
    format: PORTABLE_KEYMAP_FORMAT,
    version: PORTABLE_KEYMAP_VERSION,
    layers: keymap.layers.map((layer) => ({
      name: layer.name,
      bindings: layer.bindings.map((binding) => {
        const behavior = behaviors[binding.behaviorId];
        if (!behavior) {
          throw new Error(
            `Keyboard behavior ${binding.behaviorId} has no name`,
          );
        }
        return encodeBinding(binding, behavior, layerIds);
      }),
    })),
  };
}

export function parsePortableKeymap(text: string): PortableKeymap {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Keymap file is not valid JSON");
  }

  if (!isRecord(data)) {
    throw new Error("Keymap file must be a JSON object");
  }
  if (data.format !== PORTABLE_KEYMAP_FORMAT) {
    throw new Error('Keymap file format must be "zmk-studio-keymap"');
  }
  if (data.version !== PORTABLE_KEYMAP_VERSION) {
    throw new Error("Keymap file version must be 1");
  }
  if (!Array.isArray(data.layers) || data.layers.length === 0) {
    throw new Error("Keymap file has no layers");
  }

  return {
    format: PORTABLE_KEYMAP_FORMAT,
    version: PORTABLE_KEYMAP_VERSION,
    layers: data.layers.map((layer, index) => parseLayer(layer, index)),
  };
}

export function checkPortableKeymap(
  portable: PortableKeymap,
  keymap: Keymap,
  behaviors: Record<number, GetBehaviorDetailsResponse>,
): void {
  if (keymap.layers.length < 1) {
    throw new Error("Keyboard has no layers");
  }

  const positions = keymap.layers[0].bindings.length;
  const extra = portable.layers.length - keymap.layers.length;
  if (extra > keymap.availableLayers) {
    const room = keymap.layers.length + keymap.availableLayers;
    throw new Error(
      `Keymap file has ${portable.layers.length} layers, keyboard only has room for ${room}`,
    );
  }

  const byName = behaviorsByName(behaviors);

  portable.layers.forEach((layer, layerIndex) => {
    if (
      keymap.maxLayerNameLength > 0 &&
      layer.name.length > keymap.maxLayerNameLength
    ) {
      throw new Error(
        `Layer ${layerIndex + 1} name is longer than ${keymap.maxLayerNameLength} characters`,
      );
    }
    if (layer.bindings.length !== positions) {
      throw new Error(
        `Layer ${layerIndex + 1} has ${layer.bindings.length} keys, keyboard has ${positions}`,
      );
    }

    layer.bindings.forEach((binding, keyIndex) => {
      const behavior = byName.get(binding.behavior);
      if (!behavior) {
        throw new Error(
          `Layer ${layerIndex + 1} key ${keyIndex + 1} uses unknown behavior "${binding.behavior}"`,
        );
      }
      checkLayerRef(
        binding.param1,
        "param1",
        behavior,
        portable.layers.length,
        layerIndex,
        keyIndex,
      );
      checkLayerRef(
        binding.param2,
        "param2",
        behavior,
        portable.layers.length,
        layerIndex,
        keyIndex,
      );
    });
  });
}

export function resolvePortableBindings(
  portable: PortableKeymap,
  behaviors: Record<number, GetBehaviorDetailsResponse>,
  layerIds: number[],
): BehaviorBinding[][] {
  const byName = behaviorsByName(behaviors);

  return portable.layers.map((layer, layerIndex) =>
    layer.bindings.map((binding, keyIndex) => {
      const behavior = byName.get(binding.behavior);
      if (!behavior) {
        throw new Error(
          `Layer ${layerIndex + 1} key ${keyIndex + 1} uses unknown behavior "${binding.behavior}"`,
        );
      }
      return {
        behaviorId: behavior.id,
        param1: resolveParam(binding.param1, layerIds, layerIndex, keyIndex),
        param2: resolveParam(binding.param2, layerIds, layerIndex, keyIndex),
      };
    }),
  );
}

function encodeBinding(
  binding: BehaviorBinding,
  behavior: GetBehaviorDetailsResponse,
  layerIds: number[],
): PortableBinding {
  const set = behavior.metadata.find((metadata) =>
    validateValue(layerIds, binding.param1, metadata.param1),
  );

  return {
    behavior: behavior.displayName,
    param1: encodeParam(set?.param1, binding.param1, layerIds),
    param2: encodeParam(set?.param2, binding.param2, layerIds),
  };
}

function encodeParam(
  descriptions: BehaviorParameterValueDescription[] | undefined,
  value: number,
  layerIds: number[],
): PortableParam {
  const match = descriptions?.find((description) =>
    valueMatches(description, value, layerIds),
  );
  if (match?.layerId) {
    const index = layerIds.indexOf(value);
    if (index >= 0) {
      return { layer: index };
    }
  }
  return value;
}

function valueMatches(
  description: BehaviorParameterValueDescription,
  value: number,
  layerIds: number[],
): boolean {
  if (description.constant !== undefined) {
    return description.constant == value;
  }
  if (description.range) {
    return value >= description.range.min && value <= description.range.max;
  }
  if (description.hidUsage) {
    const [page, id] = hid_usage_page_and_id_from_usage(value);
    return page !== 0 && id !== 0;
  }
  if (description.layerId) {
    return layerIds.includes(value);
  }
  if (description.nil) {
    return value === 0;
  }
  return false;
}

function resolveParam(
  param: PortableParam,
  layerIds: number[],
  layerIndex: number,
  keyIndex: number,
): number {
  if (!isLayerRef(param)) {
    return param;
  }
  const id = layerIds[param.layer];
  if (id === undefined) {
    throw new Error(
      `Layer ${layerIndex + 1} key ${keyIndex + 1} points at layer ${param.layer}`,
    );
  }
  return id;
}

function checkLayerRef(
  param: PortableParam,
  label: "param1" | "param2",
  behavior: GetBehaviorDetailsResponse,
  layerCount: number,
  layerIndex: number,
  keyIndex: number,
): void {
  if (!isLayerRef(param)) {
    return;
  }
  if (
    !Number.isInteger(param.layer) ||
    param.layer < 0 ||
    param.layer >= layerCount
  ) {
    throw new Error(
      `Layer ${layerIndex + 1} key ${keyIndex + 1} ${label} points at layer ${param.layer}, file has ${layerCount} layers`,
    );
  }
  if (!acceptsLayerId(behavior.metadata, label)) {
    throw new Error(
      `Layer ${layerIndex + 1} key ${keyIndex + 1} ${label} is a layer reference, but "${behavior.displayName}" does not take a layer`,
    );
  }
}

function acceptsLayerId(
  metadata: BehaviorBindingParametersSet[],
  which: "param1" | "param2",
): boolean {
  return metadata.some((set) =>
    (set[which] ?? []).some((description) => description.layerId !== undefined),
  );
}

function behaviorsByName(
  behaviors: Record<number, GetBehaviorDetailsResponse>,
): Map<string, GetBehaviorDetailsResponse> {
  const byName = new Map<string, GetBehaviorDetailsResponse>();
  for (const behavior of Object.values(behaviors)) {
    if (byName.has(behavior.displayName)) {
      throw new Error(`Two behaviors share the name "${behavior.displayName}"`);
    }
    byName.set(behavior.displayName, behavior);
  }
  return byName;
}

function parseLayer(value: unknown, index: number): PortableLayer {
  if (!isRecord(value)) {
    throw new Error(`Layer ${index + 1} must be an object`);
  }
  if (typeof value.name !== "string") {
    throw new Error(`Layer ${index + 1} needs a name`);
  }
  if (!Array.isArray(value.bindings)) {
    throw new Error(`Layer ${index + 1} needs bindings`);
  }
  return {
    name: value.name,
    bindings: value.bindings.map((binding, keyIndex) =>
      parseBinding(binding, index, keyIndex),
    ),
  };
}

function parseBinding(
  value: unknown,
  layerIndex: number,
  keyIndex: number,
): PortableBinding {
  const where = `Layer ${layerIndex + 1} key ${keyIndex + 1}`;
  if (!isRecord(value)) {
    throw new Error(`${where} must be an object`);
  }
  if (typeof value.behavior !== "string" || value.behavior.length === 0) {
    throw new Error(`${where} needs a behavior name`);
  }
  return {
    behavior: value.behavior,
    param1: parseParam(value.param1, where, "param1"),
    param2: parseParam(value.param2, where, "param2"),
  };
}

function parseParam(
  value: unknown,
  where: string,
  label: "param1" | "param2",
): PortableParam {
  if (typeof value === "number") {
    if (!Number.isInteger(value) || value < 0 || value > MAX_UINT32) {
      throw new Error(`${where} ${label} must be a non-negative integer`);
    }
    return value;
  }
  if (isRecord(value) && "layer" in value) {
    if (
      typeof value.layer !== "number" ||
      !Number.isInteger(value.layer) ||
      value.layer < 0
    ) {
      throw new Error(
        `${where} ${label} layer index must be a non-negative integer`,
      );
    }
    return { layer: value.layer };
  }
  throw new Error(`${where} ${label} must be a number or a layer index`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
