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
import { ChevronDown } from "lucide-react";

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

const UsageSection = ({ id, min, max }: UsageSectionProps) => {
  const info = useMemo(() => hid_usage_page_get_ids(id), [id]);

  const usages = useMemo(() => {
    let usages = info?.UsageIds || [];
    if (max || min) {
      usages = usages.filter(
        (i) =>
          (i.Id <= (max || Number.MAX_SAFE_INTEGER) && i.Id >= (min || 0)) ||
          (id === 7 && i.Id >= 0xe0 && i.Id <= 0xe7),
      );
    }

    return usages;
  }, [id, min, max, info]);

  return (
    <Section id={id}>
      <Header className="text-base-content/50">{info?.Name}</Header>
      <Collection items={usages}>
        {(i) => (
          <ListBoxItem
            className="relative cursor-default select-none pl-3 before:absolute before:left-0 before:top-0 rac-hover:bg-base-300 rac-focus:bg-base-300 rac-selected:before:content-['✔']"
            id={hid_usage_from_page_and_id(id, i.Id)}
            key={i.Id}
          >
            {i.Name}
          </ListBoxItem>
        )}
      </Collection>
    </Section>
  );
};

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
};

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
  return value & ~(mods_to_flags(all_mods) << 24);
}

export const HidUsagePicker = ({
  label,
  value,
  usagePages,
  onValueChanged,
}: HidUsagePickerProps) => {
  const mods = useMemo(() => {
    const flags = value ? value >> 24 : 0;

    return all_mods.filter((m) => m & flags).map((m) => m.toLocaleString());
  }, [value]);

  const selectionChanged = useCallback(
    (e: Key | null) => {
      let value = typeof e == "number" ? e : undefined;
      if (value !== undefined) {
        const mod_flags = mods_to_flags(mods.map((m) => parseInt(m)));
        value = value | (mod_flags << 24);
      }

      onValueChanged(value);
    },
    [onValueChanged, mods],
  );

  const modifiersChanged = useCallback(
    (m: string[]) => {
      if (!value) {
        return;
      }

      const mod_flags = mods_to_flags(m.map((m) => parseInt(m)));
      const new_value = mask_mods(value) | (mod_flags << 24);
      onValueChanged(new_value);
    },
    [onValueChanged, value],
  );

  return (
    <div className="relative flex gap-2">
      {label && <Label id="hid-usage-picker">{label}:</Label>}
      <ComboBox
        selectedKey={value ? mask_mods(value) : null}
        onSelectionChange={selectionChanged}
        aria-labelledby="hid-usage-picker"
      >
        <div className="flex">
          <Input className="rounded-l p-1" />
          <Button className="flex size-8 items-center justify-center rounded-r bg-primary text-primary-content">
            <ChevronDown className="size-4" />
          </Button>
        </div>
        <Popover className="max-h-4 w-[var(--trigger-width)] rounded border-base-content bg-base-100 text-base-content shadow-md">
          <ListBox
            items={usagePages}
            className="block max-h-[30vh] min-h-[unset] overflow-auto p-2"
            selectionMode="single"
          >
            {({ id, min, max }) => <UsageSection id={id} min={min} max={max} />}
          </ListBox>
        </Popover>
      </ComboBox>
      <CheckboxGroup
        aria-label="Implicit Modifiers"
        className="grid auto-cols-[minmax(min-content,1fr)] grid-flow-col content-stretch gap-x-px divide-x rounded-md"
        value={mods}
        onChange={modifiersChanged}
      >
        {all_mods.map((m) => (
          <Checkbox
            key={m.toLocaleString()}
            value={m.toLocaleString()}
            className="grid cursor-pointer content-center justify-center text-nowrap border-base-100 bg-base-300 px-2 first:rounded-s-md last:rounded-e-md hover:bg-base-100 rac-selected:bg-primary rac-selected:text-primary-content"
          >
            {mod_labels[m]}
          </Checkbox>
        ))}
      </CheckboxGroup>
    </div>
  );
};
