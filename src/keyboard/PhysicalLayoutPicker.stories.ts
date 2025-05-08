import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { PhysicalLayoutPicker } from "./PhysicalLayoutPicker";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "Keyboard/PhysicalLayoutPicker",
  component: PhysicalLayoutPicker,
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
    onPhysicalLayoutClicked: fn(),
  },
} satisfies Meta<typeof PhysicalLayoutPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Standard: Story = {
  args: {
    layouts: [
      {
        name: "ISO",
        keys: [1, 2, 3].map((x) => ({
          x: x * 100,
          y: 0,
          width: 100,
          height: 100,
        })),
      },
      {
        name: "ANSI",
        keys: [1, 2, 3, 4].map((x) => ({
          x: x * 100,
          y: 0,
          width: 100,
          height: 100,
        })),
      },
    ],
    selectedPhysicalLayoutIndex: 1,
  },
};
