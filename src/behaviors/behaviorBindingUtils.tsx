import { HidUsageLabel } from "../keyboard/HidUsageLabel";
import { BehaviorBindingParametersSet, BehaviorParameterValueDescription } from "@zmkfirmware/zmk-studio-ts-client/behaviors";
import { validateValue } from "./parameters";

/**
 * Find the matching parameter set based on param1 value.
 * This is critical for determining param2 type, as param2's type can depend on param1's value.
 */
export function findMatchingParameterSet(
  param1: number | undefined,
  metadata: BehaviorBindingParametersSet[],
  layerIds: number[]
): BehaviorBindingParametersSet | undefined {
  return metadata.find(set => validateValue(layerIds, param1, set.param1));
}

/**
 * Validate that a binding's parameters match the behavior's metadata.
 */
export function validateBinding(
  metadata: BehaviorBindingParametersSet[],
  layerIds: number[],
  param1?: number,
  param2?: number
): boolean {
  if (
    (param1 === undefined || param1 === 0) &&
    metadata.every((s) => !s.param1 || s.param1.length === 0)
  ) {
    return true;
  }

  const matchingSet = findMatchingParameterSet(param1, metadata, layerIds);

  if (!matchingSet) {
    return false;
  }

  return validateValue(layerIds, param2, matchingSet.param2);
}

/**
 * Get a readable display for a parameter value based on its metadata.
 * Returns a JSX element, string, number, or null if nothing should be displayed.
 * Returns null when the parameter shouldn't be displayed (empty metadata or nil type).
 */
export function getParameterDisplay(
  value: number,
  paramDescriptions: BehaviorParameterValueDescription[],
  layers?: { id: number; name: string }[]
): JSX.Element | string | number | null {
  // If no parameter descriptions, don't display anything (matches ParameterValuePicker behavior)
  if (!paramDescriptions || paramDescriptions.length === 0) {
    return null;
  }

  // Check if it's a constant with a name
  if (paramDescriptions.every(v => v.constant !== undefined)) {
    const match = paramDescriptions.find(v => v.constant === value);
    if (match?.name) {
      return match.name;
    }
    // If no match found in constants, don't display
    return null;
  }

  // For single parameter descriptions, check the type
  if (paramDescriptions.length === 1) {
    const desc = paramDescriptions[0];

    if (desc.hidUsage) {
      return <HidUsageLabel hid_usage={value}/>;
    }

    if (desc.layerId && layers) {
      // Look up the layer name by ID
      const layer = layers.find(l => l.id === value);
      return layer?.name || `Layer ${value}`;
    }

    if (desc.range) {
      return value;
    }

    // If it's a nil type or unrecognized, don't display
    return null;
  }

  // For multiple parameter descriptions or unhandled cases, don't display
  return null;
}
