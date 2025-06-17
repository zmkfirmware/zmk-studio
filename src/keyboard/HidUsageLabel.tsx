import {
  hid_usage_get_labels,
  hid_usage_page_and_id_from_usage,
} from "../hid-usages";
import * as icons from "lucide-react";

export interface HidUsageLabelProps {
  hid_usage: number;
}

function remove_prefix(s?: string) {
  return s?.replace(/^Keyboard /, "");
}

export const HidUsageLabel = ({ hid_usage }: HidUsageLabelProps) => {
  const [page_raw, id] = hid_usage_page_and_id_from_usage(hid_usage);

  // TODO: Do something with implicit mods!
  const page = page_raw & 0xff;

  const labels = hid_usage_get_labels(page, id);

  // If an icon is defined, render it
  if (labels.icon) {
    // Convert kebab-case to PascalCase for the icon component name
    const iconName = labels.icon
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    const IconComponent = (icons as unknown as Record<string, React.ComponentType<{ className?: string; 'aria-label'?: string }>>)[iconName];

    if (IconComponent) {
      return <IconComponent className="w-4 h-4" aria-label={remove_prefix(labels.short)} />;
    }
  }

  // Fall back to text labels
  return (
    <span
      className="@[10em]:before:content-[attr(data-long-content)] @[6em]:before:content-[attr(data-med-content)] before:content-[attr(aria-label)]"
      aria-label={remove_prefix(labels.short)}
      data-med-content={remove_prefix(labels.med || labels.short)}
      data-long-content={remove_prefix(
        labels.long || labels.med || labels.short
      )}
    />
  );
};