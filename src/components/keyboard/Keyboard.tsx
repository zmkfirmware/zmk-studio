import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { call_rpc } from "../../rpc/logging.ts";
import {
  Keymap,
  SetLayerBindingResponse,
  SetLayerPropsResponse,
  BehaviorBinding,
  Layer,
} from "@zmkfirmware/zmk-studio-ts-client/keymap";


import { LayerPicker } from "./LayerPicker.tsx";
import { PhysicalLayoutPicker } from "./PhysicalLayoutPicker.tsx";
import { Keymap as KeymapComp } from "./Keymap.tsx";
import { useConnectedDeviceData } from "../../rpc/useConnectedDeviceData.ts";
import { ConnectionContext } from "../../rpc/ConnectionContext.ts";
import { UndoRedoContext } from "../../helpers/undoRedo.ts";
import { BehaviorBindingPicker } from "../../behaviors/BehaviorBindingPicker.tsx";
import { produce } from "immer";
import { LayoutZoom } from "./PhysicalLayout.tsx";
import { useLocalStorageState } from "../../misc/useLocalStorageState.ts";
import { KeysLayout } from "../keycodes/KeysLayout.tsx";
import { deserializeLayoutZoom } from "../../helpers/helpers.ts";
import { useBehaviors, useLayouts } from "../../helpers/useLayouts.ts";
import { X } from "lucide-react";
import { Zoom } from "../Zoom.tsx";

