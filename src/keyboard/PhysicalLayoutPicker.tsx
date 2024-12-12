import {
  Button,
  Key,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
  Text,
} from "react-aria-components";
import { PhysicalLayout, type KeyPosition } from "./PhysicalLayout";
import { useCallback } from "react";

export interface PhysicalLayoutItem {
  name: string;
  keys: Array<KeyPosition>;
}

export type PhysicalLayoutClickCallback = (index: number) => void;

export interface PhysicalLayoutPickerProps {
  layouts: Array<PhysicalLayoutItem>;

  selectedPhysicalLayoutIndex: number;

  onPhysicalLayoutClicked?: PhysicalLayoutClickCallback;
}

export const PhysicalLayoutPicker = ({
  layouts,
  selectedPhysicalLayoutIndex,
  onPhysicalLayoutClicked,
}: PhysicalLayoutPickerProps) => {
  const selectionChanged = useCallback(
    (e: Key) => {
      onPhysicalLayoutClicked?.(layouts.findIndex((l) => l.name === e));
    },
    [layouts, onPhysicalLayoutClicked]
  );

  return (
    <Select
      onSelectionChange={selectionChanged}
      className="flex flex-col"
      selectedKey={layouts[selectedPhysicalLayoutIndex].name}
    >
      <Label className="text-sm after:content-[':']">Layout</Label>
      <Button className="ml-2 min-w-24 rounded p-1 text-left hover:bg-base-300">
        <SelectValue<PhysicalLayoutItem>>
          {(v) => {
            return <span>{v.selectedItem?.name}</span>;
          }}
        </SelectValue>
      </Button>
      <Popover className="max-h-4 min-w-[var(--trigger-width)] rounded border-base-content bg-base-100 text-base-content shadow-md">
        <ListBox items={layouts}>
          {(l) => (
            <ListBoxItem
              id={l.name}
              textValue={l.name}
              className="cursor-pointer p-1 first:rounded-t last:rounded-b aria-selected:bg-primary aria-selected:text-primary-content"
            >
              <Text slot="label">{l.name}</Text>
              <div className="flex justify-center p-1">
                <PhysicalLayout
                  oneU={15}
                  hoverZoom={false}
                  positions={l.keys.map(
                    ({ x, y, width, height, r, rx, ry }) => ({
                      x: x / 100.0,
                      y: y / 100.0,
                      width: width / 100.0,
                      height: height / 100.0,
                      r: (r || 0) / 100.0,
                      rx: (rx || 0) / 100.0,
                      ry: (ry || 0) / 100.0,
                    })
                  )}
                />
              </div>
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </Select>
  );
};
