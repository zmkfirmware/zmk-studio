import { ReactNode } from "react";
import {
  BehaviorBindingParametersSet,
  BehaviorParameterValueDescription,
  GetBehaviorDetailsResponse,
} from "@zmkfirmware/zmk-studio-ts-client/behaviors";
import { BehaviorBinding } from "@zmkfirmware/zmk-studio-ts-client/keymap";
import {
  hid_usage_get_labels,
  hid_usage_page_and_id_from_usage,
} from "../hid-usages";
import { resolveModifierLabel, mask_mods, resolveShiftedChar, Mods } from "../behaviors/modifiers";
import { LucideIcon } from "lucide-react";
import { getBehaviorIcon } from "./behaviorIcons";
import { LegendLayout, resolveLayoutLegend } from "./legendLayouts";

export interface LayerInfo {
  id: number;
  name: string;
}

export interface KeyDisplayInfo {
  mainLabel: ReactNode;
  holdLabel: string;
  layerColor: string | undefined;
  icon: LucideIcon | undefined;
  tooltipText: string;
  behaviorName: string;
  centerHidUsage: number;
}

// Subtle background tints indexed by layer position.
// CUSTOMIZATION POINT: Edit this array to change layer colors.
const LAYER_COLORS = [
  undefined, // Layer 0: no tint
  "#3b82f620", // blue
  "#22c55e20", // green
  "#eab30820", // yellow
  "#a855f720", // purple
  "#ec489920", // pink
  "#f9731620", // orange
  "#06b6d420", // cyan
];


export interface KeyDisplayFormatters {
  /**
   * CUSTOMIZATION POINT: Override the full tooltip string.
   * Called with resolved tap/hold labels and behavior name.
   */
  formatTooltip?: (info: {
    behaviorName: string;
    tapLabel: string;
    holdLabel: string;
  }) => string;

  /**
   * CUSTOMIZATION POINT: Override how param2 is resolved to a label.
   * Called when param2 is present and has a resolvable type.
   */
  formatHoldLabel?: (
    param2: number,
    param2Descriptions: BehaviorParameterValueDescription[],
    layers: LayerInfo[],
  ) => string;
}

// --- Internal helpers ---

function removePrefix(s?: string) {
  return s?.replace(/^Keyboard /, "");
}

function resolveHidLabel(hidUsage: number, layout?: LegendLayout): string {
  const [page, id] = hid_usage_page_and_id_from_usage(hidUsage);
  const flags = (hidUsage >> 24) & 0xff;
  const isShifted = !!(flags & Mods.LeftShift);

  // Layout-specific override takes priority (keyboard page only)
  if ((page & 0xff) === 7) {
    const layoutLabel = resolveLayoutLegend(id, isShifted, layout);
    if (layoutLabel !== null) return layoutLabel;
  }

  const shifted = resolveShiftedChar(hidUsage);
  if (shifted) return shifted;

  const labels = hid_usage_get_labels(page & 0xff, id);
  return removePrefix(labels.short || labels.med || labels.long) || "???";
}

function findMatchingParamSet(
  metadata: BehaviorBindingParametersSet[],
  param1: number,
  layerIds: number[],
): BehaviorBindingParametersSet | undefined {
  return metadata.find((s) =>
    s.param1?.some((desc) => matchesParamDescription(desc, param1, layerIds)),
  );
}

function matchesParamDescription(
  desc: BehaviorParameterValueDescription,
  value: number,
  layerIds: number[],
): boolean {
  if (desc.constant !== undefined) {
    return desc.constant === value;
  } else if (desc.range) {
    return value >= desc.range.min && value <= desc.range.max;
  } else if (desc.hidUsage) {
    const [page, id] = hid_usage_page_and_id_from_usage(value);
    return page !== 0 && id !== 0;
  } else if (desc.layerId) {
    return layerIds.includes(value);
  } else if (desc.nil) {
    return value === 0;
  }
  return false;
}

function resolveParam2Label(
  param2: number,
  param2Descriptions: BehaviorParameterValueDescription[],
  layers: LayerInfo[],
): string | undefined {
  if (!param2Descriptions || param2Descriptions.length === 0) {
    return undefined;
  }

  // CUSTOMIZATION POINT: Modify this logic to add new param2 resolution types
  // or change how existing types are resolved.

  const first = param2Descriptions[0];

  if (first.layerId) {
    const layer = layers.find((l) => l.id === param2);
    return layer ? layer.name : `Layer ${param2}`;
  }

  if (param2Descriptions.every((d) => d.constant !== undefined)) {
    const match = param2Descriptions.find((d) => d.constant === param2);
    return match?.name;
  }

  if (first.hidUsage) {
    const flags = param2 >> 24;
    const rawUsage = mask_mods(param2);
    const modLabel = resolveModifierLabel(flags);
    const keyLabel = rawUsage ? resolveHidLabel(rawUsage) : undefined;

    if (modLabel && keyLabel) {
      return `${modLabel}+${keyLabel}`;
    }
    return modLabel || keyLabel;
  }

  if (first.range) {
    return `${first.name}: ${param2}`;
  }

  return undefined;
}

