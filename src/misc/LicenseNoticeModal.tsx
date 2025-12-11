import { FC, PropsWithChildren, useState } from "react";
import NOTICE from "../../NOTICE?raw";
import { Modal, ModalContent } from "../components/modal/Modal";

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
        <ModalContent className="w-9/12 md:max-w-3xl">
          <div className="flex justify-between items-start">
            <p className="mr-2">
              ZMK Studio is released under the open source Apache 2.0 license. A
              copy of the NOTICE file from the ZMK Studio repository is included
              here:
            </p>
          </div>
          <pre className="w-full overflow-auto font-mono text-xs p-3 border border-base-300 rounded-lg bg-base-200">{NOTICE}</pre>
        </ModalContent>
      </Modal>
    </>
  );
};
