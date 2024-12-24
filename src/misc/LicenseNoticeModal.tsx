import { FC, PropsWithChildren, useState } from "react";
import NOTICE from "../../NOTICE?raw";
import { Modal, ModalContent } from "../modal/Modal";

export const LicenseNoticeModal: FC<PropsWithChildren> = ({ children }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <a
        role="button"
        className="hover:text-primary hover:cursor-pointer"
        onClick={() => setOpen(true)}
      >
        {children}
      </a>
      <Modal open={open} onOpenChange={setOpen}>
        <ModalContent className="w-[60vw]">
          <div className="flex justify-between items-start">
            <p className="mr-2">
              ZMK Studio is released under the open source Apache 2.0 license. A
              copy of the NOTICE file from the ZMK Studio repository is included
              here:
            </p>
          </div>
          <pre className="w-96 m-4 font-mono text-xs">{NOTICE}</pre>
        </ModalContent>
      </Modal>
    </>
  );
};
