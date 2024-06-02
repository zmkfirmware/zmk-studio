import { SetStateAction, useContext, useEffect, useState } from "react";

import { call_rpc, Request, Response } from "ts-zmk-rpc-core";
import type { PhysicalLayout, Keymap } from "ts-zmk-rpc-core/keymap";
import type { GetBehaviorDetailsResponse } from "ts-zmk-rpc-core/behaviors";

import { hid_usage_get_label, hid_usage_page_and_id_from_usage } from '../hid-usages';
import { LayerPicker } from './LayerPicker';
import { PhysicalLayout as PhysicalLayoutComp } from './PhysicalLayout';
import { PhysicalLayoutPicker } from './PhysicalLayoutPicker';
import { useConnectedDeviceData } from "../rpc/useConnectedDeviceData";
import { ConnectionContext } from "../rpc/ConnectionContext";

type BehaviorMap = Record<number, GetBehaviorDetailsResponse>;

function renderLayout(layout: PhysicalLayout, keymap: Keymap, behaviors: BehaviorMap, selectedLayoutIndex: number) {
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
  
    return <PhysicalLayoutComp positions={positions} />;
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

function useLayouts(): [PhysicalLayout[] | null, React.Dispatch<SetStateAction<PhysicalLayout[] | null>>, number, React.Dispatch<SetStateAction<number>> ] {
    let connection = useContext(ConnectionContext);

    const [layouts, setLayouts] = useState<PhysicalLayout[] | null>(null);
    const [selectedPhysicalLayoutIndex, setSelectedPhysicalLayoutIndex] = useState<number>(0);

    useEffect(() => {
        if (!connection) {
            setLayouts(null);
            return;
        }

        async function startRequest() {
            setLayouts(null);
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
  const [keymap, _setKeymap] = useConnectedDeviceData<Keymap>({ keymap: { getKeymap: true } }, keymap => keymap?.keymap?.getKeymap);
  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(0);
  const behaviors = useBehaviors();

  return (
    <div>
      <div>
        {layouts && (<PhysicalLayoutPicker layouts={layouts} selectedPhysicalLayoutIndex={selectedPhysicalLayoutIndex} onPhysicalLayoutClicked={setSelectedPhysicalLayoutIndex} />)}
        {keymap && (<LayerPicker layers={keymap.layers} selectedLayerIndex={selectedLayerIndex} onLayerClicked={setSelectedLayerIndex} />) }
        {layouts && keymap && behaviors && (<div>{renderLayout(layouts[selectedPhysicalLayoutIndex], keymap, behaviors, selectedLayerIndex)}</div>)}
      </div>
    </div>
  )
}