import { PencilIcon } from "@heroicons/react/24/solid";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  DropIndicator,
  Label,
  ListBox,
  ListBoxItem,
  Selection,
  useDragAndDrop,
} from "react-aria-components";
import { useModalRef } from "../misc/useModalRef";

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
    newName: string,
  ) => void | Promise<void>;
}

interface EditLabelData {
  id: number;
  name: string;
}

const EditLabelModal = ({
  open,
  onClose,
  editLabelData,
  handleSaveNewLabel,
}: {
  open: boolean;
  onClose: () => void;
  editLabelData: EditLabelData;
  handleSaveNewLabel: (
    id: number,
    oldName: string,
    newName: string | null,
  ) => void;
}) => {
  const ref = useModalRef(open);
  const labelInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    const newName = labelInputRef.current?.value ?? null;
    handleSaveNewLabel(editLabelData.id, editLabelData.name, newName);
    onClose();
  };

  return (
    <dialog
      ref={ref}
      defaultValue={editLabelData.name}
      onClose={onClose}
      className="p-5 rounded-lg border-text-base border min-w-min w-[30vw] flex flex-col"
    >
      <span className="mb-3 text-lg">Editing Layer Name</span>
      <input
        className="p-1 border rounded border-text-base border-solid"
        ref={labelInputRef}
        type="text"
        defaultValue={editLabelData.name}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSave();
          }
        }}
      />
      <div className="mt-4 flex justify-end">
        <button
          className="py-1.5 px-2"
          type="button"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          className="py-1.5 px-2 ml-4 rounded-md bg-gray-100 text-black hover:bg-gray-300"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          Save
        </button>
      </div>
    </dialog>
  );
};

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
  const [editLabelData, setEditLabelData] = useState<EditLabelData | null>(
    null,
  );

  const layer_items = useMemo(() => {
    return layers.map((l, i) => ({
      name: l.name || i.toLocaleString(),
      id: l.id,
      index: i,
      selected: i === selectedLayerIndex,
    }));
  }, [layers, selectedLayerIndex]);

  const selectionChanged = useCallback(
    (s: Selection) => {
      if (s === "all") {
        return;
      }

      onLayerClicked?.(layer_items.findIndex((l) => s.has(l.id)));
    },
    [onLayerClicked, layer_items],
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

  const handleSaveNewLabel = useCallback(
    (id: number, oldName: string, newName: string | null) => {
      if (newName !== null) {
        onLayerNameChanged?.(id, oldName, newName);
      }
    },
    [onLayerNameChanged],
  );

  return (
    <div className="flex flex-col min-w-40">
      <div className="grid grid-cols-[1fr_auto_auto]">
        <Label className="after:content-[':']">Layers</Label>
        {onRemoveClicked && (
          <button
            type="button"
            className="px-2"
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
            className="px-2"
            onClick={onAddClicked}
          >
            +
          </button>
        )}
      </div>
      {editLabelData !== null && (
        <EditLabelModal
          open={editLabelData !== null}
          onClose={() => setEditLabelData(null)}
          editLabelData={editLabelData}
          handleSaveNewLabel={handleSaveNewLabel}
        />
      )}
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
              className="h-4 w-4 mx-1 invisible group-hover:visible hover:text-accent"
              onClick={() =>
                setEditLabelData({ id: layer_item.id, name: layer_item.name })
              }
            />
          </ListBoxItem>
        )}
      </ListBox>
    </div>
  );
};
