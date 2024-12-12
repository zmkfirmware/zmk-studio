export interface AppFooterProps {
  onShowAbout: () => void;
  onShowLicenseNotice: () => void;
}

export const AppFooter = ({
  onShowAbout,
  onShowLicenseNotice,
}: AppFooterProps) => {
  return (
    <div className="grid justify-center bg-base-200 p-1">
      <div>
        <span>&copy; 2024 - The ZMK Contributors</span> -{" "}
        <a className="hover:cursor-pointer hover:text-primary" onClick={onShowAbout}>
          About ZMK Studio
        </a>{" "}
        -{" "}
        <a className="hover:cursor-pointer hover:text-primary" onClick={onShowLicenseNotice}>
          License NOTICE
        </a>
      </div>
    </div>
  );
};
