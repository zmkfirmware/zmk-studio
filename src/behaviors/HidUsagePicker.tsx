import {
  Button,
  Collection,
  ComboBox,
  Header,
  Input,
  Key,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Section,
} from "react-aria-components";
import {
  hid_usage_from_page_and_id,
  hid_usage_page_get_ids,
} from "../hid-usages";
import { useCallback, useMemo } from "react";

export interface HidUsagePage {
  id: number;
  min?: number;
  max?: number;
}

export interface HidUsagePickerProps {
  label?: string;
  value?: number;
  usagePages: HidUsagePage[];
  onValueChanged: (value?: number) => void;
}

type UsageSectionProps = HidUsagePage;

const UsageSection = ({id, min, max}: UsageSectionProps) => {
  const info = useMemo(() => hid_usage_page_get_ids(id), [id]);

  let usages = useMemo(() => {
    let usages = info?.UsageIds || [];
    if (max || min) {
      usages = usages.filter(i => i.Id <= (max || Number.MAX_SAFE_INTEGER) && i.Id >= (min || 0));
    }

    return usages;
  }, [id, min, max, info]);

  return (
    <Section id={id}>
      <Header className="text-text-base/50">{info?.Name}</Header>
      <Collection items={usages}>
        {(i) => (
          <ListBoxItem
            className="rac-hover:text-accent pl-3 relative rac-focus:text-accent cursur-default select-none rac-selected:before:content-['✔'] before:absolute before:left-[0] before:top-[0]"
            id={hid_usage_from_page_and_id(id, i.Id)}
          >
            {i.Name}
          </ListBoxItem>
        )}
      </Collection>
    </Section>
  );
}

export const HidUsagePicker = ({
  label,
  value,
  usagePages,
  onValueChanged,
}: HidUsagePickerProps) => {
  const selectionChanged = useCallback(
    (e: Key | null) => {
      let value = typeof e == "number" ? e : undefined;
      onValueChanged(value);
    },
    [onValueChanged],
  );

  return (
    <ComboBox selectedKey={value} onSelectionChange={selectionChanged}>
      { label && <Label>{label}</Label> }
      <div>
        <Input className="p-1 rounded" />
        <Button className="ml-[-1.75em] px-[0.25em] py-0 rounded rounded-md bg-accent w-6 h-6">
          ▼
        </Button>
      </div>
      <Popover className="w-[var(--trigger-width)] max-h-4 border rounded border-text-base bg-bg-base">
        <ListBox
          items={usagePages}
          className="block max-h-[30vh] min-h-[unset] overflow-auto m-2"
          selectionMode="single"
        >
          {({id, min, max}) => <UsageSection id={id} min={min} max={max} />}
        </ListBox>
      </Popover>
    </ComboBox>
  );
};
