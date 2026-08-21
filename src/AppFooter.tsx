import { LEGEND_LAYOUTS } from "./keyboard/legendLayouts";

export interface AppFooterProps {
  onShowAbout: () => void;
  onShowLicenseNotice: () => void;
  legendLayoutId: string;
  onLegendLayoutChange: (id: string) => void;
}

export const AppFooter = ({
  onShowAbout,
  onShowLicenseNotice,
  legendLayoutId,
  onLegendLayoutChange,
}: AppFooterProps) => {
  return (
    <div className="grid justify-center p-1 bg-base-200">
      <div className="flex items-center gap-4">
        <span>&copy; 2026 - The ZMK Contributors</span> -{" "}
        <a className="hover:text-primary hover:cursor-pointer" onClick={onShowAbout}>
          About ZMK Studio
        </a>{" "}
        -{" "}
        <a className="hover:text-primary hover:cursor-pointer" onClick={onShowLicenseNotice}>
          License NOTICE
        </a>
        <label className="flex items-center gap-1 ml-4 text-sm">
          <span>Key Legend:</span>
          <select
            className="h-6 rounded px-1 bg-base-100"
            value={legendLayoutId}
            onChange={(e) => onLegendLayoutChange(e.target.value)}
          >
            {Object.entries(LEGEND_LAYOUTS).map(([id, layout]) => (
              <option key={id} value={id}>
                {layout.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
};
