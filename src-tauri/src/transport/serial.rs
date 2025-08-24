use blocking::unblock;
use futures::channel::mpsc::channel;
use futures::StreamExt;

use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio_serial::{available_ports, SerialPortBuilderExt, SerialPortType};

use tauri::{command, AppHandle, State};
use tauri_plugin_cli::CliExt;

const READ_BUF_SIZE: usize = 1024;

// Add a new state to track the spawned tasks
#[derive(Debug, Default)]
pub struct SerialConnectionState {
    pub read_handle: Option<tauri::async_runtime::JoinHandle<()>>,
    pub write_handle: Option<tauri::async_runtime::JoinHandle<()>>,
}

#[command]
pub async fn serial_connect(
    id: String,
    app_handle: AppHandle,
    state: State<'_, super::commands::ActiveConnection<'_>>,
    serial_state: State<'_, SerialConnectionState>,
) -> Result<bool, String> {
    match tokio_serial::new(id, 9600).open_native_async() {
        Ok(mut port) => {
            #[cfg(unix)]
            port.set_exclusive(false)
                .expect("Unable to set serial port exclusive to false");

            let (mut reader, mut writer) = tokio::io::split(port);

            let ahc = app_handle.clone();
            let (send, mut recv) = channel(5);
            *state.conn.lock().await = Some(Box::new(send));

            let read_process = tauri::async_runtime::spawn(async move {
                use tauri::Manager;
                use tauri::Emitter;

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

            let write_process = tauri::async_runtime::spawn(async move {
                use tauri::Manager;

                while let Some(data) = recv.next().await {
                    let _res = writer.write(&data).await;
                }

                let state = ahc.state::<super::commands::ActiveConnection>();
                read_process.abort();
                *state.conn.lock().await = None;
            });

            // Store the handles for later cleanup
            *serial_state.read_handle.lock().await = Some(read_process);
            *serial_state.write_handle.lock().await = Some(write_process);

            Ok(true)
        }
        Err(e) => {
            Err(format!("Failed to open the serial port: {}", e.description))
        }
    }
}

#[command]
pub async fn serial_disconnect(
    app_handle: AppHandle,
    state: State<'_, super::commands::ActiveConnection<'_>>,
    serial_state: State<'_, SerialConnectionState>,
) -> Result<(), String> {
    // Abort the spawned tasks
    if let Some(handle) = serial_state.read_handle.lock().await.take() {
        handle.abort();
    }
    if let Some(handle) = serial_state.write_handle.lock().await.take() {
        handle.abort();
    }

    // Clear the connection state
    *state.conn.lock().await = None;

    // Emit disconnect event
    app_handle.emit("connection_disconnected", ()).map_err(|e| e.to_string())?;

    Ok(())
}

#[command]
pub async fn serial_list_devices(app_handle: AppHandle) -> Result<Vec<super::commands::AvailableDevice>, ()> {
    let ports = unblock(|| available_ports()).await.unwrap();

    let mut candidates = ports
        .into_iter()
        .filter_map(|pi| {
            if let SerialPortType::UsbPort(u) = pi.port_type {
                Some(super::commands::AvailableDevice {
                    id: pi.port_name,
                    label: u.product.unwrap_or("TODO".to_string()),
                })
            } else {
                None
            }
        })
        .collect::<Vec<_>>();

    match app_handle.cli().matches() {
        Ok(m) => {
            if let Some(p) = m.args.get("serial-port") {
                if let serde_json::Value::String(path) = &p.value {
                    candidates.push(super::commands::AvailableDevice {
                        id: path.to_string(),
                        label: format!("CLI Port: {path}").to_string(),
                    })
                }
            }
        },
        Err(_) => {},
    }

    Ok(candidates)
}
