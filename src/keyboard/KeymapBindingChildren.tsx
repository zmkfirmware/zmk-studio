import { HidUsageLabel } from "./HidUsageLabel";
import { GetBehaviorDetailsResponse, BehaviorBindingParametersSet } from "@zmkfirmware/zmk-studio-ts-client/behaviors";
import { validateValue } from "../behaviors/parameters";

export interface KeyBinding {
  param1: number;
  param2: number;
}

const renderIndicator = (numbers: 0|1|2|3 = 1): JSX.Element => (
    <div className="absolute ml-0.5 h-full flex flex-col justify-evenly py-1">
      {Array.from({ length: Math.max(1, numbers) }, (_, i) => (
        <div 
          key={i}
          className="bg-gray-900 opacity-80 rounded-full" 
          style={{
            width: '.2rem',
            height: numbers === 0 ? '0.8rem' : '.2rem',
          }}
        />
      ))}
    </div>
  );

// Helper function to check if a parameter is a HID usage
function isHidUsageParameter(
  value: number,
  metadata: BehaviorBindingParametersSet[],
  layerIds: number[]
): boolean {
  if (value === 0) return false;
  
  // Check if any parameter set has this value as a HID usage
  return metadata.some(set => 
    set.param1.some(param => 
      param.hidUsage && validateValue(layerIds, value, [param])
    ) ||
    set.param2.some(param => 
      param.hidUsage && validateValue(layerIds, value, [param])
    )
  );
}

// Helper function to check if a parameter is a layer ID
function isLayerIdParameter(
  value: number,
  metadata: BehaviorBindingParametersSet[],
  layerIds: number[]
): boolean {
  if (value === 0) return false;
  
  // Check if any parameter set has this value as a layer ID
  return metadata.some(set => 
    set.param1.some(param => 
      param.layerId && validateValue(layerIds, value, [param])
    ) ||
    set.param2.some(param => 
      param.layerId && validateValue(layerIds, value, [param])
    )
  );
}

export const getBindingChildren = (
  behavior: GetBehaviorDetailsResponse | undefined,
  binding: KeyBinding,
  layerIds: number[] = []
): JSX.Element | JSX.Element[] => {
  if (!behavior || !behavior.metadata) {
    if (binding.param1 !== 0 && binding.param2 !== 0) {
      return [
        <div className="relative text-sm">
          <HidUsageLabel hid_usage={binding.param2}/>
        </div>,
        <div className="text-xs truncate relative">
          <HidUsageLabel hid_usage={binding.param1}/>
        </div>
      ];
    }

    if (binding.param1 === 0 && binding.param2 === 0) {
      return (
        <div className="relative text-xs">
          ▽
        </div>
      );
    }

    return (
      <div className="relative text-base">
        <HidUsageLabel hid_usage={binding.param1}/>
      </div>
    );
  }

  // Check if both parameters are HID usages (like Mod-Tap, Layer-Tap, etc.)
  const param1IsHidUsage = isHidUsageParameter(binding.param1, behavior.metadata, layerIds);
  const param2IsHidUsage = isHidUsageParameter(binding.param2, behavior.metadata, layerIds);
  const param1IsLayerId = isLayerIdParameter(binding.param1, behavior.metadata, layerIds);
  const param2IsLayerId = isLayerIdParameter(binding.param2, behavior.metadata, layerIds);

  // If both parameters are HID usages, render with indicators (Mod-Tap style)
  if (param1IsHidUsage && param2IsHidUsage) {
    return [
      <div className="relative text-sm">
        {renderIndicator(1)}
        <HidUsageLabel hid_usage={binding.param2}/>
      </div>,
      <div className="text-xs truncate relative">
        {renderIndicator(0)}
        <HidUsageLabel hid_usage={binding.param1}/>
      </div>
    ];
  }

  // If param1 is a layer ID and param2 is a HID usage (Layer-Tap style)
  if (param1IsLayerId && param2IsHidUsage) {
    return [
      <div className="relative text-sm">
        {renderIndicator(1)}
        <HidUsageLabel hid_usage={binding.param2}/>
      </div>,
      <div className="text-xs truncate relative">
        {renderIndicator(0)}
        <svg className="inline-block mb-0.5 mr-1" xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8.235 1.559a.5.5 0 0 0-.47 0l-7.5 4a.5.5 0 0 0 0 .882L3.188 8 .264 9.559a.5.5 0 0 0 0 .882l7.5 4a.5.5 0 0 0 .47 0l7.5-4a.5.5 0 0 0 0-.882L12.813 8l2.922-1.559a.5.5 0 0 0 0-.882zm3.515 7.008L14.438 10 8 13.433 1.562 10 4.25 8.567l3.515 1.874a.5.5 0 0 0 .47 0zM8 9.433 1.562 6 8 2.567 14.438 6z"/>
        </svg>
        {binding.param1}
      </div>
    ];
  }

  // If both parameters are non-zero but not the special cases above
  if (binding.param1 !== 0 && binding.param2 !== 0) {
    return [
      <div className="relative text-sm">
        <HidUsageLabel hid_usage={binding.param2}/>
      </div>,
      <div className="text-xs truncate relative">
        <HidUsageLabel hid_usage={binding.param1}/>
      </div>
    ];
  }

  return (
    <div className="relative text-base">
      <HidUsageLabel hid_usage={binding.param1}/>
    </div>
  );
};