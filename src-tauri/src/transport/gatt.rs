
use futures::stream;
use futures::StreamExt;
use futures::channel::mpsc::channel;

use uuid::Uuid;
use std::{
    time::Duration,
};

use btleplug::api::{BDAddr, Central, Characteristic, Manager as _, Peripheral, ScanFilter, WriteType};
use btleplug::platform::Manager;

use serde::{Deserialize, Serialize};
use tauri::{
  AppHandle,
  command,
  State,
};

async fn find_peripheral(addr: BDAddr) -> Result<btleplug::platform::Peripheral, ()> {
  let manager = Manager::new().await.expect("TODO");
  let adapter_list = manager.adapters().await.expect("TODO");
  if adapter_list.is_empty() {
      eprintln!("No Bluetooth adapters found");
  }

  let a = BDAddr::from_str_delim(addr.to_string().as_str()).expect("Got a valid addr");

  for adapter in adapter_list.iter() {
    for p in adapter.peripherals().await.expect("GOT PERIPHERALS") {
      let is_connected = p.is_connected().await.expect("To find if connected");


      if is_connected && p.address() == a {
          return Ok(p);
      }
    }
  }

  Err(())
}

const SVC_UUID: &str = "00000000-0196-6107-c967-c5cfb1c2482a";
const RPC_CHRC_UUID: &str = "00000001-0196-6107-c967-c5cfb1c2482a";


pub fn find_rpc_char(p: &impl Peripheral) -> Result<Characteristic, ()> {
    Ok(p.characteristics().into_iter().find(|c| c.uuid == Uuid::parse_str(RPC_CHRC_UUID).unwrap()).expect("Has an RPC characteristic"))
}

#[command]
pub async fn gatt_connect(id: String, app_handle: AppHandle, state: State<'_, super::commands::ActiveConnection<'_>>) -> Result<bool, ()> {
  let a = BDAddr::from_str_delim(id.as_str()).expect("Got a valid addr");

  let p = find_peripheral(a).await;

  if let Ok(peripheral) = p {
      peripheral.connect().await;
      peripheral.discover_services().await;
      let c = find_rpc_char(&peripheral).unwrap();
      peripheral.subscribe(&c).await.expect("Subscribed!");

      if let Ok(mut n) = peripheral.notifications().await {
          tauri::async_runtime::spawn(async move {
              while let Some(vn) = n.next().await {
                use tauri::Manager;
                
                app_handle.emit("connection_data", vn.value);
              }
          });
      }
      let (send, mut recv) = channel(5);
      *state.conn.lock().await = Some(Box::new(send));
      tauri::async_runtime::spawn(async move {
        while let Some(data) = recv.next().await {
          peripheral.write(&c, &data, WriteType::WithoutResponse).await.expect("Write uneventfully");
        }
      });

      return Ok(true);
  }

  Err(())
}

#[command]
pub async fn gatt_list_devices(
) -> Result<Vec<super::commands::AvailableDevice>, ()> {
  let manager = Manager::new().await.expect("TODO");
  let adapter_list = manager.adapters().await.expect("TODO");
  if adapter_list.is_empty() {
      eprintln!("No Bluetooth adapters found");
  }

  let uuid = Uuid::parse_str(SVC_UUID).expect("Valid UUID");

  let candidates = stream::iter(adapter_list.iter()).then(|adapter| async move {
      adapter
          .start_scan(ScanFilter { services: vec![uuid] })
          .await
          .expect("Can't scan BLE adapter for connected devices...");
      async_std::task::sleep(Duration::from_secs(2)).await;
      let peripherals = adapter.peripherals().await.expect("To find peripherals");

      stream::iter(peripherals).filter_map(|peripheral| async move {
        let is_connected = peripheral.is_connected().await.expect("To find if connected");

        if !is_connected {
            return None;
        }

        peripheral.discover_services().await;


        if !peripheral.services().iter().any(|s| s.uuid == uuid) {
            return None;
        }

        let properties = peripheral.properties().await.expect("To load props");
        let local_name = properties
            .unwrap()
            .local_name
            .unwrap_or(String::from("(peripheral name unknown)"));

        Some(super::commands::AvailableDevice { label: local_name, id: peripheral.address().to_string() })
      }).collect::<Vec<_>>().await
  }).collect::<Vec<_>>().await.into_iter().flatten().collect();

  Ok(candidates)
}

