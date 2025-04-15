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
  hid_usage_get_labels,
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

  let usages = useMemo(() => {
    let usages = info?.UsageIds || [];
    if (max || min) {
      usages = usages.filter(
        (i) =>
          (i.Id <= (max || Number.MAX_SAFE_INTEGER) && i.Id >= (min || 0)) ||
          (id === 7 && i.Id >= 0xe0 && i.Id <= 0xe7)
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
            className="rac-hover:bg-base-300 pl-3 relative rac-focus:bg-base-300 cursor-default select-none rac-selected:before:content-['✔'] before:absolute before:left-[0] before:top-[0]"
            id={hid_usage_from_page_and_id(id, i.Id)}
          >
            {i.Name}
          </ListBoxItem>
        )}
      </Collection>
    </Section>
  );
};

const UsageSectionGrid = ({ id, min, max }: UsageSectionProps) => {
  const info = useMemo(() => hid_usage_page_get_ids(id), [id]);

  let usages = useMemo(() => {
    let usages = info?.UsageIds || [];
    if (max || min) {
      usages = usages.filter(
        (i) =>
          (i.Id <= (max || Number.MAX_SAFE_INTEGER) && i.Id >= (min || 0)) ||
          (id === 7 && i.Id >= 0xe0 && i.Id <= 0xe7)
      );
    }

    return usages;
  }, [id, min, max, info]);

  return (
    <Section id={id} className="flex flex-wrap gap-1 pt-12 relative even:text-xs">
      <Header className="text-base-content/50 absolute top-2 left-0 right-0 p-1 bg-primary text-white">{info?.Name}</Header>
      <Collection items={usages}>
        {(i) => (
          <ListBoxItem
            id={hid_usage_from_page_and_id(id, i.Id)}
            className="bg-white rounded border-2 w-16 h-16 overflow-hidden cursor-pointer hover:scale-150 transition-transform"
          >
            {({isSelected}) => {
              const labels = hid_usage_get_labels(id, i.Id, { removePrefix: true })
              console.log(labels)
              return (
              <div className={`p-2 flex justify-center items-center relative w-full h-full ${isSelected ? 'bg-primary text-white' : ''}`}>
                <p className="break-words select-none">
                  {labels.short || labels.med || labels.long || i.Name}
                </p>
                {labels.secondary && (
                  <p className="absolute top-1 right-1 text-xs opacity-80">
                    {labels.secondary}
                  </p>
                )}
              </div>
            )}}
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
    let flags = value ? value >> 24 : 0;

    return all_mods.filter((m) => m & flags).map((m) => m.toLocaleString());
  }, [value]);

  const selectionChanged = useCallback(
    (e: Key | null) => {
      let value = typeof e == "number" ? e : undefined;
      if (value !== undefined) {
        let mod_flags = mods_to_flags(mods.map((m) => parseInt(m)));
        value = value | (mod_flags << 24);
      }

      onValueChanged(value);
    },
    [onValueChanged, mods]
  );

  const modifiersChanged = useCallback(
    (m: string[]) => {
      if (!value) {
        return;
      }

      let mod_flags = mods_to_flags(m.map((m) => parseInt(m)));
      let new_value = mask_mods(value) | (mod_flags << 24);
      onValueChanged(new_value);
    },
    [value]
  );

  console.log("A", value ? mask_mods(value) : null)

  return (
    <div>
      <div className="flex gap-2 relative">
        {label && <Label id="hid-usage-picker">{label}:</Label>}
        <ComboBox
          selectedKey={value ? mask_mods(value) : null}
          onSelectionChange={selectionChanged}
          aria-labelledby="hid-usage-picker"
        >
          <div className="flex">
            <Input className="p-1 rounded-l" />
            <Button className="rounded-r bg-primary text-primary-content w-8 h-8 flex justify-center items-center">
              <ChevronDown className="size-4" />
            </Button>
          </div>
          <Popover className="w-[var(--trigger-width)] max-h-4 shadow-md text-base-content rounded border-base-content bg-base-100">
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
          className="grid grid-flow-col gap-x-px auto-cols-[minmax(min-content,1fr)] content-stretch divide-x rounded-md"
          value={mods}
          onChange={modifiersChanged}
        >
          {all_mods.map((m) => (
            <Checkbox
              key={m}
              value={m.toLocaleString()}
              className="text-nowrap cursor-pointer grid px-2 content-center justify-center rac-selected:bg-primary border-base-100 bg-base-300 hover:bg-base-100 first:rounded-s-md last:rounded-e-md rac-selected:text-primary-content"
            >
              {mod_labels[m]}
            </Checkbox>
          ))}
        </CheckboxGroup>
      </div>
      <ListBox
        items={usagePages}
        selectionMode="single"
        className="block max-h-[30vh] min-h-[unset] overflow-auto p-2"
        selectedKeys={value ? [mask_mods(value)] : []}
        onSelectionChange={({currentKey}: any) => selectionChanged(currentKey)}
        aria-labelledby="hid-usage-picker"
      >
        {({ id, min, max }) => <UsageSectionGrid id={id} min={min} max={max} />}
      </ListBox>
    </div>
  );
};
