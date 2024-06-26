export interface PhysicalLayoutItem {
  name: string;
}

export type PhysicalLayoutClickCallback = (index: number) => void;

export interface PhysicalLayoutPickerProps {
  layouts: Array<PhysicalLayoutItem>;

  selectedPhysicalLayoutIndex: number;

  onPhysicalLayoutClicked?: PhysicalLayoutClickCallback;
}

function renderItem(
  item: PhysicalLayoutItem,
  index: number,
  selected: boolean,
  onClick?: PhysicalLayoutClickCallback
) {
  return (
    <li
      aria-selected={selected}
      className="p-1 b-1 aria-selected:bg-secondary border rounded border-transparent border-solid hover:border-text-base"
      onClick={() => onClick?.(index)}
    >
      {item.name}
    </li>
  );
}

export const PhysicalLayoutPicker = ({
  layouts,
  selectedPhysicalLayoutIndex,
  onPhysicalLayoutClicked,
  ...props
}: PhysicalLayoutPickerProps) => {
  let layout_items = layouts.map((item, index) =>
    renderItem(
      item,
      index,
      index === selectedPhysicalLayoutIndex,
      onPhysicalLayoutClicked
    )
  );

  return (
    <ul
      className="grid b-0 grid-flow-row auto-rows-auto list-none items-center justify-center cursor-pointer"
      {...props}
    >
      {layout_items}
    </ul>
  );
};
