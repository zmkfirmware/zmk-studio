import { PencilIcon } from "@heroicons/react/24/solid";
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
  id: number;
  name?: string;
}

export type LayerClickCallback = (index: number) => void;
export type LayerMovedCallback = (index: number, destination: number) => void;

interface LayerPickerProps {
  layers: Array<Layer>;
  selectedLayerIndex: number;
  canAdd?: boolean;
  canRemove?: boolean;

  onLayerClicked?: LayerClickCallback;
  onLayerMoved?: LayerMovedCallback;
  onAddClicked?: () => void | Promise<void>;
  onRemoveClicked?: () => void | Promise<void>;
  onLayerNameChanged?: (
    id: number,
    oldName: string,
    newName: string
  ) => void | Promise<void>;
}

export const LayerPicker = ({
  layers,
  selectedLayerIndex,
  canAdd,
  canRemove,
  onLayerClicked,
  onLayerMoved,
  onAddClicked,
  onRemoveClicked,
  onLayerNameChanged,
  ...props
}: LayerPickerProps) => {
  const layer_items = useMemo(() => {
    return layers.map((l, i) => ({
      name: l.name || i.toLocaleString(),
      id: l.id,
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

  let onEditClicked = useCallback(
    (id: number, name: string) => {
      let newName = window.prompt("Label");

      if (newName !== null) {
        onLayerNameChanged?.(id, name, newName);
      }
    },
    [onLayerNameChanged]
  );

  return (
    <div className="flex flex-col min-w-40">
      <div className="grid grid-cols-[1fr_auto_auto]">
        <Label className="after:content-[':']">Layers</Label>
        {onRemoveClicked && (
          <button
            type="button"
            className="px-2 hover:text-accent"
            disabled={!canRemove}
            onClick={onRemoveClicked}
          >
            -
          </button>
        )}
        {onAddClicked && (
          <button
            type="button"
            disabled={!canAdd}
            className="px-2 hover:text-accent disabled:text-gray-500 disabled:cursor-not-allowed"
            onClick={onAddClicked}
          >
            +
          </button>
        )}
      </div>
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
          <ListBoxItem
            textValue={layer_item.name}
            className="p-1 b-1 group grid grid-cols-[1fr_auto] items-center aria-selected:bg-secondary border rounded border-transparent border-solid hover:border-text-base"
          >
            <span>{layer_item.name}</span>
            <PencilIcon
              className="h-4 w-4 mx-1 invisible group-hover:visible"
              onClick={() => onEditClicked(layer_item.id, layer_item.name)}
            />
          </ListBoxItem>
        )}
      </ListBox>
    </div>
  );
};
