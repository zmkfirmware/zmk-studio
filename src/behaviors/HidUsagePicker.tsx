import {
  Button,
  Checkbox,
  CheckboxGroup,
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

enum Mods {
  LeftControl = 0x01,
  LeftShift = 0x02,
  LeftAlt = 0x04,
  LeftGUI = 0x08,
  RightControl = 0x10,
  RightShift = 0x20,
  RightAlt = 0x40,
  RightGUI = 0x80,
}

const mod_labels: Record<Mods, string> = {
  [Mods.LeftControl]: "L Ctrl",
  [Mods.LeftShift]: "L Shift",
  [Mods.LeftAlt]: "L Alt",
  [Mods.LeftGUI]: "L GUI",
  [Mods.RightControl]: "R Ctrl",
  [Mods.RightShift]: "R Shift",
  [Mods.RightAlt]: "R Alt",
  [Mods.RightGUI]: "R GUI",
}

const all_mods = [
  Mods.LeftControl,
  Mods.LeftShift,
  Mods.LeftAlt,
  Mods.LeftGUI,
  Mods.RightControl,
  Mods.RightShift,
  Mods.RightAlt,
  Mods.RightGUI,
];

function mods_to_flags(mods: Mods[]): number {
  return mods.reduce((a, v) => a + v, 0);
}

function mask_mods(value: number) {
  return (value & ~(mods_to_flags(all_mods) << 24));
}

export const HidUsagePicker = ({
  label,
  value,
  usagePages,
  onValueChanged,
}: HidUsagePickerProps) => {
  const mods = useMemo(() => {
    let flags = value ? (value >> 24) : 0;

    return all_mods.filter(m => m & flags).map(m => m.toLocaleString());
  }, [value]);

  const selectionChanged = useCallback(
    (e: Key | null) => {
      let value = typeof e == "number" ? e : undefined;
      if (value !== undefined) {
        let mod_flags = mods_to_flags(mods.map(m => parseInt(m)));
        value = value | (mod_flags << 24);
      }

      onValueChanged(value);
    },
    [onValueChanged, mods],
  );

  const modifiersChanged = useCallback((m: string[]) => {
    if (!value) {
      return;
    }

    let mod_flags = mods_to_flags(m.map(m => parseInt(m)));
    let new_value = mask_mods(value) | (mod_flags << 24);
    onValueChanged(new_value);
  }, [value]);

  return (
    <div className="flex mt-8 relative">
      <ComboBox selectedKey={value ? mask_mods(value) : undefined} onSelectionChange={selectionChanged}>
        { label && <Label className="absolute top-[-1.75em] left-[0.25em]">{label}</Label> }
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
      <CheckboxGroup aria-label="Implicit Modifiers" className="grid grid-flow-col gap-x-px auto-cols-fr content-stretch divide-x rounded border border-text-base" value={mods} onChange={modifiersChanged}>
        { all_mods.map(m => <Checkbox key={m} value={m.toLocaleString()} className="text-nowrap grid content-center justify-center rac-selected:bg-secondary first:rounded-s last:rounded-e">{mod_labels[m]}</Checkbox> )}
      </CheckboxGroup>
    </div>
  );
};
