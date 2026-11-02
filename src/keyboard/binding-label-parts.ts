import type {
  BehaviorBindingParametersSet,
  BehaviorParameterValueDescription,
  GetBehaviorDetailsResponse,
} from "@zmkfirmware/zmk-studio-ts-client/behaviors";
import type { BehaviorBinding } from "@zmkfirmware/zmk-studio-ts-client/keymap";

import { validateValue } from "../behaviors/parameters";
import {
  DisplayLabel,
  behaviorIcon,
  friendlyBehaviorName,
  hidUsageDisplay,
  noParamSymbol,
  valueLabel,
} from "./key-symbols";

export interface LayerInfo {
  id: number;
  name: string;
}

/**
 * What to draw on a key. `primary` is the main function, drawn large.
 * `secondary`, when present, is the hold action of a hold-tap style binding,
 * drawn smaller above the primary (tap) action.
 */
export interface BindingDisplay {
  primary?: DisplayLabel;
  secondary?: DisplayLabel;
  /** Whether the behavior name should still be drawn in the key header. */
  showHeader: boolean;
}

type ParamKind = "hid" | "layer" | "constant" | "range";

interface ParamLabel {
  kind: ParamKind;
  label: DisplayLabel;
}

/**
 * Find the metadata set that describes the given binding. Behaviors such as
 * `&bt` declare several sets (e.g. BT_SEL takes an index, BT_CLR takes none),
 * so we pick the first set where both parameter values validate.
 */
const findMatchingSet = (
  binding: BehaviorBinding,
  metadata: BehaviorBindingParametersSet[],
  layerIds: number[]
): BehaviorBindingParametersSet | undefined =>
  metadata.find(
    (set) =>
      validateValue(layerIds, binding.param1, set.param1) &&
      validateValue(layerIds, binding.param2, set.param2)
  );

const describeParam = (
  value: number,
  values: BehaviorParameterValueDescription[],
  layers: LayerInfo[]
): ParamLabel | undefined => {
  if (values.length === 0 || values.every((v) => v.nil)) {
    return undefined;
  }

  const constant = values.find(
    (v) => v.constant !== undefined && v.constant === value
  );
  if (constant) {
    const l = valueLabel(constant.name);
    return {
      kind: "constant",
      label:
        typeof l === "string"
          ? { text: l, title: constant.name }
          : { icon: l, title: constant.name },
    };
  }

  for (const v of values) {
    if (v.hidUsage) {
      return { kind: "hid", label: hidUsageDisplay(value) };
    } else if (v.layerId) {
      const index = layers.findIndex((l) => l.id === value);
      const name =
        index >= 0 ? layers[index].name || index.toLocaleString() : undefined;
      const text = name ?? value.toLocaleString();
      return { kind: "layer", label: { text, title: `Layer ${text}` } };
    } else if (v.range && value >= v.range.min && value <= v.range.max) {
      const text = value.toLocaleString();
      return { kind: "range", label: { text, title: `${v.name} ${text}` } };
    }
  }

  return undefined;
};

/**
 * Turn a binding into what to draw on its key, based on the parameter
 * metadata the firmware reports for the behavior.
 */
export const describeBinding = (
  binding: BehaviorBinding,
  behavior: GetBehaviorDetailsResponse | undefined,
  layers: LayerInfo[]
): BindingDisplay => {
  if (!behavior) {
    return { showHeader: true };
  }

  const set = findMatchingSet(
    binding,
    behavior.metadata,
    layers.map((l) => l.id)
  );

  const p1: ParamLabel | undefined = set
    ? describeParam(binding.param1, set.param1, layers)
    : binding.param1
      ? // Unknown metadata shape: treat param1 as a HID usage when set.
        { kind: "hid", label: hidUsageDisplay(binding.param1) }
      : undefined;
  const p2 = set ? describeParam(binding.param2, set.param2, layers) : undefined;

  // No parameters (&trans, &none, &bootloader, macros, ...): show a symbol,
  // the behavior's icon, or its name as the main label.
  if (!p1 && !p2) {
    const symbol = noParamSymbol(behavior.displayName);
    const icon = behaviorIcon(behavior.displayName);
    if (symbol || icon) {
      return {
        primary: symbol
          ? { text: symbol, title: behavior.displayName }
          : { icon, title: behavior.displayName },
        showHeader: false,
      };
    }
    return {
      primary: {
        text: friendlyBehaviorName(behavior.displayName),
        title: behavior.displayName,
      },
      showHeader: true,
    };
  }

  if (p1 && p2) {
    // A named action followed by a value (&bt BT_SEL 1, &bt BT_DISC 1) reads
    // best on one line: "1" or "Disc 1".
    if (p1.kind === "constant" && p1.label.text !== undefined) {
      const text = [p1.label.text, p2.label.text].filter(Boolean).join(" ");
      return {
        primary: { text, title: `${p1.label.title} ${p2.label.text ?? ""}` },
        showHeader: true,
      };
    }

    // Hold-tap style (&mt, &lt, ...): param1 is the hold, param2 the tap.
    return { primary: p2.label, secondary: p1.label, showHeader: true };
  }

  const only = (p1 ?? p2) as ParamLabel;
  return { primary: only.label, showHeader: true };
};
