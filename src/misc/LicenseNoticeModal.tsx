import { useModalRef } from "./useModalRef";

import NOTICE from "../../NOTICE?raw";

export interface LicenseNoticeModalProps {
  open: boolean;
  onClose: () => void;
}

export const LicenseNoticeModal = ({
  open,
  onClose,
}: LicenseNoticeModalProps) => {
  const ref = useModalRef(open);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="p-5 rounded-lg border-text-base border min-w-min w-[60vw]"
    >
      <div>
        <p>
          ZMK Studio is released under the open source Apache 2.0 license. A
          copy of the NOTICE file from the ZMK Studio repository is included
          here:
        </p>
        <pre className="m-4 font-mono text-xs">{NOTICE}</pre>
      </div>
    </dialog>
  );
};
