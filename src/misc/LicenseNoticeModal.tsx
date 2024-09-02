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
  const ref = useModalRef(open, onClose);

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center ${open ? "" : "hidden"}`}
    >
      <dialog
        ref={ref}
        className="p-5 rounded-lg border-text-base border min-w-min w-[60vw]"
        open={open}
        onClose={onClose}
      >
        <div>
          <div className="flex justify-between items-start">
            <p className="mr-2">
              ZMK Studio is released under the open source Apache 2.0 license. A
              copy of the NOTICE file from the ZMK Studio repository is included
              here:
            </p>
            <button
              className="p-1.5 rounded-md bg-gray-200 text-black hover:bg-gray-300"
              onClick={onClose}
            >
              Close
            </button>
          </div>
          <pre className="m-4 font-mono text-xs">{NOTICE}</pre>
        </div>
      </dialog>
    </div>
  );
};
