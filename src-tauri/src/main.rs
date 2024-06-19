// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use futures::lock::Mutex;

mod transport;
use transport::commands::{transport_send_data, ActiveConnection};

use transport::gatt::{gatt_connect, gatt_list_devices};
use transport::serial::{serial_connect, serial_list_devices};

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_cli::init())
        .manage(ActiveConnection {
            conn: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            transport_send_data,
            gatt_list_devices,
            gatt_connect,
            serial_list_devices,
            serial_connect,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
