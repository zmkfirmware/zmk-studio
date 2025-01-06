import { useModalRef } from "./useModalRef";

import NOTICE from "../../NOTICE?raw";
import { GenericModal } from "../components/GenericModal.tsx";

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
      className="min-w-min w-[60vw]"
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
            className="p-1.5 rounded-md bg-gray-100 text-black hover:bg-gray-300"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <pre className="m-4 font-mono text-xs">{NOTICE}</pre>
      </div>
    </GenericModal>
  );
};