export default function Keyboard() {
  const [
    layouts,
    _setLayouts,
    selectedPhysicalLayoutIndex,
    setSelectedPhysicalLayoutIndex,
  ] = useLayouts();
  const [keymap, setKeymap] = useConnectedDeviceData<Keymap>(
    { keymap: { getKeymap: true } },
    (keymap) => {
      console.log("Got the keymap!");
      return keymap?.keymap?.getKeymap;
    },
    true,
  );

  const [keymapScale, setKeymapScale] = useLocalStorageState<LayoutZoom>(
    "keymapScale",
    "auto",
    {
      deserialize: deserializeLayoutZoom,
    },
  );

  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(0);
  const [selectedKeyPosition, setSelectedKeyPosition] = useState<
    number | undefined
  >(undefined);
  const behaviors = useBehaviors();

  const conn = useContext(ConnectionContext);
  const undoRedo = useContext(UndoRedoContext);

  useEffect(() => {
    setSelectedLayerIndex(0);
    setSelectedKeyPosition(undefined);
  }, [conn]);

  useEffect(() => {
    async function performSetRequest() {
      if (!conn.conn || !layouts) {
        return;
      }

      const resp = await call_rpc(conn.conn, {
        keymap: { setActivePhysicalLayout: selectedPhysicalLayoutIndex },
      });

      const new_keymap = resp?.keymap?.setActivePhysicalLayout?.ok;
      if (new_keymap) {
        setKeymap(new_keymap);
      } else {
        console.error(
          "Failed to set the active physical layout err:",
          resp?.keymap?.setActivePhysicalLayout?.err,
        );
      }
    }

    performSetRequest();
  }, [selectedPhysicalLayoutIndex]);

  const doSelectPhysicalLayout = useCallback(
    (i: number) => {
      const oldLayout = selectedPhysicalLayoutIndex;
      undoRedo?.(async () => {
        setSelectedPhysicalLayoutIndex(i);

        return async () => {
          setSelectedPhysicalLayoutIndex(oldLayout);
        };
      });
    },
    [undoRedo, selectedPhysicalLayoutIndex],
  );

  const doUpdateBinding = useCallback(
    (binding: BehaviorBinding) => {
      if (!keymap || selectedKeyPosition === undefined) {
        console.error(
          "Can't update binding without a selected key position and loaded keymap",
        );
        return;
      }

      const layer = selectedLayerIndex;
      const layerId = keymap.layers[layer].id;
      const keyPosition = selectedKeyPosition;
      const oldBinding = keymap.layers[layer].bindings[keyPosition];
      undoRedo?.(async () => {
        if (!conn.conn) {
          throw new Error("Not connected");
        }

        const resp = await call_rpc(conn.conn, {
          keymap: { setLayerBinding: { layerId, keyPosition, binding } },
        });

        if (
          resp.keymap?.setLayerBinding ===
          SetLayerBindingResponse.SET_LAYER_BINDING_RESP_OK
        ) {
          setKeymap(
            produce((draft: any) => {
              draft.layers[layer].bindings[keyPosition] = binding;
            }),
          );
        } else {
          console.error("Failed to set binding", resp.keymap?.setLayerBinding);
        }

        return async () => {
          if (!conn.conn) {
            return;
          }

          const resp = await call_rpc(conn.conn, {
            keymap: {
              setLayerBinding: { layerId, keyPosition, binding: oldBinding },
            },
          });
          if (
            resp.keymap?.setLayerBinding ===
            SetLayerBindingResponse.SET_LAYER_BINDING_RESP_OK
          ) {
            setKeymap(
              produce((draft: any) => {
                draft.layers[layer].bindings[keyPosition] = oldBinding;
              }),
            );
          } else {
            console.error(
              "Failed to set binding",
              resp.keymap?.setLayerBinding,
            );
          }
        };
      });
    },
    [conn, keymap, undoRedo, selectedLayerIndex, selectedKeyPosition],
  );

  const selectedBinding = useMemo(() => {
    if (
      keymap == null ||
      selectedKeyPosition == null ||
      !keymap.layers[selectedLayerIndex]
    ) {
      return null;
    }

    return keymap.layers[selectedLayerIndex].bindings[selectedKeyPosition];
  }, [keymap, selectedLayerIndex, selectedKeyPosition]);

  const moveLayer = useCallback(
    (start: number, end: number) => {
      const doMove = async (startIndex: number, destIndex: number) => {
        if (!conn.conn) {
          return;
        }

        const resp = await call_rpc(conn.conn, {
          keymap: { moveLayer: { startIndex, destIndex } },
        });

        if (resp.keymap?.moveLayer?.ok) {
          setKeymap(resp.keymap?.moveLayer?.ok);
          setSelectedLayerIndex(destIndex);
        } else {
          console.error("Error moving", resp);
        }
      };

      undoRedo?.(async () => {
        await doMove(start, end);
        return () => doMove(end, start);
      });
    },
    [undoRedo],
  );

  const addLayer = useCallback(() => {
    async function doAdd(): Promise<number> {
      if (!conn.conn || !keymap) {
        throw new Error("Not connected");
      }

      const resp = await call_rpc(conn.conn, { keymap: { addLayer: {} } });

      if (resp.keymap?.addLayer?.ok) {
        const newSelection = keymap.layers.length;
        setKeymap(
          produce((draft: any) => {
            draft.layers.push(resp.keymap!.addLayer!.ok!.layer);
            draft.availableLayers--;
          }),
        );

        setSelectedLayerIndex(newSelection);

        return resp.keymap.addLayer.ok.index;
      } else {
        console.error("Add error", resp.keymap?.addLayer?.err);
        throw new Error("Failed to add layer:" + resp.keymap?.addLayer?.err);
      }
    }

    async function doRemove(layerIndex: number) {
      if (!conn.conn) {
        throw new Error("Not connected");
      }

      const resp = await call_rpc(conn.conn, {
        keymap: { removeLayer: { layerIndex } },
      });

      console.log(resp);
      if (resp.keymap?.removeLayer?.ok) {
        setKeymap(
          produce((draft: any) => {
            draft.layers.splice(layerIndex, 1);
            draft.availableLayers++;
          }),
        );
      } else {
        console.error("Remove error", resp.keymap?.removeLayer?.err);
        throw new Error(
          "Failed to remove layer:" + resp.keymap?.removeLayer?.err,
        );
      }
    }

    undoRedo?.(async () => {
      const index = await doAdd();
      return () => doRemove(index);
    });
  }, [conn, undoRedo, keymap]);

  const removeLayer = useCallback(() => {
    async function doRemove(layerIndex: number): Promise<void> {
      if (!conn.conn || !keymap) {
        throw new Error("Not connected");
      }

      const resp = await call_rpc(conn.conn, {
        keymap: { removeLayer: { layerIndex } },
      });

      if (resp.keymap?.removeLayer?.ok) {
        if (layerIndex == keymap.layers.length - 1) {
          setSelectedLayerIndex(layerIndex - 1);
        }
        setKeymap(
          produce((draft: any) => {
            draft.layers.splice(layerIndex, 1);
            draft.availableLayers++;
          }),
        );
      } else {
        console.error("Remove error", resp.keymap?.removeLayer?.err);
        throw new Error(
          "Failed to remove layer:" + resp.keymap?.removeLayer?.err,
        );
      }
    }

    async function doRestore(layerId: number, atIndex: number) {
      if (!conn.conn) {
        throw new Error("Not connected");
      }

      const resp = await call_rpc(conn.conn, {
        keymap: { restoreLayer: { layerId, atIndex } },
      });

      console.log(resp);
      if (resp.keymap?.restoreLayer?.ok) {
        setKeymap(
          produce((draft: any) => {
            draft.layers.splice(atIndex, 0, resp!.keymap!.restoreLayer!.ok);
            draft.availableLayers--;
          }),
        );
        setSelectedLayerIndex(atIndex);
      } else {
        console.error("Remove error", resp.keymap?.restoreLayer?.err);
        throw new Error(
          "Failed to restore layer:" + resp.keymap?.restoreLayer?.err,
        );
      }
    }

    if (!keymap) {
      throw new Error("No keymap loaded");
    }

    const index = selectedLayerIndex;
    const layerId = keymap.layers[index].id;
    undoRedo?.(async () => {
      await doRemove(index);
      return () => doRestore(layerId, index);
    });
  }, [conn, undoRedo, selectedLayerIndex]);

  const changeLayerName = useCallback(
    (id: number, oldName: string, newName: string) => {
      async function changeName(layerId: number, name: string) {
        if (!conn.conn) {
          throw new Error("Not connected");
        }

        const resp = await call_rpc(conn.conn, {
          keymap: { setLayerProps: { layerId, name } },
        });

        if (
          resp.keymap?.setLayerProps ==
          SetLayerPropsResponse.SET_LAYER_PROPS_RESP_OK
        ) {
          setKeymap(
            produce((draft: any) => {
              const layer_index = draft.layers.findIndex(
                (l: Layer) => l.id == layerId,
              );
              draft.layers[layer_index].name = name;
            }),
          );
        } else {
          throw new Error(
            "Failed to change layer name:" + resp.keymap?.setLayerProps,
          );
        }
      }

      undoRedo?.(async () => {
        await changeName(id, newName);
        return async () => {
          await changeName(id, oldName);
        };
      });
    },
    [conn, undoRedo, keymap],
  );

  useEffect(() => {
    if (!keymap?.layers) return;

    const layers = keymap.layers.length - 1;

    if (selectedLayerIndex > layers) {
      setSelectedLayerIndex(layers);
    }
  }, [keymap, selectedLayerIndex]);

  return (
    <div className="grid grid-cols-[auto_1fr] grid-rows-[1fr_minmax(10em,auto)] bg-base-300 max-w-full min-w-0 min-h-0">
      <div className="p-2 flex flex-col gap-2 bg-base-200 row-span-2">
        {layouts && (
          <div className="col-start-3 row-start-1 row-end-2">
            <PhysicalLayoutPicker
              layouts={layouts}
              selectedPhysicalLayoutIndex={selectedPhysicalLayoutIndex}
              onPhysicalLayoutClicked={doSelectPhysicalLayout}
            />
          </div>
        )}

        {keymap && (
          <div className="col-start-1 row-start-1 row-end-2">
            <LayerPicker
              layers={keymap.layers}
              selectedLayerIndex={selectedLayerIndex}
              onLayerClicked={setSelectedLayerIndex}
              onLayerMoved={moveLayer}
              canAdd={(keymap.availableLayers || 0) > 0}
              canRemove={(keymap.layers?.length || 0) > 1}
              onAddClicked={addLayer}
              onRemoveClicked={removeLayer}
              onLayerNameChanged={changeLayerName}
            />
          </div>
        )}
      </div>
      {layouts && keymap && behaviors && (
        <div className="p-2 col-start-2 row-start-1 grid items-center justify-center relative min-w-0">
          <KeymapComp
            keymap={keymap}
            layout={layouts[selectedPhysicalLayoutIndex]}
            behaviors={behaviors}
            scale={keymapScale}
            selectedLayerIndex={selectedLayerIndex}
            selectedKeyPosition={selectedKeyPosition}
            onKeyPositionClicked={setSelectedKeyPosition}
          />
          <Zoom
            value={keymapScale}
            onChange={(e) => {
              const value = deserializeLayoutZoom(e.target.value);
              setKeymapScale(value);
            }}
          />
        </div>
      )}
      {keymap && selectedBinding && (
        <div className="p-2 col-start-2 row-start-2">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="card-actions justify-end">
                <button className="btn btn-square btn-sm">
                  <X />
                </button>
              </div>
              <BehaviorBindingPicker
                binding={selectedBinding}
                behaviors={Object.values(behaviors)}
                layers={keymap.layers.map(({ id, name }, li) => ({
                  id,
                  name: name || li.toLocaleString(),
                }))}
                onBindingChanged={doUpdateBinding}
              />
              <KeysLayout></KeysLayout>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
