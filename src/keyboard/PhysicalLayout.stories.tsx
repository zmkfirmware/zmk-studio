import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { PhysicalLayout } from "./PhysicalLayout";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "Keyboard/PhysicalLayout",
  component: PhysicalLayout,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {},
  args: {
    onPositionClicked: fn(),
  },
} satisfies Meta<typeof PhysicalLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

const TOP = ["Esc", ..."QWERTYUIOP"];
const MIDDLE = [..."ASDFGHJKL;"];
const LOWER = [..."ZXCVBNM<>", "Up", "Shift"];

const MINIVAN_POSITIONS = [
  ...TOP.map((k, i) => ({
    width: 1,
    height: 1,
    x: i,
    y: 0,
    header: "Key Press",
    children: [<span>{k}</span>],
  })),
  {
    x: TOP.length,
    y: 0,
    width: 1.75,
    height: 1,
    header: "Key Press",
    children: [<span>Backspace</span>],
  },
  {
    x: 0,
    y: 1,
    width: 1.25,
    height: 1,
    header: "Key Press",
    children: [<span>Tab</span>],
  },
  ...MIDDLE.map((k, i) => ({
    x: i + 1.25,
    y: 1,
    width: 1,
    height: 1,
    header: "Key Press",
    children: [<span>{k}</span>],
  })),
  {
    x: MIDDLE.length + 1.25,
    y: 1,
    width: 1.5,
    height: 1,
    header: "Key Press",
    children: [<span>Enter</span>],
  },
  {
    x: 0,
    y: 2,
    width: 1.75,
    height: 1,
    header: "Key Press",
    children: [<span>Shift</span>],
  },
  ...LOWER.map((k, i) => ({
    x: i + 1.75,
    y: 2,
    width: 1,
    height: 1,
    header: "Key Press",
    children: [<span>{k}</span>],
  })),
  {
    x: 0,
    y: 3,
    width: 1.25,
    height: 1,
    header: "Key Press",
    children: [<span>Control</span>],
  },
  {
    x: 1.25,
    y: 3,
    width: 1.5,
    height: 1,
    header: "Key Press",
    children: [<span>Code</span>],
  },
  {
    x: 2.75,
    y: 3,
    width: 1.25,
    height: 1,
    header: "Key Press",
    children: [<span>Alt</span>],
  },
  {
    x: 4,
    y: 3,
    width: 2.25,
    height: 1,
    header: "Key Press",
    children: [<span></span>],
  },
  {
    x: 6.25,
    y: 3,
    width: 2,
    height: 1,
    header: "Key Press",
    children: [<span></span>],
  },
  {
    x: 8.25,
    y: 3,
    width: 1.5,
    height: 1,
    header: "Key Press",
    children: [<span>Alt</span>],
  },
  {
    x: 9.75,
    y: 3,
    width: 1,
    height: 1,
    header: "Key Press",
    children: [<span>Left</span>],
  },
  {
    x: 10.75,
    y: 3,
    width: 1,
    height: 1,
    header: "Key Press",
    children: [<span>Down</span>],
  },
  {
    x: 11.75,
    y: 3,
    width: 1,
    height: 1,
    header: "Key Press",
    children: [<span>Right</span>],
  },
];

export const Minivan: Story = {
  args: {
    positions: MINIVAN_POSITIONS,
    hoverZoom: true,
  },
};

export const MiniMinivan: Story = {
  args: {
    positions: MINIVAN_POSITIONS.map(({ x, y, width, height }) => ({
      x,
      y,
      width,
      height,
    })),
    oneU: 15,
    hoverZoom: false,
  },
};
