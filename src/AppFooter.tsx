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
        <a className="hover:text-accent hover:cursor-pointer" onClick={onShowAbout}>
          About ZMK Studio
        </a>{" "}
        -{" "}
        <a className="hover:text-accent hover:cursor-pointer" onClick={onShowLicenseNotice}>
          License NOTICE
        </a>
      </div>
    </div>
  );
};
