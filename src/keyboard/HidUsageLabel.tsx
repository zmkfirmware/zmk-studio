import { hidUsageDisplay } from "./key-symbols";

export interface HidUsageLabelProps {
  hid_usage: number;
}

export const HidUsageLabel = ({ hid_usage }: HidUsageLabelProps) => {
  const { text, icon: Icon, title } = hidUsageDisplay(hid_usage);

  return Icon ? (
    <Icon size={20} aria-label={title} />
  ) : (
    <span title={title} aria-label={title}>
      {text}
    </span>
  );
};
