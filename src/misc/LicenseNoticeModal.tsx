import { useModalRef } from "./useModalRef";

import NOTICE from "../../NOTICE?raw";
import { GenericModal } from "../GenericModal";

export interface LicenseNoticeModalProps {
  open: boolean;
  onClose: () => void;
}

export const LicenseNoticeModal = ({
  open,
  onClose,
}: LicenseNoticeModalProps) => {
  const ref = useModalRef(open, true);

  return (
    <GenericModal
      ref={ref}
      className="w-[60vw] min-w-min"
      onClose={onClose}
    >
      <div>
        <div className="flex items-start justify-between">
          <p className="mr-2">
            ZMK Studio is released under the open source Apache 2.0 license. A
            copy of the NOTICE file from the ZMK Studio repository is included
            here:
          </p>
          <button
            className="rounded-md bg-gray-100 p-1.5 text-black hover:bg-gray-300"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <pre className="font-mono m-4 text-xs">{NOTICE}</pre>
      </div>
    </GenericModal>
  );
};
