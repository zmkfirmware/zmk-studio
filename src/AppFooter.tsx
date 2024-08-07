export interface AppFooterProps {
  onShowAbout: () => void;
  onShowLicenseNotice: () => void;
}

export const AppFooter = ({
  onShowAbout,
  onShowLicenseNotice,
}: AppFooterProps) => {
  return (
    <div className="grid justify-center m-1">
      <div>
        <span>&copy; 2024 - The ZMK Contributors</span> -{" "}
        <a href="#" onClick={onShowAbout}>
          About ZMK Studio
        </a>{" "}
        -{" "}
        <a href="#" onClick={onShowLicenseNotice}>
          License NOTICE
        </a>
      </div>
    </div>
  );
};
