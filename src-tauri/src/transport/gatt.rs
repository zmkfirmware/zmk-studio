use async_std::future::timeout;
use futures::future::ready;
use futures::{channel::mpsc::channel, FutureExt};
use futures::{StreamExt, TryFutureExt};

use std::time::Duration;
use uuid::Uuid;

use bluest::{Adapter, ConnectionEvent, Device, DeviceId};

use tauri::{command, AppHandle, State};

const SVC_UUID: Uuid = Uuid::from_u128(0x00000000_0196_6107_c967_c5cfb1c2482a);
const RPC_CHRC_UUID: Uuid = Uuid::from_u128(0x00000001_0196_6107_c967_c5cfb1c2482a);

#[command]
pub async fn gatt_connect(
    id: String,
    app_handle: AppHandle,
    state: State<'_, super::commands::ActiveConnection<'_>>,
) -> Result<bool, ()> {
    let adapter = Adapter::default().await.ok_or(())?;

    adapter.wait_available().await.map_err(|_| ())?;

    let device_id: DeviceId = serde_json::from_str(&id).unwrap();
    let d = adapter.open_device(&device_id).await.map_err(|_| ())?;

    if !d.is_connected().await {
        adapter.connect_device(&d).await.map_err(|_| ())?;
    }

    let service = d
        .discover_services_with_uuid(SVC_UUID)
        .await
        .map_err(|e| ())?
        .get(0)
        .cloned();

    if let Some(s) = service {
        let char = s
            .discover_characteristics_with_uuid(RPC_CHRC_UUID)
            .await
            .map_err(|_| ())?
            .get(0)
            .cloned();

        if let Some(c) = char {
            let c2 = c.clone();
            let ah1 = app_handle.clone();
            let notify_handle = tauri::async_runtime::spawn(async move {
                if let Ok(mut n) = c2.notify().await {
                    use tauri::Emitter;

                    while let Some(Ok(vn)) = n.next().await {
                        ah1.emit("connection_data", vn.clone());
                    }
                }
            });

            let ah2 = app_handle.clone();
            let disconnect_handle = tauri::async_runtime::spawn(async move {
                // Need to keep adapter from being dropped while active/connected
                let a = adapter;

                use tauri::Emitter;
                use tauri::Manager;

                if let Ok(mut events) = a.device_connection_events(&d).await {
                    while let Some(ev) = events.next().await {
                        if ev == ConnectionEvent::Disconnected {
                            let state = ah2.state::<super::commands::ActiveConnection>();
                            *state.conn.lock().await = None;

                            if let Err(e) = ah2.emit("connection_disconnected", ()) {
                                println!("ERROR RAISING! {:?}", e);
                            }

                            *state.conn.lock().await = None;
                        }
                    }
                };
            });

            let (send, mut recv) = channel(5);
            *state.conn.lock().await = Some(Box::new(send));
            tauri::async_runtime::spawn(async move {
                while let Some(data) = recv.next().await {
                    c.write(&data).await.expect("Write uneventfully");
                }

                disconnect_handle.abort();
                notify_handle.abort();
            });

            Ok(true)
        } else {
            Err(())
        }
    } else {
        Err(())
    }
}

#[cfg(target_os = "macos")]
async fn check_connected(adapter: &Adapter, device: &Device) -> bool {
    if let Ok(()) = adapter.connect_device(&device).await {
        true
    } else {
        false
    }
}

#[cfg(not(target_os = "macos"))]
async fn check_connected(_: &Adapter, device: &Device) -> bool {
    device.is_connected().await
}

const ADAPTER_TIMEOUT: Duration = Duration::from_secs(2);

#[command]
pub async fn gatt_list_devices() -> Result<Vec<super::commands::AvailableDevice>, ()> {
    let adapter = Adapter::default()
        .map(|a| a.ok_or(()))
        .and_then(|a| async {
            timeout(ADAPTER_TIMEOUT, a.wait_available())
                .await
                .map_err(|_| ())
                .map(|_| a)
        })
        .await;

    let mut ret = vec![];

    if let Ok(a) = adapter {
        let devices = a
            .discover_devices(&[SVC_UUID])
            .await
            .expect("GET DEVICES!")
            .take_until(async_std::task::sleep(Duration::from_secs(2)))
            .filter_map(|d| ready(d.ok()));

        futures::pin_mut!(devices);

        while let Some(device) = devices.next().await {
            if check_connected(&a, &device).await {
                let label = device.name_async().await.unwrap_or("Unknown".to_string());
                let id = serde_json::to_string(&device.id()).unwrap();

                ret.push(super::commands::AvailableDevice { label, id });
            } else {
                println!("Device isn't connected: {:?}", device);
            }
        }
    }

    Ok(ret)
}
