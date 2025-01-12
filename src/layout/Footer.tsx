import { Modal } from "../components/Modal.tsx";
import { About } from "../components/About.tsx";
import { LicenseNotice } from "../components/LicenseNotice.tsx";

export interface AppFooterProps {
  onShowAbout: () => void;
  onShowLicenseNotice: () => void;
}

export const Footer = ({
  onShowAbout,
  onShowLicenseNotice,
}: AppFooterProps) => {
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
        {/*<a*/}
        {/*  className="hover:text-primary hover:cursor-pointer"*/}
        {/*  onClick={onShowAbout}*/}
        {/*>*/}
        {/*  About ZMK Studio*/}
        {/*</a>*/} -{" "}
        <Modal
          usedFor="footerLicenseNotice"
          customWidth="w-11/12 max-w-5xl"
          hideCloseButton={true}
          modalButton={<a>License NOTICE</a>}
        >
          <LicenseNotice></LicenseNotice>
        </Modal>
        {/*<a*/}
        {/*  className="hover:text-primary hover:cursor-pointer"*/}
        {/*  onClick={onShowLicenseNotice}*/}
        {/*>*/}
        {/*  License NOTICE*/}
        {/*</a>*/}
      </div>
    </div>
  );
};
