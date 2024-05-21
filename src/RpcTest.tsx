
import { useState, Dispatch } from 'react';
 
import { create_rpc_connection, call_rpc, Request } from "ts-zmk-rpc-core";

import type { RpcTransport } from "ts-zmk-rpc-core/transport/index";
import type { PhysicalLayout, Keymap } from "ts-zmk-rpc-core/keymap";
import type { GetBehaviorDetailsResponse } from "ts-zmk-rpc-core/behaviors";
import { connect as gatt_connect } from "ts-zmk-rpc-core/transport/gatt";
import { connect as serial_connect } from "ts-zmk-rpc-core/transport/serial";
import type { AvailableDevice } from './tauri/index';
import { connect as tauri_ble_connect, list_devices as ble_list_devices } from './tauri/ble';
import { connect as tauri_serial_connect, list_devices as serial_list_devices } from './tauri/serial';

import { hid_usage_get_label, hid_usage_page_and_id_from_usage } from './hid-usages';
import { LayerPicker } from './keyboard/LayerPicker';
import { PhysicalLayout as PhysicalLayoutComp } from './keyboard/PhysicalLayout';

type BehaviorMap = Record<number, GetBehaviorDetailsResponse>;
type TransportFactory = { label: string, connect?: () => Promise<RpcTransport>, pick_and_connect?: { list: () => Promise<Array<AvailableDevice>>, connect: (dev: AvailableDevice) => Promise<RpcTransport>  }};

declare global {
  interface Window { __TAURI_INTERNALS__?: object; }
}

const TRANSPORTS: TransportFactory[] = [
  navigator.bluetooth && { label: "BLE", connect: gatt_connect },
  navigator.serial && { label: "Serial", connect: serial_connect },
  ... window.__TAURI_INTERNALS__ ? [{ label: "BLE", pick_and_connect: {connect: tauri_ble_connect, list: ble_list_devices } }] : [],
  ... window.__TAURI_INTERNALS__ ? [{ label: "Serial", pick_and_connect: { connect: tauri_serial_connect, list: serial_list_devices }}] : [],
];

async function test(factory: TransportFactory, setPhysicalLayout: Dispatch<PhysicalLayout | undefined>, setKeymap: Dispatch<Keymap | undefined>, setBehaviors: Dispatch<BehaviorMap>) {
  let transport = null;
  if (factory.connect) {
    transport = await factory.connect();
  } else if (factory.pick_and_connect) {
    let devices = await factory.pick_and_connect.list();
    console.log(devices);
    transport = await factory.pick_and_connect.connect(devices[devices.length - 1]);
  }

  if (!transport) {
    return;
  }
  
  let rpc_conn = await create_rpc_connection(transport);

  // let req: Request =  { core: { getLockState: true }, requestId: 0 };
  // let resp = await call_rpc(rpc_conn, req);

  let get_behaviors: Request = { behaviors: { listAllBehaviors: true, }, requestId: 0 };

  let behavior_list = await call_rpc(rpc_conn, get_behaviors);
  let behaviors: BehaviorMap = {};
  for (let behaviorId of (behavior_list.behaviors?.listAllBehaviors?.behaviors || [])) {
    let details_req = { behaviors: { getBehaviorDetails: { behaviorId } }, requestId: 0 };
    let behavior_details = await call_rpc(rpc_conn, details_req);
    let dets: GetBehaviorDetailsResponse | undefined = behavior_details?.behaviors?.getBehaviorDetails;
    if (dets) {
      behaviors[dets.id] = dets;
    }
  }

  setBehaviors(behaviors);

  let layouts = await call_rpc(rpc_conn, { keymap: { getPhysicalLayouts: true }, requestId: 0 })
  console.log("Layouts", layouts);
  let selectedLayout = layouts?.keymap?.getPhysicalLayouts?.layouts[layouts?.keymap?.getPhysicalLayouts?.activeLayoutIndex];
  setPhysicalLayout(selectedLayout);

  let keymap = await call_rpc(rpc_conn, { keymap: { getKeymap: true }, requestId: 0 });
  setKeymap(keymap?.keymap?.getKeymap);
  console.log("Keymap", keymap);
}

function renderLayout(layout: PhysicalLayout, keymap: Keymap, behaviors: BehaviorMap, selectedLayoutIndex: number) {
  console.log("Render", keymap, selectedLayoutIndex);
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

export default function RpcTest() {
  const [layout, setLayout] = useState<PhysicalLayout | undefined>(undefined);
  const [keymap, setKeymap] = useState<Keymap | undefined>(undefined);
  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number>(0);
  const [behaviors, setBehaviors] = useState<BehaviorMap>({});

  let connections = TRANSPORTS.filter((t) => t !== undefined).map((t) => <button key={t.label} onClick={() => test(t, setLayout, setKeymap, setBehaviors)}>{t.label}</button>);

  return (
    <div>
      <div>{connections}</div>
      <div>
        {keymap && (<LayerPicker layers={keymap.layers} selectedLayerIndex={selectedLayerIndex} onLayerClicked={setSelectedLayerIndex} />) }
        {layout && keymap && behaviors && (<div>{renderLayout(layout, keymap, behaviors, selectedLayerIndex)}</div>)}
      </div>
    </div>
  )
}
