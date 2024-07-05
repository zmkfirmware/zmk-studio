import React, {
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { call_rpc, Request } from "@zmkfirmware/zmk-studio-ts-client";
import {
  PhysicalLayout,
  Keymap,
  SetLayerBindingResponse,
  BehaviorBinding,
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

type BehaviorMap = Record<number, GetBehaviorDetailsResponse>;

function useBehaviors(): BehaviorMap {
  let connection = useContext(ConnectionContext);
  let lockState = useContext(LockStateContext);

  const [behaviors, setBehaviors] = useState<BehaviorMap>({});

  useEffect(() => {
    if (
      !connection ||
      lockState != LockState.ZMK_STUDIO_CORE_LOCK_STATE_UNLOCKED
    ) {
      setBehaviors({});
      return;
    }

    async function startRequest() {
      setBehaviors({});

      if (!connection) {
        return;
      }

      let get_behaviors: Request = {
        behaviors: { listAllBehaviors: true },
        requestId: 0,
      };

      let behavior_list = await call_rpc(connection, get_behaviors);
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
          let behavior_details = await call_rpc(connection, details_req);
          let dets: GetBehaviorDetailsResponse | undefined =
            behavior_details?.behaviors?.getBehaviorDetails;
          console.log("Details", dets);
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
  React.Dispatch<SetStateAction<number>>
] {
  let connection = useContext(ConnectionContext);
  let lockState = useContext(LockStateContext);

  const [layouts, setLayouts] = useState<PhysicalLayout[] | undefined>(
    undefined
  );
  const [selectedPhysicalLayoutIndex, setSelectedPhysicalLayoutIndex] =
    useState<number>(0);

  useEffect(() => {
    if (
      !connection ||
      lockState != LockState.ZMK_STUDIO_CORE_LOCK_STATE_UNLOCKED
    ) {
      setLayouts(undefined);
      return;
    }

    async function startRequest() {
      setLayouts(undefined);

      if (!connection) {
        return;
      }

      let response = await call_rpc(connection, {
        keymap: { getPhysicalLayouts: true },
      });

      if (!ignore) {
        setLayouts(response?.keymap?.getPhysicalLayouts?.layouts);
        setSelectedPhysicalLayoutIndex(
          response?.keymap?.getPhysicalLayouts?.activeLayoutIndex || 0
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
    (keymap) => keymap?.keymap?.getKeymap,
    true
  );
  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(0);
  const [selectedKeyPosition, setSelectedKeyPosition] = useState<
    number | undefined
  >(undefined);
  const behaviors = useBehaviors();

  const conn = useContext(ConnectionContext);
  const undoRedo = useContext(UndoRedoContext);

  useEffect(() => {
    async function performSetRequest() {
      if (!conn || !layouts) {
        return;
      }

      let resp = await call_rpc(conn, {
        keymap: { setActivePhysicalLayout: selectedPhysicalLayoutIndex },
      });

      let new_keymap = resp?.keymap?.setActivePhysicalLayout?.ok;
      if (new_keymap) {
        setKeymap(new_keymap);
      } else {
        console.error(
          "Failed to set the active physical layout err:",
          resp?.keymap?.setActivePhysicalLayout?.err
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
    [undoRedo, selectedPhysicalLayoutIndex]
  );

  let doUpdateBinding = useCallback(
    (binding: BehaviorBinding) => {
      console.log("Updatet the binding");
      if (!keymap || selectedKeyPosition === undefined) {
        console.error(
          "Can't update binding without a selected key position and loaded keymap"
        );
        return;
      }

      const layer = selectedLayerIndex;
      const keyPosition = selectedKeyPosition;
      const oldBinding = keymap.layers[layer].bindings[keyPosition];
      undoRedo?.(async () => {
        if (!conn) {
          throw new Error("Not connected");
        }

        let resp = await call_rpc(conn, {
          keymap: { setLayerBinding: { layer, keyPosition, binding } },
        });

        if (resp.keymap?.setLayerBinding === SetLayerBindingResponse.SUCCESS) {
          setKeymap(
            produce((draft: any) => {
              draft.layers[layer].bindings[keyPosition] = binding;
            })
          );
        } else {
          console.error("Failed to set binding", resp.keymap?.setLayerBinding);
        }

        return async () => {
          let resp = await call_rpc(conn, {
            keymap: {
              setLayerBinding: { layer, keyPosition, binding: oldBinding },
            },
          });
          if (
            resp.keymap?.setLayerBinding === SetLayerBindingResponse.SUCCESS
          ) {
            setKeymap(
              produce((draft: any) => {
                draft.layers[layer].bindings[keyPosition] = oldBinding;
              })
            );
          } else {
          }
        };
      });
    },
    [conn, keymap, undoRedo, selectedLayerIndex, selectedKeyPosition]
  );

  let selectedBinding = useMemo(() => {
    if (keymap == null || selectedKeyPosition == null) {
      return null;
    }

    return keymap.layers[selectedLayerIndex].bindings[selectedKeyPosition];
  }, [keymap, selectedLayerIndex, selectedKeyPosition]);

  const moveLayer = useCallback(
    (start: number, end: number) => {
      const doMove = async (layer: number, dest: number) => {
        if (!conn) {
          return;
        }

        let resp = await call_rpc(conn, {
          keymap: { moveLayer: { layer, dest } },
        });
        if (resp.keymap?.moveLayer?.ok) {
          setKeymap(resp.keymap?.moveLayer?.ok);
          setSelectedLayerIndex(dest);
        } else {
          console.error("Error moving", resp);
        }
      };
      undoRedo?.(async () => {
        await doMove(start, end);
        return () => doMove(end, start);
      });
    },
    [undoRedo]
  );

  return (
    <div className="p-2 h-full grid grid-cols-[1fr_5fr_1fr] grid-rows-[1fr_auto]">
      {keymap && (
        <div className="col-start-1 row-start-1 row-end-2">
          <LayerPicker
            layers={keymap.layers}
            selectedLayerIndex={selectedLayerIndex}
            onLayerClicked={setSelectedLayerIndex}
            onLayerMoved={moveLayer}
          />
        </div>
      )}
      {layouts && keymap && behaviors && (
        <div className="col-start-2 row-start-1 grid items-center justify-center">
          <KeymapComp
            keymap={keymap}
            layout={layouts[selectedPhysicalLayoutIndex]}
            behaviors={behaviors}
            selectedLayerIndex={selectedLayerIndex}
            selectedKeyPosition={selectedKeyPosition}
            onKeyPositionClicked={setSelectedKeyPosition}
          />
        </div>
      )}
      {keymap && selectedBinding && (
        <div className="col-start-2 row-start-2">
          <BehaviorBindingPicker
            binding={selectedBinding}
            behaviors={Object.values(behaviors)}
            layerNames={keymap.layers.map(
              (l, li) => l.name || li.toLocaleString()
            )}
            onBindingChanged={doUpdateBinding}
          />
        </div>
      )}
      {layouts && (
        <div className="col-start-3 row-start-1 row-end-2">
          <PhysicalLayoutPicker
            layouts={layouts}
            selectedPhysicalLayoutIndex={selectedPhysicalLayoutIndex}
            onPhysicalLayoutClicked={doSelectPhysicalLayout}
          />
        </div>
      )}
    </div>
  );
}
