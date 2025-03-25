mod api;
mod core;
mod db;
mod providers;
mod utils;

use std::sync::Arc;

use api::commands;
use tauri::Manager;
use tauri_plugin_store::StoreExt;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            tauri::async_runtime::block_on(async {
                match db::topics::initialize_database(&app.handle()).await {
                    Ok(db_conn) => {
                        app.manage(Arc::new(db_conn));
                        println!("Database connection established and managed");
                    }
                    Err(e) => {
                        eprintln!("Failed to initialize database: {}", e);
                    }
                }
            });
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
            commands::get_supported_providers,
            // db::topics::get_all_topics,
            // db::topics::get_messages_for_topic,
            // db::topics::add_topic,
            // db::topics::add_message,
            // db::topics::remove_topic,
            // db::topics::edit_topic_name,
            // db::topics::remove_message,
            // db::topics::get_last_accessed_topic,
            // db::topics::update_topic_access,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
