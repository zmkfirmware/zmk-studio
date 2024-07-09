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
  let selectionChanged = useCallback(
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
      <Label className="after:content-[':']">Layout</Label>
      <Button className="ml-4 min-w-24 text-left">
        <SelectValue<PhysicalLayoutItem>>
          {(v) => {
            return <span>{v.selectedItem?.name}</span>;
          }}
        </SelectValue>
      </Button>
      <Popover className="min-w-[var(--trigger-width)] max-h-4 border rounded border-text-base bg-bg-base">
        <ListBox items={layouts}>
          {(l) => (
            <ListBoxItem
              id={l.name}
              textValue={l.name}
              className="p-1 aria-selected:bg-secondary first:rounded-t last:rounded-b"
            >
              <Text slot="label">{l.name}</Text>
              <div className="p-1 flex justify-center">
                <PhysicalLayout
                  oneU={15}
                  hoverZoom={false}
                  positions={l.keys.map(({ x, y, width, height }) => ({
                    x: x / 100.0,
                    y: y / 100.0,
                    width: width / 100.0,
                    height: height / 100.0,
                  }))}
                />
              </div>
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </Select>
  );

  // return (
  //   <ul
  //     className="grid b-0 grid-flow-row auto-rows-auto list-none items-center justify-center cursor-pointer"
  //     {...props}
  //   >
  //     {layout_items}
  //   </ul>
  // );
};
