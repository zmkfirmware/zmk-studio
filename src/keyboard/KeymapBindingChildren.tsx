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

  // Find the matching parameter set for param1 (critical for getting param2 type)
  const layerIds = layers.map(l => l.id);
  const matchingSet = findMatchingParameterSet(binding.param1, behavior.metadata, layerIds);

  // Get displays for both parameters
  const param1Display = 
    getParameterDisplay(binding.param1, behavior.metadata.flatMap(m => m.param1), layers);

  const param2Display = matchingSet ?
    getParameterDisplay(binding.param2, matchingSet.param2, layers) :
    null;

  // Both parameters present and should be displayed
  if (param1Display !== null && param2Display !== null) {
    return [
      <div key="p2" className="relative text-s">
        {param2Display}
      </div>,
      <div key="p1" className="relative text-xs ml-1 mt-2">
        {param1Display}
      </div>
    ];
  }

  // Only param1 should be displayed
  if (param1Display !== null) {
    return (
      <div className="relative text-base">
        {param1Display}
      </div>
    );
  }

  // Only param2 should be displayed (unusual but handle it)
  if (param2Display !== null) {
    return (
      <div className="relative text-base">
        {param2Display}
      </div>
    );
  }

  // Nothing to display
  return <div className="relative"></div>;
};
