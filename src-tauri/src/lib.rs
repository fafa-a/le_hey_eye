mod api;
mod core;
mod providers;
mod utils;

use api::commands;
use tauri_plugin_store::StoreExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            app.store("credentials.json")
                .expect("Failed to create store");

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::send_message,
            commands::list_models,
            commands::get_model_details,
            commands::has_credentials,
            commands::save_credentials,
            commands::get_supported_providers
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
