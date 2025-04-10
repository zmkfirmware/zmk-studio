export interface AppFooterProps {
  onShowAbout: () => void;
  onShowLicenseNotice: () => void;
}

export const AppFooter = ({
  onShowAbout,
  onShowLicenseNotice,
}: AppFooterProps) => {
  return (
    <div className="grid justify-center p-1 bg-base-200 text-xs">
      <div>
        <span>&copy; 2024 - The ZMK Contributors</span> -{" "}
        <a className="hover:text-primary hover:cursor-pointer" onClick={onShowAbout}>
          About ZMK Studio
        </a>{" "}
        -{" "}
        <a className="hover:text-primary hover:cursor-pointer" onClick={onShowLicenseNotice}>
          License NOTICE
        </a>
      </div>
    </div>
  );
};
