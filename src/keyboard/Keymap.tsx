import {
  PhysicalLayout,
  Keymap as KeymapMsg,
} from "@zmkfirmware/zmk-studio-ts-client/keymap";
import type { GetBehaviorDetailsResponse } from "@zmkfirmware/zmk-studio-ts-client/behaviors";

import {
  LayoutZoom,
  PhysicalLayout as PhysicalLayoutComp,
} from "./PhysicalLayout";
import { HidUsageLabel } from "./HidUsageLabel";
import { resolveKeyDisplayInfo } from "./keyDisplayInfo";
import { LegendLayoutId } from "./legendLayouts";

type BehaviorMap = Record<number, GetBehaviorDetailsResponse>;

import type { KeyDisplayFormatters, LayerInfo } from "./keyDisplayInfo";

export interface KeymapProps {
  layout: PhysicalLayout;
  keymap: KeymapMsg;
  behaviors: BehaviorMap;
  scale: LayoutZoom;
  selectedLayerIndex: number;
  selectedKeyPosition: number | undefined;
  onKeyPositionClicked: (keyPosition: number) => void;
  displayFormatters?: KeyDisplayFormatters;
  legendLayout?: LegendLayoutId;
}

export const Keymap = ({
  layout,
  keymap,
  behaviors,
  scale,
  selectedLayerIndex,
  selectedKeyPosition,
  onKeyPositionClicked,
  displayFormatters,
  legendLayout = "us",
}: KeymapProps) => {
  if (!keymap.layers[selectedLayerIndex]) {
    return <></>;
  }

  const layers: LayerInfo[] = keymap.layers.map(({ id, name }, i) => ({
    id,
    name: name || `Layer ${i}`,
  }));

  const positions = layout.keys.map((k, i) => {
    if (i >= keymap.layers[selectedLayerIndex].bindings.length) {
      return {
        id: `${keymap.layers[selectedLayerIndex].id}-${i}`,
        header: "Unknown",
        x: k.x / 100.0,
        y: k.y / 100.0,
        width: k.width / 100,
        height: k.height / 100.0,
        children: <span></span>,
      };
    }

    const binding = keymap.layers[selectedLayerIndex].bindings[i];
    const behavior = behaviors[binding.behaviorId];

    const displayInfo = resolveKeyDisplayInfo(
      binding,
      behavior,
      layers,
      displayFormatters,
    );

    return {
      id: `${keymap.layers[selectedLayerIndex].id}-${i}`,
      header: displayInfo.behaviorName,
      tooltip: displayInfo.tooltipText,
      holdLabel: displayInfo.holdLabel || undefined,
      layerColor: displayInfo.layerColor,
      icon: displayInfo.icon,
      x: k.x / 100.0,
      y: k.y / 100.0,
      width: k.width / 100,
      height: k.height / 100.0,
      r: (k.r || 0) / 100.0,
      rx: (k.rx || 0) / 100.0,
      ry: (k.ry || 0) / 100.0,
      children: <HidUsageLabel hid_usage={displayInfo.centerHidUsage} legendLayout={legendLayout} />,
    };
  });

  return (
    <PhysicalLayoutComp
      positions={positions}
      oneU={48}
      hoverZoom={true}
      zoom={scale}
      selectedPosition={selectedKeyPosition}
      onPositionClicked={onKeyPositionClicked}
    />
  );
};
