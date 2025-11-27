import {
  hid_usage_get_metadata,
  hid_usage_page_and_id_from_usage,
} from "../hid-usages";

export interface HidUsageLabelProps {
  hid_usage: number;
}

function remove_prefix(s?: string) {
  return s?.replace(/^Keyboard /, "");
}

export const HidUsageLabel = ({ hid_usage }: HidUsageLabelProps) => {
  let [page, id] = hid_usage_page_and_id_from_usage(hid_usage);

  // TODO: Do something with implicit mods!
  page &= 0xff;

  let labels = hid_usage_get_metadata(page, id);

  return (
    <span
      className="@[10em]:before:content-[attr(data-long-content)] @[6em]:before:content-[attr(data-med-content)] before:content-[attr(aria-label)]"
      aria-label={labels.short}
      data-med-content={labels.med || labels.short}
      data-long-content={remove_prefix(
        labels.long || labels.med || labels.short
      )}
    />
  );
};
