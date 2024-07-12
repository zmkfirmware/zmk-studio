import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { LayerPicker } from "./LayerPicker";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "Keyboard/LayerPicker",
  component: LayerPicker,
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
    onLayerClicked: fn(),
  },
} satisfies Meta<typeof LayerPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Named: Story = {
  args: {
    layers: [
      { id: 1, name: "Base" },
      { id: 2, name: "Num" },
      { id: 3, name: "Nav" },
      { id: 4, name: "Symbol" },
    ],
    selectedLayerIndex: 2,
  },
};

export const NoNames: Story = {
  args: {
    layers: [{ id: 1 }, { id: 2 }, { id: 3 }],
    selectedLayerIndex: 0,
  },
};
