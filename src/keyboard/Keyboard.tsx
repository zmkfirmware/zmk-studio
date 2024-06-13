import "./keyboard.css";

import React, { SetStateAction, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { call_rpc, Request } from "ts-zmk-rpc-core";
import { PhysicalLayout, Keymap, SetLayerBindingResponse, BehaviorBinding } from "ts-zmk-rpc-core/keymap";
import type { GetBehaviorDetailsResponse } from "ts-zmk-rpc-core/behaviors";

import { hid_usage_get_label, hid_usage_page_and_id_from_usage } from '../hid-usages';
import { LayerPicker } from './LayerPicker';
import { PhysicalLayout as PhysicalLayoutComp } from './PhysicalLayout';
import { PhysicalLayoutPicker } from './PhysicalLayoutPicker';
import { useConnectedDeviceData } from "../rpc/useConnectedDeviceData";
import { ConnectionContext } from "../rpc/ConnectionContext";
import { UndoRedoContext } from "../undoRedo";
import { BehaviorBindingPicker } from "../behaviors/BehaviorBindingPicker";
import { produce } from "immer";

type BehaviorMap = Record<number, GetBehaviorDetailsResponse>;

function renderLayout(layout: PhysicalLayout, keymap: Keymap, behaviors: BehaviorMap, selectedLayoutIndex: number, setSelectedKeyPosition: React.Dispatch<SetStateAction<number | null>>) {
    if (!keymap.layers[selectedLayoutIndex]) {
      return (<></>);
    }
  
    let positions = layout.keys.map((k, i) => {
      let [page, id] = hid_usage_page_and_id_from_usage(keymap.layers[selectedLayoutIndex].bindings[i].param1);
  
      // TODO: Do something with implicit mods!
      page &= 0xFF;
      
      let label = hid_usage_get_label(page, id)?.replace(/^Keyboard /, '');
  
      return { header: behaviors[keymap.layers[selectedLayoutIndex].bindings[i].behaviorId]?.friendlyName || "Unknown", x: k.x / 100.0, y: k.y / 100.0, width: k.width / 100, height: k.height / 100.0, children: (<span>{label}</span>)};
    });
  
    return <PhysicalLayoutComp positions={positions} onPositionClicked={setSelectedKeyPosition} />;
}

function useBehaviors(): BehaviorMap {
    let connection = useContext(ConnectionContext);

    const [behaviors, setBehaviors] = useState<BehaviorMap>({});

    useEffect(() => {
        if (!connection) {
            setBehaviors({});
            return;
        }

        async function startRequest() {
            setBehaviors({});

            if (!connection) {
                return;
            }
            
            let get_behaviors: Request = { behaviors: { listAllBehaviors: true, }, requestId: 0 };

            let behavior_list = await call_rpc(connection, get_behaviors);
            if (!ignore) {
                let behavior_map: BehaviorMap = {};
                for (let behaviorId of (behavior_list.behaviors?.listAllBehaviors?.behaviors || [])) {
                    if (ignore) {
                        break;
                    }
                    let details_req = { behaviors: { getBehaviorDetails: { behaviorId } }, requestId: 0 };
                    let behavior_details = await call_rpc(connection, details_req);
                    let dets: GetBehaviorDetailsResponse | undefined = behavior_details?.behaviors?.getBehaviorDetails;
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

        return () => { ignore = true; };
    }, [connection]);

    return behaviors;
}

function useLayouts(): [PhysicalLayout[] | undefined, React.Dispatch<SetStateAction<PhysicalLayout[] | undefined>>, number, React.Dispatch<SetStateAction<number>> ] {
    let connection = useContext(ConnectionContext);

    const [layouts, setLayouts] = useState<PhysicalLayout[] | undefined>(undefined);
    const [selectedPhysicalLayoutIndex, setSelectedPhysicalLayoutIndex] = useState<number>(0);

    useEffect(() => {
        if (!connection) {
            setLayouts(undefined);
            return;
        }

        async function startRequest() {
            setLayouts(undefined);

            if (!connection) {
                return;
            }
            
            let response = await call_rpc(connection, { keymap: { getPhysicalLayouts: true } });
            
            if (!ignore) {
                setLayouts(response?.keymap?.getPhysicalLayouts?.layouts);
                setSelectedPhysicalLayoutIndex(response?.keymap?.getPhysicalLayouts?.activeLayoutIndex || 0);
            }
        }
        
        
        let ignore = false;
        startRequest();

        return () => { ignore = true; };
    }, [connection]);

    return [layouts, setLayouts, selectedPhysicalLayoutIndex, setSelectedPhysicalLayoutIndex];
}


export default function Keyboard() {
  const [layouts, _setLayouts, selectedPhysicalLayoutIndex, setSelectedPhysicalLayoutIndex] = useLayouts();
  const [keymap, setKeymap] = useConnectedDeviceData<Keymap>({ keymap: { getKeymap: true } }, keymap => keymap?.keymap?.getKeymap);
  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(0);
  const [selectedKeyPosition, setSelectedKeyPosition] = useState<number | null>(null);
  const behaviors = useBehaviors();

  const conn = useContext(ConnectionContext);
  const undoRedo = useContext(UndoRedoContext);

  useEffect(() => {
    async function performSetRequest() {
        if (!conn || !layouts) { return; }

        let resp = await call_rpc(conn, { keymap: { setActivePhysicalLayout: selectedPhysicalLayoutIndex }});

        let new_keymap = resp?.keymap?.setActivePhysicalLayout?.ok;
        if (new_keymap) {
            setKeymap(new_keymap);
        } else {
            console.error("Failed to set the active physical layout err:", resp?.keymap?.setActivePhysicalLayout?.err);
        }
    }

    performSetRequest();
  }, [selectedPhysicalLayoutIndex]);

  let doSelectPhysicalLayout = useCallback((i: number) => {
    let oldLayout = selectedPhysicalLayoutIndex;
    undoRedo?.(async () => {
        setSelectedPhysicalLayoutIndex(i);

        return async () => {
            setSelectedPhysicalLayoutIndex(oldLayout);
        };
    });
  }, [undoRedo, selectedPhysicalLayoutIndex]);

  let doUpdateBinding = useCallback((binding: BehaviorBinding) => {
    console.log("Updatet the binding");
    if (!keymap || selectedKeyPosition === null) {
        console.error("Can't update binding without a selected key position and loaded keymap");
        return;
    }

    const layer = selectedLayerIndex;
    const keyPosition = selectedKeyPosition;
    const oldBinding = keymap.layers[layer].bindings[keyPosition];
    undoRedo?.(async () => {
        if (!conn) {
            throw new Error("Not connected");
        }

        let resp = await call_rpc(conn, { keymap: { setLayerBinding: { layer, keyPosition, binding }}});

        if (resp.keymap?.setLayerBinding === SetLayerBindingResponse.SUCCESS) {
            setKeymap(produce((draft: any) => {
                draft.layers[layer].bindings[keyPosition] = binding;
            }));
        } else {
            console.error("Failed to set binding", resp.keymap?.setLayerBinding);
        }

        return async () => {
            let resp = await call_rpc(conn, { keymap: { setLayerBinding: { layer, keyPosition, binding: oldBinding }}});
            if (resp.keymap?.setLayerBinding === SetLayerBindingResponse.SUCCESS) {
                setKeymap(produce((draft: any) => {
                    draft.layers[layer].bindings[keyPosition] = oldBinding;
                }));
            } else {
    
            }
        }
    })
  }, [conn, keymap, undoRedo, selectedLayerIndex, selectedKeyPosition]);

  let selectedBinding = useMemo(() => {
    if (keymap == null || selectedKeyPosition == null) {
        return null;
    }

    return keymap.layers[selectedLayerIndex].bindings[selectedKeyPosition];
  }, [keymap, selectedLayerIndex, selectedKeyPosition])

  return (
    <div className="zmk-keyboard">
        {keymap && (<div className="zmk-keyboard__layer-picker"><LayerPicker layers={keymap.layers} selectedLayerIndex={selectedLayerIndex} onLayerClicked={setSelectedLayerIndex} /></div>) }
        {layouts && keymap && behaviors && (<div className="zmk-keyboard__keymap">{renderLayout(layouts[selectedPhysicalLayoutIndex], keymap, behaviors, selectedLayerIndex, setSelectedKeyPosition)}</div>)}
        {keymap && selectedBinding && <div className="zmk-keyboard__binding-picker"><BehaviorBindingPicker binding={selectedBinding} behaviors={Object.values(behaviors)} layerNames={keymap.layers.map((l, li) => (l.name || li.toLocaleString()))} onBindingChanged={doUpdateBinding} /></div>}
        {layouts && (<div className="zmk-keyboard__layout-picker"><PhysicalLayoutPicker layouts={layouts} selectedPhysicalLayoutIndex={selectedPhysicalLayoutIndex} onPhysicalLayoutClicked={doSelectPhysicalLayout} /></div>)}
    </div>
  )
}