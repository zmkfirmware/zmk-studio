import './layer-picker.css';

interface Layer {
  name?: string;
}

type LayerClickCallback = (index: number) => void;

interface LayerPickerProps {
  layers: Array<Layer>;
  selectedLayerIndex: number;

  onAddClicked?: () => void;

  onLayerClicked?: LayerClickCallback;
}

function renderItem(layer: Layer, index: number, selected: boolean, onClick?: LayerClickCallback) {
  let className = "zmk-layer-picker__item";
  if (selected) {
    className += " zmk-layer-picker__item--selected";
  }
  return <li className={className} onClick={() => onClick?.(index)}>{layer.name || index.toLocaleString() }</li>;
}

/**
 * Primary UI component for user interaction
 */
export const LayerPicker = ({
  layers,
  selectedLayerIndex,
  onAddClicked,
  onLayerClicked,
  ...props
}: LayerPickerProps) => {
  let layer_items = layers.map((layer, index) => renderItem(layer, index, index === selectedLayerIndex, onLayerClicked));

  return (
    <ul
    className='zmk-layer-picker'
    {...props}>
      {layer_items}
      {onAddClicked && <li className="zmk-layer-picker__add" onClick={onAddClicked}>+</li>}
    </ul>
  );
};
