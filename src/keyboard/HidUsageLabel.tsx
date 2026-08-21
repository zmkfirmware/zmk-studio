import {
  hid_usage_get_labels,
  hid_usage_page_and_id_from_usage,
} from "../hid-usages";
import { isShiftModifier, resolveShiftedChar } from "../behaviors/modifiers";
import {
  LegendLayoutId,
  resolveLegend,
} from "./legendLayouts";

export interface HidUsageLabelProps {
  hid_usage: number;
  legendLayout?: LegendLayoutId;
}

function remove_prefix(s?: string) {
  return s?.replace(/^Keyboard /, "");
}

export const HidUsageLabel = ({
  hid_usage,
  legendLayout = "us",
}: HidUsageLabelProps) => {
  let [page, id] = hid_usage_page_and_id_from_usage(hid_usage);

  page &= 0xff;

  let labels = hid_usage_get_labels(page, id);
  const shifted = resolveShiftedChar(hid_usage);
  const isShifted = isShiftModifier(hid_usage);

  // Rendering precedence:
  // 1) locale/layout legend result (if present)
  // 2) existing shifted char logic
  // 3) existing HID usage label fallback
  const localeLabel = resolveLegend(legendLayout, id, isShifted);

  const label = localeLabel ?? shifted ?? remove_prefix(labels.short) ?? "";

  return (
    <span
      className="@[10em]:before:content-[attr(data-long-content)] @[6em]:before:content-[attr(data-med-content)] before:content-[attr(aria-label)]"
      aria-label={label}
      data-med-content={localeLabel ?? shifted ?? remove_prefix(labels.med || labels.short) ?? ""}
      data-long-content={
        localeLabel ?? shifted ?? remove_prefix(labels.long || labels.med || labels.short) ?? ""
      }
    />
  );
};
