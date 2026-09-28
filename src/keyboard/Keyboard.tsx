import React, {
  ChangeEvent,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Request } from "@zmkfirmware/zmk-studio-ts-client";
import { call_rpc } from "../rpc/logging";
import {
  PhysicalLayout,
  Keymap,
  SetLayerBindingResponse,
  SetLayerPropsResponse,
  BehaviorBinding,
  Layer,
} from "@zmkfirmware/zmk-studio-ts-client/keymap";
import type { GetBehaviorDetailsResponse } from "@zmkfirmware/zmk-studio-ts-client/behaviors";

import { LayerPicker } from "./LayerPicker";
import { PhysicalLayoutPicker } from "./PhysicalLayoutPicker";
import { Keymap as KeymapComp } from "./Keymap";
import { useConnectedDeviceData } from "../rpc/useConnectedDeviceData";
import { ConnectionContext } from "../rpc/ConnectionContext";
import { UndoRedoContext } from "../undoRedo";
import { BehaviorBindingPicker } from "../behaviors/BehaviorBindingPicker";
import { produce } from "immer";
import { LockStateContext } from "../rpc/LockStateContext";
import { LockState } from "@zmkfirmware/zmk-studio-ts-client/core";
import { deserializeLayoutZoom, LayoutZoom } from "./PhysicalLayout";
import { useLocalStorageState } from "../misc/useLocalStorageState";
import { useModalRef } from "../misc/useModalRef";
import { GenericModal } from "../GenericModal";
import {
  checkPortableKeymap,
  parsePortableKeymap,
  toPortableKeymap,
  type PortableKeymap,
} from "../keymap/portableKeymap";
import {
  applyPortableKeymap,
  KeymapApplyError,
} from "../keymap/applyPortableKeymap";
import { downloadKeymapFile, errorText } from "../keymap/exportKeymapFile";

type BehaviorMap = Record<number, GetBehaviorDetailsResponse>;

function useBehaviors(): BehaviorMap {
  let connection = useContext(ConnectionContext);
  let lockState = useContext(LockStateContext);

  const [behaviors, setBehaviors] = useState<BehaviorMap>({});

  useEffect(() => {
    if (
      !connection.conn ||
      lockState != LockState.ZMK_STUDIO_CORE_LOCK_STATE_UNLOCKED
    ) {
      setBehaviors({});
      return;
    }

    async function startRequest() {
      setBehaviors({});

      if (!connection.conn) {
        return;
      }

      let get_behaviors: Request = {
        behaviors: { listAllBehaviors: true },
        requestId: 0,
      };

      let behavior_list = await call_rpc(connection.conn, get_behaviors);
      if (!ignore) {
        let behavior_map: BehaviorMap = {};
        for (let behaviorId of behavior_list.behaviors?.listAllBehaviors
          ?.behaviors || []) {
          if (ignore) {
            break;
          }
          let details_req = {
            behaviors: { getBehaviorDetails: { behaviorId } },
            requestId: 0,
          };
          let behavior_details = await call_rpc(connection.conn, details_req);
          let dets: GetBehaviorDetailsResponse | undefined =
            behavior_details?.behaviors?.getBehaviorDetails;

          if (dets) {
            behavior_map[dets.id] = dets;
          }
        }

        if (!ignore) {
          setBehaviors(behavior_map);
        }
      }
    }

    let ignore = false;
    startRequest();

    return () => {
      ignore = true;
    };
  }, [connection, lockState]);

  return behaviors;
}

