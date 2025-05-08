import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { HidUsagePicker } from "./HidUsagePicker";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "Behaviors/HidUsagePicker",
  component: HidUsagePicker,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
  args: {
    onValueChanged: fn(),
  },
} satisfies Meta<typeof HidUsagePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Keyboard: Story = {
  args: {
    usagePages: [{ id: 7 }],
  },
};

export const KeyboardModSelection: Story = {
  args: {
    usagePages: [{ id: 7 }],
    value: 458756,
  },
};

export const KeyboardAndConsumer: Story = {
  args: {
    usagePages: [{ id: 7 }, { id: 12 }],
  },
};
