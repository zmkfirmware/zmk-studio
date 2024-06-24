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

export interface HidUsagePickerProps {
  value?: number;
  usagePages: number[];
  onValueChanged: (value?: number) => void;
}

export const HidUsagePicker = ({
  value,
  usagePages,
  onValueChanged,
}: HidUsagePickerProps) => {
  let pageObjects = useMemo(() => {
    return usagePages
      .map((p) => ({ id: p, info: hid_usage_page_get_ids(p) }))
      .filter((i) => !!i.info);
  }, [usagePages]);

  const selectionChanged = useCallback(
    (e: Key | null) => {
      let value = typeof e == "number" ? e : undefined;
      onValueChanged(value);
    },
    [onValueChanged],
  );

  return (
    <ComboBox selectedKey={value} onSelectionChange={selectionChanged}>
      <Label>HID Usage</Label>
      <div>
        <Input className="p-1 rounded" />
        <Button className="ml-[-1.75em] px-[0.25em] py-0 rounded rounded-md bg-accent w-6 h-6">
          ▼
        </Button>
      </div>
      <Popover className="w-[var(--trigger-width)] max-h-4 border rounded border-text-base bg-bg-base">
        <ListBox
          items={pageObjects}
          className="block max-h-[30vh] min-h-[unset] overflow-auto m-2"
          selectionMode="single"
        >
          {(p) => (
            <Section id={p.id}>
              <Header className="text-text-base/50">{p.info?.Name}</Header>
              <Collection items={p.info?.UsageIds}>
                {(i) => (
                  <ListBoxItem
                    className="rac-hover:text-accent ml-2 rac-focus:text-accent cursur-default select-none"
                    id={hid_usage_from_page_and_id(p.id, i.Id)}
                  >
                    {i.Name}
                  </ListBoxItem>
                )}
              </Collection>
            </Section>
          )}
        </ListBox>
      </Popover>
    </ComboBox>
  );
};
