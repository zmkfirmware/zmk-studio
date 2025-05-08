import {
  hid_usage_get_labels,
  hid_usage_page_and_id_from_usage,
} from "../hid-usages";

export interface HidUsageLabelProps {
  hid_usage: number;
}
export const HidUsageLabel = ({ hid_usage }: HidUsageLabelProps) => {
  let [page, id] = hid_usage_page_and_id_from_usage(hid_usage);

  // TODO: Do something with implicit mods!
  page &= 0xff;

  let labels = hid_usage_get_labels(page, id, {
    removePrefix: true,
  });

  return (
    <span
      className="@[10em]:before:content-[attr(data-long-content)] @[6em]:before:content-[attr(data-med-content)] before:content-[attr(aria-label)]"
      aria-label={(labels.short)}
      data-med-content={(labels.med || labels.short)}
      data-long-content={(
        labels.long || labels.med || labels.short
      )}
    />
  );
};
