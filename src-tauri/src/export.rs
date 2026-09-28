use tauri::{command, AppHandle};
use tauri_plugin_dialog::DialogExt;

#[command]
pub async fn export_text_file(
    app_handle: AppHandle,
    file_name: String,
    contents: String,
) -> Result<bool, String> {
    let Some(path) = app_handle
        .dialog()
        .file()
        .set_title("Export keymap")
        .set_file_name(file_name)
        .add_filter("JSON", &["json"])
        .blocking_save_file()
    else {
        return Ok(false);
    };

    let path = path.into_path().map_err(|e| e.to_string())?;
    std::fs::write(&path, contents)
        .map_err(|e| format!("Failed to write {}: {e}", path.display()))?;
    Ok(true)
}
