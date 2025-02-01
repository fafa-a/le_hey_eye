// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use serde_json::Value;
use std::env;
mod types;
use types::*;

#[tauri::command]
async fn call_cloudflare_api(model: String, input: Value) -> Result<CloudflareResponse, String> {

    let api_token = env::var("CLOUDFLARE_API_TOKEN")
        .map_err(|_| "CLOUDFLARE_API_TOKEN not found".to_string())?;

    let account_id = env::var("CLOUDFLARE_ACCOUNT_ID")
        .map_err(|_| "CLOUDFLARE_ACCOUNT_ID not found".to_string())?;

    let client = reqwest::Client::new();
    let response = client
        .post(format!("https://api.cloudflare.com/client/v4/accounts/{}/ai/run/{}",account_id, model))
        .header("Authorization", format!("Bearer {}",api_token))
        .json(&input)
        .send()
        .await
        .map_err(|e| e.to_string())?;
    
    println!("{:?}", response);
    let result = response.json().await.map_err(|e| e.to_string())?;
    Ok(result)
}
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