function useLayouts(): [
  PhysicalLayout[] | undefined,
  React.Dispatch<SetStateAction<PhysicalLayout[] | undefined>>,
  number,
  React.Dispatch<SetStateAction<number>>,
] {
  let connection = useContext(ConnectionContext);
  let lockState = useContext(LockStateContext);

  const [layouts, setLayouts] = useState<PhysicalLayout[] | undefined>(
    undefined,
  );
  const [selectedPhysicalLayoutIndex, setSelectedPhysicalLayoutIndex] =
    useState<number>(0);

  useEffect(() => {
    if (
      !connection.conn ||
      lockState != LockState.ZMK_STUDIO_CORE_LOCK_STATE_UNLOCKED
    ) {
      setLayouts(undefined);
      return;
    }

    async function startRequest() {
      setLayouts(undefined);

      if (!connection.conn) {
        return;
      }

      let response = await call_rpc(connection.conn, {
        keymap: { getPhysicalLayouts: true },
      });

      if (!ignore) {
        setLayouts(response?.keymap?.getPhysicalLayouts?.layouts);
        setSelectedPhysicalLayoutIndex(
          response?.keymap?.getPhysicalLayouts?.activeLayoutIndex || 0,
        );
      }
    }

    let ignore = false;
    startRequest();

    return () => {
      ignore = true;
    };
  }, [connection, lockState]);

  return [
    layouts,
    setLayouts,
    selectedPhysicalLayoutIndex,
    setSelectedPhysicalLayoutIndex,
  ];
}

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
  const [pendingLoad, setPendingLoad] = useState<PortableKeymap | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [keymapFileBusy, setKeymapFileBusy] = useState(false);
  const keymapFileInputRef = useRef<HTMLInputElement>(null);
  const confirmLoadRef = useModalRef(pendingLoad != null);
  const loadErrorRef = useModalRef(loadError != null);
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

      let resp = await call_rpc(conn.conn, {
        keymap: { setActivePhysicalLayout: selectedPhysicalLayoutIndex },
      });

      let new_keymap = resp?.keymap?.setActivePhysicalLayout?.ok;
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

  let doSelectPhysicalLayout = useCallback(
    (i: number) => {
      let oldLayout = selectedPhysicalLayoutIndex;
      undoRedo?.(async () => {
        setSelectedPhysicalLayoutIndex(i);

        return async () => {
          setSelectedPhysicalLayoutIndex(oldLayout);
        };
      });
    },
    [undoRedo, selectedPhysicalLayoutIndex],
  );

  let doUpdateBinding = useCallback(
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

        let resp = await call_rpc(conn.conn, {
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

          let resp = await call_rpc(conn.conn, {
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
          }
        };
      });
    },
    [conn, keymap, undoRedo, selectedLayerIndex, selectedKeyPosition],
  );

  let selectedBinding = useMemo(() => {
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

        let resp = await call_rpc(conn.conn, {
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
      let index = await doAdd();
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

    let index = selectedLayerIndex;
    let layerId = keymap.layers[index].id;
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

  const exportKeymap = useCallback(() => {
    if (!keymap) {
      return;
    }
    void (async () => {
      try {
        const portable = toPortableKeymap(keymap, behaviors);
        await downloadKeymapFile(JSON.stringify(portable, null, 2) + "\n");
      } catch (error) {
        setLoadError(errorText(error, "Failed to export keymap"));
      }
    })();
  }, [keymap, behaviors]);

  const onKeymapFileChosen = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file || !keymap) {
        return;
      }
      try {
        const portable = parsePortableKeymap(await file.text());
        checkPortableKeymap(portable, keymap, behaviors);
        setPendingLoad(portable);
      } catch (error) {
        setLoadError(
          error instanceof Error ? error.message : "Failed to read keymap file",
        );
      }
    },
    [keymap, behaviors],
  );

  const runLoadKeymap = useCallback(
    async (portable: PortableKeymap) => {
      if (!conn.conn || !keymap || !undoRedo) {
        setLoadError("Can't load a keymap right now");
        return;
      }

      const behaviorMap = behaviors;
      setKeymapFileBusy(true);
      try {
        const snapshot = toPortableKeymap(keymap, behaviors);
        await undoRedo(async () => {
          const next = await applyPortableKeymap(
            conn.conn!,
            portable,
            behaviorMap,
            {
              save: true,
            },
          );
          setKeymap(next);
          return async () => {
            if (!conn.conn) {
              return;
            }
            try {
              const restored = await applyPortableKeymap(
                conn.conn,
                snapshot,
                behaviorMap,
                { save: false },
              );
              setKeymap(restored);
            } catch (error) {
              if (error instanceof KeymapApplyError && error.keymap) {
                setKeymap(error.keymap);
              }
              setLoadError(
                error instanceof Error
                  ? error.message
                  : "Failed to undo keymap load",
              );
            }
          };
        });
      } catch (error) {
        if (error instanceof KeymapApplyError && error.keymap) {
          setKeymap(error.keymap);
        }
        setLoadError(
          error instanceof Error ? error.message : "Failed to load keymap",
        );
      } finally {
        setKeymapFileBusy(false);
      }
    },
    [conn, keymap, behaviors, undoRedo, setKeymap],
  );

  useEffect(() => {
    if (!keymap?.layers) return;

    const layers = keymap.layers.length - 1;

    if (selectedLayerIndex > layers) {
      setSelectedLayerIndex(layers);
    }
  }, [keymap, selectedLayerIndex]);

  return (
    <>
      <GenericModal
        ref={confirmLoadRef}
        className="max-w-md"
        onClose={() => setPendingLoad(null)}
      >
        <h2 className="my-2 text-lg">Replace keymap and save?</h2>
        <p>This writes the file onto the keyboard and saves it.</p>
        <div className="flex justify-end my-2 gap-3">
          <button
            type="button"
            className="rounded bg-base-200 hover:bg-base-300 px-3 py-2"
            onClick={() => setPendingLoad(null)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded bg-base-200 hover:bg-base-300 px-3 py-2"
            onClick={() => {
              const portable = pendingLoad;
              setPendingLoad(null);
              if (portable) {
                void runLoadKeymap(portable);
              }
            }}
          >
            Replace and save
          </button>
        </div>
      </GenericModal>
      <GenericModal
        ref={loadErrorRef}
        className="max-w-md"
        onClose={() => setLoadError(null)}
      >
        <h2 className="my-2 text-lg">Keymap file</h2>
        <p>{loadError}</p>
        <div className="flex justify-end my-2">
          <button
            type="button"
            className="rounded bg-base-200 hover:bg-base-300 px-3 py-2"
            onClick={() => setLoadError(null)}
          >
            OK
          </button>
        </div>
      </GenericModal>
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
              {Object.keys(behaviors).length > 0 && (
                <div className="flex flex-col gap-1 mt-2">
                  <button
                    type="button"
                    className="rounded bg-base-100 hover:bg-base-300 disabled:opacity-50 px-2 py-1 text-left text-sm"
                    disabled={keymapFileBusy}
                    onClick={exportKeymap}
                  >
                    Export keymap
                  </button>
                  <button
                    type="button"
                    className="rounded bg-base-100 hover:bg-base-300 disabled:opacity-50 px-2 py-1 text-left text-sm"
                    disabled={keymapFileBusy}
                    onClick={() => keymapFileInputRef.current?.click()}
                  >
                    Load keymap
                  </button>
                  {keymapFileBusy && <p className="text-xs">Loading keymap…</p>}
                  <input
                    ref={keymapFileInputRef}
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={onKeymapFileChosen}
                  />
                </div>
              )}
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
            <select
              className="absolute top-2 right-2 h-8 rounded px-2"
              value={keymapScale}
              onChange={(e) => {
                const value = deserializeLayoutZoom(e.target.value);
                setKeymapScale(value);
              }}
            >
              <option value="auto">Auto</option>
              <option value={0.25}>25%</option>
              <option value={0.5}>50%</option>
              <option value={0.75}>75%</option>
              <option value={1}>100%</option>
              <option value={1.25}>125%</option>
              <option value={1.5}>150%</option>
              <option value={2}>200%</option>
            </select>
          </div>
        )}
        {keymap && selectedBinding && (
          <div className="p-2 col-start-2 row-start-2 bg-base-200">
            <BehaviorBindingPicker
              binding={selectedBinding}
              behaviors={Object.values(behaviors)}
              layers={keymap.layers.map(({ id, name }, li) => ({
                id,
                name: name || li.toLocaleString(),
              }))}
              onBindingChanged={doUpdateBinding}
            />
          </div>
        )}
      </div>
    </>
  );
}
