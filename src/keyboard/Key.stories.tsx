import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Key } from "./Key";
import { Hand, Layers, Pin } from "lucide-react";

const meta = {
  title: "Keyboard/Key",
  component: Key,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
  args: { oneU: 48, onClick: fn() },
} satisfies Meta<typeof Key>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {
    width: 1,
    height: 1,
    header: "Key Press",
    children: [<span key="a">A</span>],
  },
};

export const Selected: Story = {
  args: {
    selected: true,
    width: 1,
    height: 1,
    header: "Key Press",
    children: [<span key="b">B</span>],
  },
};

export const Large: Story = {
  args: {
    width: 2,
    height: 1,
    header: "Key Press",
    children: [<span key="c">C</span>],
  },
};

export const WithIcon: Story = {
  name: "With Behavior Icon",
  args: {
    width: 1,
    height: 1,
    header: "Hold Tap",
    icon: Hand,
    children: [<span key="a">A</span>],
  },
};

export const WithHoldLabel: Story = {
  name: "With Hold Label",
  args: {
    width: 1,
    height: 1,
    header: "Hold Tap",
    icon: Hand,
    holdLabel: "Shift",
    children: [<span key="a">A</span>],
  },
};

export const WithLayerColor: Story = {
  name: "Layer Color (blue)",
  args: {
    width: 1,
    height: 1,
    header: "Hold Tap",
    icon: Layers,
    holdLabel: "Lower",
    layerColor: "#3b82f620",
    children: [<span key="a">A</span>],
  },
};

export const ModTapFull: Story = {
  name: "Mod-Tap (all features)",
  args: {
    width: 1,
    height: 1,
    header: "Hold Tap",
    icon: Hand,
    tooltip: "Hold Tap: A, Hold: L Shift",
    holdLabel: "Shift",
    children: [<span key="a">A</span>],
  },
};

export const LayerTapFull: Story = {
  name: "Layer-Tap (all features)",
  args: {
    width: 1,
    height: 1,
    header: "Hold Tap",
    icon: Layers,
    tooltip: "Hold Tap: Space, Hold: Raise",
    holdLabel: "Raise",
    layerColor: "#22c55e20",
    children: [<span key="spc">Spc</span>],
  },
};

export const StickyKey: Story = {
  name: "Sticky Key",
  args: {
    width: 1,
    height: 1,
    header: "Stcky Key",
    icon: Pin,
    children: [<span key="shft">⇧</span>],
  },
};
