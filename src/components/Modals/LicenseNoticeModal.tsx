import NOTICE from "../../../NOTICE?raw";
import { Modal } from "@/components/ui/Modal.tsx"
export function LicenseNoticeModal() {
  return <>
    <Modal
        customModalBoxClass="w-11/14 max-w-4xl"
        close={false}
        success={false}
        type='text'
        text=' License NOTICE'
    >
      <div className="overflow-auto max-h-full">
          <p className="mr-2">
            ZMK Studio is released under the open source Apache 2.0 license. A
            copy of the NOTICE file from the ZMK Studio repository is included
            here:
          </p>
        <pre className="m-4 font-mono text-xs">{ NOTICE }</pre>
      </div>
    </Modal>
  </>;
}