function defaultTooltipFormatter(info: {
  behaviorName: string;
  tapLabel: string;
  holdLabel: string;
}): string {
  // CUSTOMIZATION POINT: Change this default format string to alter
  // the tooltip appearance for all keys globally.
  if (info.holdLabel) {
    return `${info.behaviorName}: ${info.tapLabel}, Hold: ${info.holdLabel}`;
  }
  return `${info.behaviorName}: ${info.tapLabel}`;
}

// --- Main resolver ---

/**
 * Resolves a BehaviorBinding into display info for key rendering.
 *
 * CUSTOMIZATION: Pass a `formatters` object to override tooltip formatting
 * or param2 label resolution. See `KeyDisplayFormatters` for available hooks.
 */
export function resolveKeyDisplayInfo(
  binding: BehaviorBinding,
  behavior: GetBehaviorDetailsResponse | undefined,
  layers: LayerInfo[],
  formatters?: KeyDisplayFormatters,
  layout?: LegendLayout,
): KeyDisplayInfo {
  let behaviorName = behavior?.displayName || "Unknown";
  let tapLabel = resolveHidLabel(binding.param1, layout);
  let icon = getBehaviorIcon(behaviorName);

  let holdLabel = "";
  let matchingSet: BehaviorBindingParametersSet | undefined;
  let centerHidUsage = binding.param1;

  if (binding.param2 && behavior?.metadata) {
    const layerIds = layers.map((l) => l.id);
    matchingSet = findMatchingParamSet(
      behavior.metadata,
      binding.param1,
      layerIds,
    );

    if (matchingSet?.param2) {
      if (formatters?.formatHoldLabel) {
        holdLabel =
          formatters.formatHoldLabel(
            binding.param2,
            matchingSet.param2,
            layers,
          ) || "";
      } else {
        holdLabel =
          resolveParam2Label(binding.param2, matchingSet.param2, layers) || "";
      }
    }
  }

  // Customize header for keys with layer-tap or modifier hold actions
  const bn = behaviorName.toLowerCase();
  if (bn.includes("layer-tap") || bn.startsWith("lt")) {
    // param1 = layer ID (hold action), param2 = tap HID usage
    const layer = layers.find((l) => l.id === binding.param1);
    behaviorName = `LT-${layer?.name || `Layer ${binding.param1}`}`;
    centerHidUsage = binding.param2;
    tapLabel = resolveHidLabel(binding.param2, layout);
    icon = undefined;
    holdLabel = "";
  } else if (bn.includes("homerow") || bn.includes("nomerow")) {
    // param1 = modifier HID usage (hold action), e.g. 0x700E0 = Left Control
    // param2 = tap HID usage (tap action), e.g. 0x70016 = "H"
    const usageId = binding.param1 & 0xffff;
    const HID_MOD_NAMES: Record<number, string> = {
      0xe0: "LCtrl",
      0xe1: "LShift",
      0xe2: "LAlt",
      0xe3: "LGUI",
      0xe4: "RCtrl",
      0xe5: "RShift",
      0xe6: "RAlt",
      0xe7: "RGUI",
    };
    const modName = HID_MOD_NAMES[usageId];
    if (modName) {
      behaviorName = `MT-${modName}`;
      centerHidUsage = binding.param2;
      tapLabel = resolveHidLabel(binding.param2, layout);
      icon = undefined;
      holdLabel = "";
    }
  }

  const formatTooltip = formatters?.formatTooltip || defaultTooltipFormatter;
  const tooltipText = formatTooltip({ behaviorName, tapLabel, holdLabel });

  // Resolve layer color
  let layerColor: string | undefined;
  if (bn.includes("layer-tap") || bn.startsWith("lt")) {
    const layerIndex = layers.findIndex((l) => l.id === binding.param1);
    if (layerIndex >= 0) {
      layerColor = LAYER_COLORS[layerIndex % LAYER_COLORS.length];
    }
  } else if (holdLabel && binding.param2 && behavior?.metadata) {
    const layerIds = layers.map((l) => l.id);
    const layerMatchingSet = findMatchingParamSet(
      behavior.metadata,
      binding.param1,
      layerIds,
    );
    const firstParam2 = layerMatchingSet?.param2?.[0];
    if (firstParam2?.layerId) {
      const layerIndex = layers.findIndex((l) => l.id === binding.param2);
      if (layerIndex >= 0) {
        layerColor = LAYER_COLORS[layerIndex % LAYER_COLORS.length];
      }
    }
  }

  return {
    mainLabel: tapLabel,
    holdLabel,
    layerColor,
    icon,
    tooltipText,
    behaviorName,
    centerHidUsage,
  };
}
