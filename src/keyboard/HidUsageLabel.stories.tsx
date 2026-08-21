import type { Meta, StoryObj } from "@storybook/react";
import { HidUsageLabel } from "./HidUsageLabel";

// HID usage IDs for the keyboard page (page 7 = 0x07)
// Modifier flags are packed in bits 24-31 (LeftShift = 0x02)
// Full usage = (modifiers << 24) | (page << 16) | id
const KEY_3 = (0x07 << 16) | 0x20; // 3 key (unshifted=3, shifted=# on US, £ on UK)
// Shifted 3: LeftShift modifier (0x02) in bits 24-31, page 7 in bits 16-23, id 0x20
const SHIFTED_3 = (0x02 << 24) | (0x07 << 16) | 0x20;

const meta = {
  title: "Keyboard/HidUsageLabel",
  component: HidUsageLabel,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof HidUsageLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const US_3_Unshifted: Story = {
  name: "US layout: 3 key (unshifted → '3')",
  args: {
    hid_usage: KEY_3,
    legendLayout: "us",
  },
};

export const US_3_Shifted: Story = {
  name: "US layout: 3 key shifted → '#'",
  args: {
    hid_usage: SHIFTED_3,
    legendLayout: "us",
  },
};

export const UK_3_Unshifted: Story = {
  name: "UK layout: 3 key (unshifted → '3')",
  args: {
    hid_usage: KEY_3,
    legendLayout: "uk",
  },
};

export const UK_3_Shifted: Story = {
  name: "UK layout: 3 key shifted → '£'",
  args: {
    hid_usage: SHIFTED_3,
    legendLayout: "uk",
  },
};

export const US_2_Shifted: Story = {
  name: "US layout: 2 key shifted → '@'",
  args: {
    hid_usage: (0x02 << 24) | (0x07 << 16) | 0x1f,
    legendLayout: "us",
  },
};

export const UK_2_Shifted: Story = {
  name: "UK layout: 2 key shifted → '\"'",
  args: {
    hid_usage: (0x02 << 24) | (0x07 << 16) | 0x1f,
    legendLayout: "uk",
  },
};
