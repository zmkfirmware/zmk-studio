import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { BehaviorParametersPicker } from './BehaviorParametersPicker';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Behaviors/BehaviorParametersPicker',
  component: BehaviorParametersPicker,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    // backgroundColor: { control: 'color' },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {
    layerNames: ["Base", "Num"],
    onParam1Changed: fn(),
    onParam2Changed: fn(),
  },
} satisfies Meta<typeof BehaviorParametersPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Example: Story = {
  args: {
    metadata: [
      {
        param1: [{ name: "Const #1", constant: 1 }, { name: "Const #2", constant: 2 }],
        param2: []
      }
    ],
  },
};


export const SecondParamBasedOnFirst: Story = {
  args: {
    param1: 3,
    metadata: [
      {
        param1: [{ name: "Const #1", constant: 1 }, { name: "Const #2", constant: 2 }],
        param2: []
      },
      {
        param1: [{ name: "Const #3", constant: 3}],
        param2: [{ name: "Second Range", range: { min: 0, max: 4 }}],
      },
    ],
  },
};