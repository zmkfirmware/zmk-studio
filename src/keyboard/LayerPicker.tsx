import { useCallback, useMemo } from "react";
import {
  DropIndicator,
  Label,
  ListBox,
  ListBoxItem,
  Selection,
  useDragAndDrop,
} from "react-aria-components";

interface Layer {
  name?: string;
}

export type LayerClickCallback = (index: number) => void;
export type LayerMovedCallback = (index: number, destination: number) => void;

interface LayerPickerProps {
  layers: Array<Layer>;
  selectedLayerIndex: number;

  onLayerClicked?: LayerClickCallback;
  onLayerMoved?: LayerMovedCallback;
}

export const LayerPicker = ({
  layers,
  selectedLayerIndex,
  onLayerClicked,
  onLayerMoved,
  ...props
}: LayerPickerProps) => {
  const layer_items = useMemo(() => {
    return layers.map((l, i) => ({
      id: l.name || i.toLocaleString(),
      index: i,
      selected: i === selectedLayerIndex,
    }));
  }, [layers]);

  const selectionChanged = useCallback(
    (s: Selection) => {
      if (s === "all") {
        return;
      }

      onLayerClicked?.(layer_items.findIndex((l) => s.has(l.id)));
    },
    [onLayerClicked, layer_items]
  );

  let { dragAndDropHooks } = useDragAndDrop({
    renderDropIndicator(target) {
      return (
        <DropIndicator
          target={target}
          className={"data-[drop-target]:outline outline-1 outline-accent"}
        />
      );
    },
    getItems: (keys) =>
      [...keys].map((key) => ({ "text/plain": key.toLocaleString() })),
    onReorder(e) {
      let startIndex = layer_items.findIndex((l) => e.keys.has(l.id));
      let endIndex = layer_items.findIndex((l) => l.id === e.target.key);
      onLayerMoved?.(startIndex, endIndex);
    },
  });

  return (
    <div className="flex flex-col">
      <Label className="after:content-[':']">Layers</Label>
      <ListBox
        aria-label="Keymap Layer"
        selectionMode="single"
        items={layer_items}
        disallowEmptySelection={true}
        selectedKeys={[layer_items[selectedLayerIndex].id]}
        className="ml-2 items-center justify-center cursor-pointer"
        onSelectionChange={selectionChanged}
        dragAndDropHooks={dragAndDropHooks}
        {...props}
      >
        {(layer_item) => (
          <ListBoxItem className="p-1 b-1 aria-selected:bg-secondary border rounded border-transparent border-solid hover:border-text-base">
            {layer_item.id}
          </ListBoxItem>
        )}
      </ListBox>
    </div>
  );
};
