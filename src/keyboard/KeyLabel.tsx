import {
    hid_usage_get_labels,
    hid_usage_page_and_id_from_usage,
} from "../hid-usages";

export interface KeyLabel {
    hid_usage: number;
    behavior_name: string;
}

function remove_prefix(s?: string) {
    return s?.replace(/^Keyboard /, "");
}

function generate_short_label_from_behavior_name(behavior_name: string) {
    // First remove "Keyboard" prefix if present
    const clean_name = behavior_name.replace(/^Keyboard /, "");

    // Check if name has sections divided by "_" and/or "-" delimiters
    const sections = clean_name.split(/[_-]/);

    if (sections.length > 1) {
        // Take first letter of each section up to 3 letters
        return sections.slice(0, 3).map(section => section.charAt(0)).join('').toUpperCase();
    } else {
        // No delimiters found, use first 3 letters of behavior name instead
        return clean_name.substring(0, 3).toUpperCase();
    }
}

export const KeyLabel = ({ hid_usage, behavior_name }: KeyLabel) => {
    let [page, id] = hid_usage_page_and_id_from_usage(hid_usage);

    // TODO: Do something with implicit mods!
    page &= 0xff;

    const labels = hid_usage_get_labels(page, id);

    // If no HID short label is found/set, from the behavior's first parameter
    if (!labels.short) {
        if (behavior_name !== "None") {
            labels.short = generate_short_label_from_behavior_name(behavior_name);
        }
    }

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
