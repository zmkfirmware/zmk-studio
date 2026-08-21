import {
  hid_usage_get_labels,
  hid_usage_page_and_id_from_usage,
} from "../hid-usages";
import { resolveShiftedChar, Mods } from "../behaviors/modifiers";
import { useLegendLayout } from "./LegendLayoutContext";
import { resolveLayoutLegend } from "./legendLayouts";

export interface HidUsageLabelProps {
  hid_usage: number;
}

function remove_prefix(s?: string) {
  return s?.replace(/^Keyboard /, "");
}

export const HidUsageLabel = ({ hid_usage }: HidUsageLabelProps) => {
  const layout = useLegendLayout();

  let [page, id] = hid_usage_page_and_id_from_usage(hid_usage);

  page &= 0xff;

  const flags = (hid_usage >> 24) & 0xff;
  const isShifted = !!(flags & Mods.LeftShift);

  // Prefer layout-specific override (keyboard page only)
  const layoutLabel = page === 7 ? resolveLayoutLegend(id, isShifted, layout) : null;

  if (layoutLabel !== null) {
    return (
      <span
        className="@[10em]:before:content-[attr(data-long-content)] @[6em]:before:content-[attr(data-med-content)] before:content-[attr(aria-label)]"
        aria-label={layoutLabel}
        data-med-content={layoutLabel}
        data-long-content={layoutLabel}
      />
    );
  }

  let labels = hid_usage_get_labels(page, id);
  const shifted = resolveShiftedChar(hid_usage);

  const label = shifted || remove_prefix(labels.short) || "";

  return (
    <span
      className="@[10em]:before:content-[attr(data-long-content)] @[6em]:before:content-[attr(data-med-content)] before:content-[attr(aria-label)]"
      aria-label={label}
      data-med-content={shifted || remove_prefix(labels.med || labels.short) || ""}
      data-long-content={
        shifted || remove_prefix(labels.long || labels.med || labels.short) || ""
      }
    />
  );
};
