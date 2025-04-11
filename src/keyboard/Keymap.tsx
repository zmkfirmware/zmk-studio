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

type BehaviorMap = Record<number, GetBehaviorDetailsResponse>;

export interface KeymapProps {
  layout: PhysicalLayout;
  keymap: KeymapMsg;
  behaviors: BehaviorMap;
  scale: LayoutZoom;
  selectedLayerIndex: number;
  selectedKeyPosition: number | undefined;
  onKeyPositionClicked: (keyPosition: number) => void;
}

const getBindingChildren = (
  header: string,
  binding: { param1: number; param2: number },
) => {
  if (header === "Layer-Tap") {
    return [
        <span className="text-sm">
          <HidUsageLabel
            hid_usage={binding.param2}
          />
        </span>,
        <span className="text-xs truncate">
          <svg className="inline-block mb-0.5 mr-1" xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8.235 1.559a.5.5 0 0 0-.47 0l-7.5 4a.5.5 0 0 0 0 .882L3.188 8 .264 9.559a.5.5 0 0 0 0 .882l7.5 4a.5.5 0 0 0 .47 0l7.5-4a.5.5 0 0 0 0-.882L12.813 8l2.922-1.559a.5.5 0 0 0 0-.882zm3.515 7.008L14.438 10 8 13.433 1.562 10 4.25 8.567l3.515 1.874a.5.5 0 0 0 .47 0zM8 9.433 1.562 6 8 2.567 14.438 6z"/>
          </svg>
          {binding.param1}
        </span>
    ];
  }

  if (header === "Mod-Tap") {
    return [
        <span className="text-sm">
          <HidUsageLabel
            hid_usage={binding.param2}
          />
        </span>,
        <span className="text-sm">
          <HidUsageLabel
            hid_usage={binding.param1}
          />
        </span>
    ];
  }

  return (
    <span className="text-base">
      <HidUsageLabel
        hid_usage={binding.param1}
      />
    </span>
  );
};

export const Keymap = ({
  layout,
  keymap,
  behaviors,
  scale,
  selectedLayerIndex,
  selectedKeyPosition,
  onKeyPositionClicked,
}: KeymapProps) => {
  if (!keymap.layers[selectedLayerIndex]) {
    return <></>;
  }

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
    const header = behaviors[binding.behaviorId]?.displayName || "Unknown";

    const children = getBindingChildren(header, binding);

    return {
      id: `${keymap.layers[selectedLayerIndex].id}-${i}`,
      header:
        behaviors[keymap.layers[selectedLayerIndex].bindings[i].behaviorId]
          ?.displayName || "Unknown",
      header: header,
      x: k.x / 100.0,
      y: k.y / 100.0,
      width: k.width / 100,
      height: k.height / 100.0,
      r: (k.r || 0) / 100.0,
      rx: (k.rx || 0) / 100.0,
      ry: (k.ry || 0) / 100.0,
      children: children,
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
