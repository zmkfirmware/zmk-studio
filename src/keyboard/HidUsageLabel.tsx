import {
  hid_usage_get_labels,
  hid_usage_page_and_id_from_usage,
} from "../hid-usages";

export interface HidUsageLabelProps {
  hid_usage: number;
}

function remove_prefix(s?: string) {
  return s?.replace(/^Keyboard /, "");
}

export const HidUsageLabel = ({ hid_usage }: HidUsageLabelProps) => {
  const [page, id] = hid_usage_page_and_id_from_usage(hid_usage);

  // TODO: Do something with implicit mods!
  let _page = page;

  const labels = hid_usage_get_labels((_page &= 0xff), id);

  return (
    <span
      className="before:content-[attr(aria-label)] @[6em]:before:content-[attr(data-med-content)] @[10em]:before:content-[attr(data-long-content)]"
      aria-label={remove_prefix(labels.short)}
      data-med-content={remove_prefix(labels.med || labels.short)}
      data-long-content={remove_prefix(
        labels.long || labels.med || labels.short,
      )}
    />
  );
};
