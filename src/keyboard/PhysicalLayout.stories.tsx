import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { PhysicalLayout } from "./PhysicalLayout";
import { HidUsageLabel } from "./HidUsageLabel";
import { hid_usage_from_page_and_id } from "../hid-usages";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "Keyboard/PhysicalLayout",
  component: PhysicalLayout,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered"
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

const TOP = [41, ...[..."QWERTYUIOP"].map((c) => c.charCodeAt(0) - 61)];
const MIDDLE = [...[..."ASDFGHJKL"].map((c) => c.charCodeAt(0) - 61), 51];
const LOWER = [
  ...[..."ZXCVBNM"].map((c) => c.charCodeAt(0) - 61),
  54,
  55,
  82,
  229,
];

const MINIVAN_POSITIONS = [
  ...TOP.map((k, i) => ({
    width: 1,
    height: 1,
    x: i,
    y: 0,
    header: "Key Press",
    children: [<HidUsageLabel hid_usage={hid_usage_from_page_and_id(7, k)} />],
  })),
  {
    x: TOP.length,
    y: 0,
    width: 1.75,
    height: 1,
    header: "Key Press",
    children: [<HidUsageLabel hid_usage={hid_usage_from_page_and_id(7, 42)} />],
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
    children: [<HidUsageLabel hid_usage={hid_usage_from_page_and_id(7, k)} />],
  })),
  {
    x: MIDDLE.length + 1.25,
    y: 1,
    width: 1.5,
    height: 1,
    header: "Key Press",
    children: [<HidUsageLabel hid_usage={hid_usage_from_page_and_id(7, 40)} />],
  },
  {
    x: 0,
    y: 2,
    width: 1.75,
    height: 1,
    header: "Key Press",
    children: [
      <HidUsageLabel hid_usage={hid_usage_from_page_and_id(7, 225)} />,
    ],
  },
  ...LOWER.map((k, i) => ({
    x: i + 1.75,
    y: 2,
    width: 1,
    height: 1,
    header: "Key Press",
    children: [<HidUsageLabel hid_usage={hid_usage_from_page_and_id(7, k)} />],
  })),
  {
    x: 0,
    y: 3,
    width: 1.25,
    height: 1,
    header: "Key Press",
    children: [
      <HidUsageLabel hid_usage={hid_usage_from_page_and_id(7, 224)} />,
    ],
  },
  {
    x: 1.25,
    y: 3,
    width: 1.5,
    height: 1,
    header: "Key Press",
    children: [
      <HidUsageLabel hid_usage={hid_usage_from_page_and_id(7, 227)} />,
    ],
  },
  {
    x: 2.75,
    y: 3,
    width: 1.25,
    height: 1,
    header: "Key Press",
    children: [
      <HidUsageLabel hid_usage={hid_usage_from_page_and_id(7, 226)} />,
    ],
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
    children: [
      <HidUsageLabel hid_usage={hid_usage_from_page_and_id(7, 230)} />,
    ],
  },
  {
    x: 9.75,
    y: 3,
    width: 1,
    height: 1,
    header: "Key Press",
    children: [<HidUsageLabel hid_usage={hid_usage_from_page_and_id(7, 80)} />],
  },
  {
    x: 10.75,
    y: 3,
    width: 1,
    height: 1,
    header: "Key Press",
    children: [<HidUsageLabel hid_usage={hid_usage_from_page_and_id(7, 81)} />],
  },
  {
    x: 11.75,
    y: 3,
    width: 1,
    height: 1,
    header: "Key Press",
    children: [<HidUsageLabel hid_usage={hid_usage_from_page_and_id(7, 79)} />],
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
