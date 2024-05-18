use futures::channel::mpsc::channel;
use futures::future::ready;
use futures::StreamExt;

use std::time::Duration;
use uuid::Uuid;

use bluest::Adapter;

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

    let mut devices: Vec<_> = adapter
        .discover_devices(&[uuid])
        .await
        .expect("GET DEVICES!")
        .take_until(async_std::task::sleep(Duration::from_secs(2)))
        .filter_map(|d| ready(d.ok()))
        .filter(|d| ready(d.name().unwrap_or("Unknown".to_string()).eq(&id)))
        .collect()
        .await;

    match devices.get(0).cloned() {
        Some(d) => {
            if !d.is_connected().await {
                adapter.connect_device(&d).await.map_err(|_| ())?;
            }

            let service = d
                .discover_services_with_uuid(uuid)
                .await
                .map_err(|e| ())?
                .get(0)
                .cloned();
            match service {
                Some(s) => {
                    let char_uuid = Uuid::parse_str(RPC_CHRC_UUID).expect("Valid UUID");
                    let char = s
                        .discover_characteristics_with_uuid(char_uuid)
                        .await
                        .map_err(|_| ())?
                        .get(0)
                        .cloned();

                    match char {
                        Some(c) => {
                            let c2 = c.clone();
                            tauri::async_runtime::spawn(async move {
                                if let Ok(mut n) = c.notify().await {
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
                                    c2.write(&data).await.expect("Write uneventfully");
                                }
                            });
                            Ok(true)
                        }
                        _ => Err(()),
                    }
                }
                _ => Err(()),
            }
        }
        _ => Err(()),
    }
}

#[command]
pub async fn gatt_list_devices() -> Result<Vec<super::commands::AvailableDevice>, ()> {
    let uuid = Uuid::parse_str(SVC_UUID).expect("Valid UUID");

    let adapter = Adapter::default().await.ok_or(())?;

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
                let name = device.name().unwrap_or("Unknown".to_string());
                super::commands::AvailableDevice {
                    label: name.clone(),
                    id: name,
                }
            })
            .ok()
        })
        .collect();

    Ok(candidates)
}
