use blocking::unblock;
use futures::channel::mpsc::channel;
use futures::lock::Mutex;
use futures::stream;
use futures::StreamExt;

use std::time::Duration;

use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio_serial::{available_ports, SerialPort, SerialPortBuilderExt, SerialPortType};

use serde::{Deserialize, Serialize};
use tauri::{
    command,
    ipc::{Request, Response},
    AppHandle, State, Window,
};

const READ_BUF_SIZE: usize = 1024;

#[command]
pub async fn serial_connect(
    id: String,
    app_handle: AppHandle,
    state: State<'_, super::commands::ActiveConnection<'_>>,
) -> Result<bool, ()> {
    match tokio_serial::new(id, 9600).open_native_async() {
        Ok(mut port) => {
            #[cfg(unix)]
            port.set_exclusive(false)
                .expect("Unable to set serial port exclusive to false");

            let (mut reader, mut writer) = tokio::io::split(port);

            let (send, mut recv) = channel(5);
            *state.conn.lock().await = Some(Box::new(send));
            tauri::async_runtime::spawn(async move {
                while let Some(data) = recv.next().await {
                    writer.write(&data).await;
                }
            });

            tauri::async_runtime::spawn(async move {
                use tauri::Manager;

                let mut buffer = vec![0; READ_BUF_SIZE];
                while let Ok(size) = reader.read(&mut buffer).await {
                    if size > 0 {
                        app_handle.emit("connection_data", &buffer[..size]);
                    } else {
                        break;
                    }
                }

                let state = app_handle.state::<super::commands::ActiveConnection>();
                *state.conn.lock().await = None;

                app_handle.emit("connection_disconnected", ());
            });

            Ok(true)
        }
        Err(_) => Err(()),
    }
}

#[command]
pub async fn serial_list_devices() -> Result<Vec<super::commands::AvailableDevice>, ()> {
    let ports = unblock(|| available_ports()).await.unwrap();

    let candidates = ports
        .into_iter()
        .filter_map(|pi| {
            println!("port {:?}", pi);
            match pi.port_type {
                SerialPortType::UsbPort(u) => Some(super::commands::AvailableDevice {
                    id: pi.port_name,
                    label: u.product.unwrap_or("TODO".to_string()),
                }),
                _ => None,
            }
        })
        .collect();

    println!("Candidates {:?}", candidates);
    Ok(candidates)
}
