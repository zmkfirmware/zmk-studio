import type { Meta, StoryObj } from "@storybook/react";
import { Modal as ModalComponent, ModalContent as Content } from "./Modal";

import { useState } from "react";
import { ModalContent } from "./ModalContent.stories";
import { ZmkStudio } from "../ZmkStudio";

const meta = {
  title: "UI/Modal",
  component: ModalComponent,
  subcomponents: {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ModalContent: Content,
  },
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    open: false,
    onOpenChange: () => {},
    onBackdropClose: false,
    onEscapeClose: true,
  },
  argTypes: {
    open: {
      control: {
        type: "boolean",
      },
    },
    onBackdropClose: {
      control: {
        type: "boolean",
      },
    },
    onEscapeClose: {
      control: {
        type: "boolean",
      },
    },
  },
} satisfies Meta<typeof ModalComponent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Modal: Story = {
  args: {
    onBackdropClose: true,
    onEscapeClose: true,
  },

  render: (args) => {
    const [open, setOpen] = useState(args.open);
    return (
      <>
        <button onClick={() => setOpen(true)}>Open</button>
        <ModalComponent
          open={open}
          onOpenChange={setOpen}
          onBackdropClose={args.onBackdropClose}
          onEscapeClose={args.onEscapeClose}
        >
          <Content {...ModalContent.args}>
            <ZmkStudio />
            <div>Hello World</div>
          </Content>
        </ModalComponent>
      </>
    );
  },
};
