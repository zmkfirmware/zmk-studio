import './physical-layout-picker.css';

export interface PhysicalLayoutItem {
  name: string;
}

export type PhysicalLayoutClickCallback = (index: number) => void;

export interface PhysicalLayoutPickerProps {
  layouts: Array<PhysicalLayoutItem>;

  selectedPhysicalLayoutIndex: number;

  onPhysicalLayoutClicked?: PhysicalLayoutClickCallback;
}

function renderItem(item: PhysicalLayoutItem, index: number, selected: boolean, onClick?: PhysicalLayoutClickCallback) {
  let className = "zmk-physical-layout-picker__item";
  if (selected) {
    className += " zmk-physical-layout-picker__item--selected";
  }
  return <li className={className} onClick={() => onClick?.(index)}>{item.name}</li>;
}

export const PhysicalLayoutPicker = ({
  layouts,
  selectedPhysicalLayoutIndex,
  onPhysicalLayoutClicked,
  ...props
}: PhysicalLayoutPickerProps) => {
  let layout_items = layouts.map((item, index) => renderItem(item, index, index === selectedPhysicalLayoutIndex, onPhysicalLayoutClicked));

  return (
    <ul
    className='zmk-physical-layout-picker'
    {...props}>
      {layout_items}
    </ul>
  );
};
