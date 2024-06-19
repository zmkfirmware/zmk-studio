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

function renderItem(
  layer: Layer,
  index: number,
  selected: boolean,
  onClick?: LayerClickCallback,
) {
  return (
    <li
      aria-selected={selected}
      className="p-1 b-1 aria-selected:bg-secondary border rounded border-transparent border-solid hover:border-text-base"
      onClick={() => onClick?.(index)}
    >
      {layer.name || index.toLocaleString()}
    </li>
  );
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
  let layer_items = layers.map((layer, index) =>
    renderItem(layer, index, index === selectedLayerIndex, onLayerClicked),
  );

  return (
    <ul
      className="grid b-0 grid-flow-row auto-rows-auto list-none items-center justify-center cursor-pointer"
      {...props}
    >
      {layer_items}
      {onAddClicked && <li onClick={onAddClicked}>+</li>}
    </ul>
  );
};
