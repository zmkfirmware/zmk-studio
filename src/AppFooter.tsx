import { AboutModal } from "./AboutModal";
import { LicenseNoticeModal } from "./misc/LicenseNoticeModal";

export const AppFooter = () => {
  return (
    <>
      <div className="w-full flex justify-center gap-2 p-1 bg-base-200 relative z-50">
        <span>&copy; 2024 - The ZMK Contributors</span>
        <span>&ndash;</span>
        <AboutModal>
          <span>About ZMK Studio</span>
        </AboutModal>
        <span>&ndash;</span>
        <LicenseNoticeModal>
          <span>License NOTICE</span>
        </LicenseNoticeModal>
      </div>
    </>
  );
};
