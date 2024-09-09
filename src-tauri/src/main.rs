// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::env;

use futures::lock::Mutex;

mod transport;
use transport::commands::{transport_close, transport_send_data, ActiveConnection};

use transport::gatt::{gatt_connect, gatt_list_devices};
use transport::serial::{serial_connect, serial_list_devices};

// Workaround for Tauri/WRY bug. See https://github.com/tauri-apps/tauri/issues/10686#issuecomment-2337395299
#[cfg(target_os = "linux")]
fn gnome_wayland_resize_fix() {
    if env::var("APPIMAGE").is_ok() || env::var("FLATPAK_ID").is_ok() {
        return;
    }

    let desktop = env::var("XDG_CURRENT_DESKTOP")
        .unwrap_or_default()
        .to_lowercase();
    if desktop.contains("gnome") {
        env::set_var("GDK_BACKEND", "x11");
    }
}

fn main() {
    #[cfg(target_os = "linux")]
    gnome_wayland_resize_fix();

    tauri::Builder::default()
        .plugin(tauri_plugin_cli::init())
        .manage(ActiveConnection {
            conn: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            transport_send_data,
            transport_close,
            gatt_list_devices,
            gatt_connect,
            serial_list_devices,
            serial_connect,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
