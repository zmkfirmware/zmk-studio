import {
  PhysicalLayout,
  Keymap as KeymapMsg,
} from "zmk-studio-ts-client/keymap";
import type { GetBehaviorDetailsResponse } from "zmk-studio-ts-client/behaviors";

import {
  hid_usage_get_label,
  hid_usage_page_and_id_from_usage,
} from "../hid-usages";

import { PhysicalLayout as PhysicalLayoutComp } from "./PhysicalLayout";

type BehaviorMap = Record<number, GetBehaviorDetailsResponse>;

export interface KeymapProps {
  layout: PhysicalLayout;
  keymap: KeymapMsg;
  behaviors: BehaviorMap;
  selectedLayerIndex: number;
  selectedKeyPosition: number | undefined;
  onKeyPositionClicked: (keyPosition: number) => void;
}

export const Keymap = ({
  layout,
  keymap,
  behaviors,
  selectedLayerIndex,
  selectedKeyPosition,
  onKeyPositionClicked,
}: KeymapProps) => {
  if (!keymap.layers[selectedLayerIndex]) {
    return <></>;
  }

  let positions = layout.keys.map((k, i) => {
    let [page, id] = hid_usage_page_and_id_from_usage(
      keymap.layers[selectedLayerIndex].bindings[i].param1
    );

    // TODO: Do something with implicit mods!
    page &= 0xff;

    let label = hid_usage_get_label(page, id)?.replace(/^Keyboard /, "");

    return {
      header:
        behaviors[keymap.layers[selectedLayerIndex].bindings[i].behaviorId]
          ?.displayName || "Unknown",
      x: k.x / 100.0,
      y: k.y / 100.0,
      width: k.width / 100,
      height: k.height / 100.0,
      children: <span>{label}</span>,
    };
  });

  return (
    <PhysicalLayoutComp
      positions={positions}
      selectedPosition={selectedKeyPosition}
      onPositionClicked={onKeyPositionClicked}
    />
  );
};
