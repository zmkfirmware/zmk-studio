use futures::channel::mpsc::channel;
use futures::future::ready;
use futures::StreamExt;

use std::time::Duration;
use uuid::Uuid;

use bluest::{Adapter, DeviceId};

use tauri::{command, AppHandle, State};

const SVC_UUID: &str = "00000000-0196-6107-c967-c5cfb1c2482a";
const RPC_CHRC_UUID: &str = "00000001-0196-6107-c967-c5cfb1c2482a";

#[command]
pub async fn gatt_connect(
    id: String,
    app_handle: AppHandle,
    state: State<'_, super::commands::ActiveConnection<'_>>,
) -> Result<bool, ()> {
    let uuid = Uuid::parse_str(SVC_UUID).expect("Valid UUID");

    let adapter = Adapter::default().await.ok_or(())?;

    adapter.wait_available().await.map_err(|_| ())?;

    let device_id: DeviceId = serde_json::from_str(&id).unwrap();
    let mut d = adapter.open_device(&device_id).await.map_err(|_| ())?;

    if !d.is_connected().await {
        adapter.connect_device(&d).await.map_err(|_| ())?;
    }

    let service = d
        .discover_services_with_uuid(uuid)
        .await
        .map_err(|e| ())?
        .get(0)
        .cloned();

    if let Some(s) = service {
        let char_uuid = Uuid::parse_str(RPC_CHRC_UUID).expect("Valid UUID");
        let char = s
            .discover_characteristics_with_uuid(char_uuid)
            .await
            .map_err(|_| ())?
            .get(0)
            .cloned();

        if let Some(c) = char {
            let c2 = c.clone();
            tauri::async_runtime::spawn(async move {
                if let Ok(mut n) = c2.notify().await {
                    // Need to keep adapter from being dropped while active/connected
                    let a = adapter;

                    while let Some(Ok(vn)) = n.next().await {
                        use tauri::Manager;

                        app_handle.emit("connection_data", vn.clone());
                    }
                }
            });

            let (send, mut recv) = channel(5);
            *state.conn.lock().await = Some(Box::new(send));
            tauri::async_runtime::spawn(async move {
                while let Some(data) = recv.next().await {
                    c.write(&data).await.expect("Write uneventfully");
                }
            });

            Ok(true)
        } else {
            Err(())
        }
    } else {
        Err(())
    }
}

#[command]
pub async fn gatt_list_devices() -> Result<Vec<super::commands::AvailableDevice>, ()> {
    let uuid = Uuid::parse_str(SVC_UUID).expect("Valid UUID");

    let adapter = Adapter::default().await.ok_or(())?;

    adapter.wait_available().await.map_err(|_| ())?;

    let devices = adapter
        .discover_devices(&[uuid])
        .await
        .expect("GET DEVICES!")
        .take_until(async_std::task::sleep(Duration::from_secs(2)))
        .collect::<Vec<_>>()
        .await;

    let candidates: Vec<super::commands::AvailableDevice> = devices
        .into_iter()
        .filter_map(|d| {
            d.map(|device| {
                let label = device.name().unwrap_or("Unknown".to_string());
                let id = serde_json::to_string(&device.id()).unwrap();

                super::commands::AvailableDevice { label, id }
            })
            .ok()
        })
        .collect();

    Ok(candidates)
}
