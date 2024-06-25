import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { ParameterValuePicker } from "./ParameterValuePicker";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "Behaviors/ParameterValuePicker",
  component: ParameterValuePicker,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    // backgroundColor: { control: 'color' },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
    layerNames: ["Base", "Num"],
    onValueChanged: fn(),
  },
} satisfies Meta<typeof ParameterValuePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Const: Story = {
  args: {
    values: [
      { name: "Const #1", constant: 1 },
      { name: "Const #2", constant: 2 },
    ],
  },
};

export const Range: Story = {
  args: {
    values: [{ name: "Profile", range: { min: 0, max: 4 } }],
  },
};

export const HID: Story = {
  args: {
    values: [{ name: "Key", hidUsage: { consumerMax: 0, keyboardMax: 0 } }],
  },
};

export const LayerIndex: Story = {
  args: {
    values: [{ name: "Layer", layerIndex: {} }],
  },
};
