// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use serde_json::{json, Value};
use std::env;
mod types;
use serde::{Deserialize, Serialize};
use tauri::Emitter;
use types::*;
use futures_util::StreamExt;

#[derive(Debug, Serialize, Deserialize)]
pub struct StreamResponse {
    response: String,
}

// #[tauri::command]
// async fn call_cloudflare_api(
//     window: tauri::Window,
//     model: String,
//     messages: Value,
// ) -> Result<String, String> {
//     println!("call_cloudflare_api {}, {}", model, messages);
//
//     let api_token = env::var("CLOUDFLARE_API_TOKEN")
//         .map_err(|_| "CLOUDFLARE_API_TOKEN not found".to_string())?;
//
//     let account_id = env::var("CLOUDFLARE_ACCOUNT_ID")
//         .map_err(|_| "CLOUDFLARE_ACCOUNT_ID not found".to_string())?;
//
//     let mut input_map = messages.as_object().unwrap().clone();
//     input_map.insert("stream".to_string(), json!(true));
//
//     let client = reqwest::Client::new();
//     let mut response = client
//         .post(format!(
//             "https://api.cloudflare.com/client/v4/accounts/{}/ai/run/{}",
//             account_id, model
//         ))
//         .header("Authorization", format!("Bearer {}", api_token))
//         .json(&input_map)
//         .send()
//         .await
//         .map_err(|e| e.to_string())?;
//
//     let mut accumulated_text = String::new();
//
//     while let Some(chunk) = response.chunk().await.map_err(|e| e.to_string())? {
//         let chunk_str = String::from_utf8(chunk.to_vec()).map_err(|e| e.to_string())?;
//
//         for line in chunk_str.lines() {
//             if let Some(data) = line.strip_prefix("data: ") {
//                 if data == "[DONE]" {
//                     break;
//                 }
//
//                 match serde_json::from_str::<StreamResponse>(data) {
//                     Ok(stream_response) => {
//                         accumulated_text.push_str(&stream_response.response);
//                         window
//                             .emit("stream-response", &stream_response.response)
//                             .map_err(|e| e.to_string())?;
//                     }
//                     Err(e) => {
//                         println!("Error parsing stream response: {}", e);
//                     }
//                 }
//             }
//         }
//     }
//
//     Ok(accumulated_text)
// }

#[tauri::command]
async fn call_cloudflare_api(
    window: tauri::Window,
    model: String,
    messages: Value,
) -> Result<String, String> {
    
    let api_token = env::var("CLOUDFLARE_API_TOKEN")
        .map_err(|_| "CLOUDFLARE_API_TOKEN not found".to_string())?;

    let account_id = env::var("CLOUDFLARE_ACCOUNT_ID")
        .map_err(|_| "CLOUDFLARE_ACCOUNT_ID not found".to_string())?;

    let mut input_map = messages.as_object().unwrap().clone();
    input_map.insert("stream".to_string(), json!(true));

    let client = reqwest::Client::new();
        let response = client
        .post(format!(
            "https://api.cloudflare.com/client/v4/accounts/{}/ai/run/{}",
            account_id, model
        ))
        .header("Authorization", format!("Bearer {}", api_token))
        .json(&input_map)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let mut accumulated_text = String::new();
    let mut buffer = String::new();

    let mut stream = response.bytes_stream();
    
    while let Some(chunk) = stream.next().await {
    let chunk = chunk.map_err(|e| e.to_string())?;
    let chunk_str = String::from_utf8(chunk.to_vec()).map_err(|e| e.to_string())?;
    
    buffer.push_str(&chunk_str);
    
    while let Some(pos) = buffer.find('\n') {
        let line = buffer[..pos].trim().to_string(); // Create owned String
        let remaining = buffer[pos + 1..].to_string(); // Create owned String
        buffer = remaining; // Assign after processing line

        if let Some(data) = line.strip_prefix("data: ") {
            if data == "[DONE]" {
                return Ok(accumulated_text);
            }

            match serde_json::from_str::<StreamResponse>(data) {
                Ok(stream_response) => {
                    accumulated_text.push_str(&stream_response.response);
                    window
                        .emit("stream-response", &stream_response.response)
                        .map_err(|e| e.to_string())?;
                }
                Err(e) => {
                    eprintln!("Error parsing stream response: {}", e);
                }
            }
        }
    }
    }

    Ok(accumulated_text)
}

#[tauri::command]
async fn get_all_cloudflare_ai_models() -> Result<CloudflareModelResponse, String> {
    let api_token = env::var("CLOUDFLARE_API_TOKEN")
        .map_err(|_| "CLOUDFLARE_API_TOKEN not found".to_string())?;
    println!("get_all_cloudflare_ai_models {}", api_token);

    let account_id = env::var("CLOUDFLARE_ACCOUNT_ID")
        .map_err(|_| "CLOUDFLARE_ACCOUNT_ID not found".to_string())?;

    let client = reqwest::Client::new();
    let response = client
        .get(format!(
            "https://api.cloudflare.com/client/v4/accounts/{}/ai/models/search",
            account_id
        ))
        .header("Authorization", format!("Bearer {}", api_token))
        .send()
        .await
        .map_err(|e| e.to_string())?;
    let result: CloudflareModelResponse = response.json().await.map_err(|e| e.to_string())?;

    Ok(result)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            call_cloudflare_api,
            get_all_cloudflare_ai_models
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
