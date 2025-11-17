import { GetBehaviorDetailsResponse } from "@zmkfirmware/zmk-studio-ts-client/behaviors";
import { findMatchingParameterSet, getParameterDisplay } from "../behaviors/behaviorBindingUtils";

export interface KeyBinding {
  param1: number;
  param2: number;
}

export const getBindingChildren = (
  behavior: GetBehaviorDetailsResponse | undefined,
  binding: KeyBinding,
  layers: { id: number; name: string }[] = []
): JSX.Element | JSX.Element[] => {
  // If no behavior metadata, show behavior name
  if (!behavior || !behavior.metadata) {
    return (
      <div className="relative text-xs opacity-50">
        {behavior?.displayName || "?"}
      </div>
    );
  }

  // Find the matching parameter set for param1 (critical for getting param2 type!)
  const layerIds = layers.map(l => l.id);
  const matchingSet = findMatchingParameterSet(binding.param1, behavior.metadata, layerIds);

  // If both parameters are zero
  if (binding.param1 === 0 && binding.param2 === 0) {
    return (
      <div className="relative text-xs">
      </div>
    );
  }

  // Get displays for both parameters
  const param1Display = binding.param1 !== 0 ?
    getParameterDisplay(binding.param1, behavior.metadata.flatMap(m => m.param1), layers) :
    null;

  const param2Display = binding.param2 !== 0 && matchingSet ?
    getParameterDisplay(binding.param2, matchingSet.param2, layers) :
    null;

  // Both parameters present and should be displayed
  if (param1Display && param2Display) {
    return [
      <div key="p2" className="relative text-sm">
        {param2Display}
      </div>,
      <div key="p1" className="text-xs truncate relative">
        {param1Display}
      </div>
    ];
  }

  // Only param1 should be displayed
  if (param1Display) {
    return (
      <div className="relative text-base">
        {param1Display}
      </div>
    );
  }

  // Only param2 should be displayed (unusual but handle it)
  if (param2Display) {
    return (
      <div className="relative text-base">
        {param2Display}
      </div>
    );
  }

  // Nothing to display - show behavior name or empty
  return (
    <div className="relative text-xs">
    </div>
  );
};
