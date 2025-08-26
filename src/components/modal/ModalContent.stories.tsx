import type { Meta, StoryObj } from "@storybook/react";
import { Modal as ModalComponent, ModalContent as Content } from "./Modal";
import { ZmkStudio } from "../ZmkStudio";

const meta = {
  title: "UI/Modal/ModalContent",
  component: Content,
  parameters: {
    layout: "centered",
  },
  tags: [],
  args: {
    showCloseButton: true,
    className: "max-w-2xl min-h-48",
  },
  argTypes: {
    className: {
      control: {
        type: "text",
      },
    },
    showCloseButton: {
      defaultValue: true,
      control: {
        type: "boolean",
      },
    },
  },
} satisfies Meta<typeof Content>;

export default meta;
type ModalContentStory = StoryObj<typeof meta>;

export const ModalContent: ModalContentStory = {
  args: {
    showCloseButton: true,
    className: "max-w-2xl min-h-48",
  },
  render: (args) => (
    <ModalComponent open={true} onOpenChange={() => {}}>
      <Content {...args}>
        <ZmkStudio />
        <div>Hello World</div>
      </Content>
    </ModalComponent>
  ),
};
