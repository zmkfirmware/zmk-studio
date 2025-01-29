import { Modal } from "../components/UI/Modal.tsx";
import { About } from "../components/Modals/About.tsx";
import { LicenseNotice } from "../components/Modals/LicenseNotice.tsx";

export function Footer () {
  return (
    <div className="grid justify-center p-1 bg-base-200">
      <div>
        <span>&copy; 2024 - The ZMK Contributors</span> -{" "}
        <Modal
          usedFor="footerAbout"
          customModalBoxClass="w-11/12 max-w-5xl"
          modalButton={<a> About ZMK Studio</a>}
          hideCloseButton={true}
        >
          <About></About>
        </Modal>
        <Modal
          usedFor="footerLicenseNotice"
          customModalBoxClass="w-11/12 max-w-5xl"
          hideCloseButton={true}
          modalButton={<a>License NOTICE</a>}
        >
          <LicenseNotice></LicenseNotice>
        </Modal>
      </div>
    </div>
  );
};
