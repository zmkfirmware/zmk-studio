import { Modal } from "../components/UI/Modal.tsx";
import { About } from "../components/About.tsx";
import { LicenseNotice } from "../components/LicenseNotice.tsx";

export function Footer () {
  return (
    <div className="grid justify-center p-1 bg-base-200">
      <div>
        <span>&copy; 2024 - The ZMK Contributors</span> -{" "}
        <Modal
          usedFor="footerAbout"
          customWidth="w-11/12 max-w-5xl"
          modalButton={<a> About ZMK Studio</a>}
          hideCloseButton={true}
        >
          <About></About>
        </Modal>
        <Modal
          usedFor="footerLicenseNotice"
          customWidth="w-11/12 max-w-5xl"
          hideCloseButton={true}
          modalButton={<a>License NOTICE</a>}
        >
          <LicenseNotice></LicenseNotice>
        </Modal>
      </div>
    </div>
  );
};
