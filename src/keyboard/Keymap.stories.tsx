import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import type { GetBehaviorDetailsResponse } from "@zmkfirmware/zmk-studio-ts-client/behaviors";
import type {
  Keymap as KeymapMsg,
  PhysicalLayout,
} from "@zmkfirmware/zmk-studio-ts-client/keymap";

import { Keymap } from "./Keymap";
import { hid_usage_from_page_and_id } from "../hid-usages";

const kp = (id: number, mods = 0) =>
  ((mods << 24) | hid_usage_from_page_and_id(7, id)) >>> 0;
const consumer = (id: number) => hid_usage_from_page_and_id(12, id);

// Behavior metadata modelled on what the firmware reports over RPC.
const behaviors: Record<number, GetBehaviorDetailsResponse> = {
  1: {
    id: 1,
    displayName: "Key Press",
    metadata: [{ param1: [{ name: "Key", hidUsage: { keyboardMax: 255, consumerMax: 1023 } }], param2: [] }],
  },
  2: {
    id: 2,
    displayName: "Mod-Tap",
    metadata: [
      {
        param1: [{ name: "Hold", hidUsage: { keyboardMax: 255, consumerMax: 0 } }],
        param2: [{ name: "Tap", hidUsage: { keyboardMax: 255, consumerMax: 0 } }],
      },
    ],
  },
  3: {
    id: 3,
    displayName: "Momentary Layer",
    metadata: [{ param1: [{ name: "Layer", layerId: {} }], param2: [] }],
  },
  4: {
    id: 4,
    displayName: "Toggle Layer",
    metadata: [{ param1: [{ name: "Layer", layerId: {} }], param2: [] }],
  },
  5: { id: 5, displayName: "Transparent", metadata: [] },
  6: { id: 6, displayName: "None", metadata: [] },
  7: {
    id: 7,
    displayName: "Bluetooth",
    metadata: [
      {
        param1: [
          { name: "Next Profile", constant: 1 },
          { name: "Prev Profile", constant: 2 },
          { name: "Clear All", constant: 4 },
        ],
        param2: [{ name: "", nil: {} }],
      },
      {
        param1: [{ name: "Select Profile", constant: 3 }],
        param2: [{ name: "Profile", range: { min: 0, max: 4 } }],
      },
    ],
  },
  8: { id: 8, displayName: "Bootloader", metadata: [] },
  9: {
    id: 9,
    displayName: "Layer-Tap",
    metadata: [
      {
        param1: [{ name: "Layer", layerId: {} }],
        param2: [{ name: "Tap", hidUsage: { keyboardMax: 255, consumerMax: 0 } }],
      },
    ],
  },
  10: {
    id: 10,
    displayName: "Output Selection",
    metadata: [
      {
        param1: [
          { name: "Toggle Outputs", constant: 0 },
          { name: "USB Output", constant: 1 },
          { name: "BLE Output", constant: 2 },
        ],
        param2: [],
      },
    ],
  },
  11: {
    id: 11,
    displayName: "hold_key",
    metadata: [
      {
        param1: [{ name: "Key", hidUsage: { keyboardMax: 255, consumerMax: 0 } }],
        param2: [{ name: "Key", hidUsage: { keyboardMax: 255, consumerMax: 0 } }],
      },
    ],
  },
  12: {
    id: 12,
    displayName: "homerow_mod_left",
    metadata: [
      {
        param1: [{ name: "Key", hidUsage: { keyboardMax: 255, consumerMax: 0 } }],
        param2: [{ name: "Key", hidUsage: { keyboardMax: 255, consumerMax: 0 } }],
      },
    ],
  },
  13: { id: 13, displayName: "macro_wes", metadata: [] },
};

const bindings: [number, number, number][] = [
  [1, kp(0x29), 0], // ESC
  [1, kp(0x14), 0], // Q
  [2, kp(0xe1), kp(0x04)], // Mod-Tap: LSHIFT / A
  [3, 1, 0], // &mo NAV
  [4, 2, 0], // &tog 2 (unnamed layer)
  [5, 0, 0], // &trans
  [6, 0, 0], // &none
  [7, 3, 1], // &bt BT_SEL 1
  [7, 1, 0], // &bt BT_NXT
  [8, 0, 0], // &bootloader
  [1, kp(0x1f, 0x02), 0], // LS(N2) => @
  [1, kp(0x06, 0x01), 0], // LC(C) => ⌃C
  [9, 1, kp(0x2c)], // &lt NAV SPACE
  [10, 1, 0], // &out OUT_USB
  [1, consumer(0xe2), 0], // C_MUTE
  [1, kp(0x28), 0], // RET
  [1, kp(0x2a), 0], // BSPC
  [1, kp(0x2f), 0], // [
  [1, kp(0x2f, 0x02), 0], // {
  [1, kp(0xe1), 0], // LSHIFT
  [11, kp(0xe0), kp(0x1d)], // custom hold-tap: &hk LCTRL Z
  [12, kp(0xe2), kp(0x16)], // home row mod: &hml LALT S
  [13, 0, 0], // &macro_wes
];

const layout: PhysicalLayout = {
  name: "Demo",
  keys: bindings.map((_, i) => ({
    x: (i % 5) * 100,
    y: Math.floor(i / 5) * 100,
    width: 100,
    height: 100,
    r: 0,
    rx: 0,
    ry: 0,
  })),
};

const keymap: KeymapMsg = {
  availableLayers: 0,
  maxLayerNameLength: 20,
  layers: [
    {
      id: 0,
      name: "Base",
      bindings: bindings.map(([behaviorId, param1, param2]) => ({
        behaviorId,
        param1,
        param2,
      })),
    },
    { id: 1, name: "NAV", bindings: [] },
    { id: 2, name: "", bindings: [] },
  ],
};

const meta = {
  title: "Keyboard/Keymap",
  component: Keymap,
  tags: ["autodocs"],
  args: {
    layout,
    keymap,
    behaviors,
    scale: 1,
    selectedLayerIndex: 0,
    selectedKeyPosition: undefined,
    onKeyPositionClicked: fn(),
  },
} satisfies Meta<typeof Keymap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MixedBehaviors: Story = {};
