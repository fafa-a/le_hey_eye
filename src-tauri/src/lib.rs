use serde_json::{json, Value};
use std::env;
mod types;
use futures_util::StreamExt;
use magic_crypt::{new_magic_crypt, MagicCryptTrait};
use tauri::Emitter;
use tauri::Runtime;
use tauri_plugin_store::StoreExt;
use types::*;

#[tauri::command]
async fn call_cloudflare_api<R: Runtime>(
    window: tauri::Window,
    app: tauri::AppHandle<R>,
    model: String,
    request: ChatRequest,
) -> Result<StreamResponse, String> {
    println!("call_cloudflare_api {:?}", request);

    let Credentials {
        account_id,
        api_token,
    } = get_credentials(app).await?;

    // let mut input_map = request.as_object().unwrap().clone();
    // input_map.insert("stream".to_string(), json!(true));

    let client = reqwest::Client::new();
    let response = client
        .post(format!(
            "https://api.cloudflare.com/client/v4/accounts/{}/ai/run/{}",
            account_id, model
        ))
        .header("Authorization", format!("Bearer {}", api_token))
        .json(&request)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if response.status() == 400 {
        let error_body = response.text().await.map_err(|e| e.to_string())?;
        println!("Error response body: {}", error_body);
        return Err(format!("API Error: {}", error_body));
    }

    let mut accumulated_text = String::new();
    let mut buffer = String::new();

    let mut stream = response.bytes_stream();

    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| e.to_string())?;
        let chunk_str = String::from_utf8(chunk.to_vec()).map_err(|e| e.to_string())?;

        buffer.push_str(&chunk_str);

        while let Some(pos) = buffer.find('\n') {
            let line = buffer[..pos].trim().to_string();
            let remaining = buffer[pos + 1..].to_string();
            buffer = remaining;

            if let Some(data) = line.strip_prefix("data: ") {
                if data == "[DONE]" {
                    return Ok(StreamResponse {
                        response: accumulated_text,
                    });
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

    Ok(StreamResponse {
        response: accumulated_text,
    })
}

#[tauri::command]
async fn get_all_cloudflare_ai_models<R: Runtime>(
    app: tauri::AppHandle<R>,
) -> Result<CloudflareModelResponse, String> {
    let Credentials {
        account_id,
        api_token,
    } = get_credentials(app).await?;

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

#[tauri::command]
async fn save_credentials<R: Runtime>(
    app: tauri::AppHandle<R>,
    account_id: String,
    api_token: String,
) -> Result<(), String> {
    let store = app.store("credentials.json").map_err(|e| e.to_string())?;

    let crypto = new_magic_crypt!("magic-key", 256);

    let encrypted_account = crypto.encrypt_str_to_base64(&account_id);
    let encrypted_token = crypto.encrypt_str_to_base64(&api_token);

    store.set(
        "credentials",
        json!({
            "account_id": encrypted_account,
            "api_token": encrypted_token
        }),
    );

    Ok(())
}

#[tauri::command]
async fn get_cloudflare_ai_models_details<R: Runtime>(
    app: tauri::AppHandle<R>,
    model: String,
) -> Result<CloudFlareModelDetailsResponse, String> {
    let Credentials {
        account_id,
        api_token,
    } = get_credentials(app).await?;

    let client = reqwest::Client::new();
    let response = client
        .get(format!(
            "https://api.cloudflare.com/client/v4/accounts/{}/ai/models/schema?model={}",
            account_id, model
        ))
        .header("Authorization", format!("Bearer {}", api_token))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let result: CloudFlareModelDetailsResponse =
        response.json().await.map_err(|e| e.to_string())?;

    Ok(result)
}

#[tauri::command]
async fn get_credentials<R: Runtime>(app: tauri::AppHandle<R>) -> Result<Credentials, String> {
    let store = app.store("credentials.json").map_err(|e| e.to_string())?;
    let crypto = new_magic_crypt!("magic-key", 256);

    let creds = store.get("credentials").ok_or("No credentials found")?;

    let encrypted_account = creds["account_id"]
        .as_str()
        .ok_or("Invalid account_id format")?;
    let encrypted_token = creds["api_token"]
        .as_str()
        .ok_or("Invalid api_token format")?;

    Ok(Credentials {
        account_id: crypto
            .decrypt_base64_to_string(encrypted_account)
            .map_err(|e| e.to_string())?,
        api_token: crypto
            .decrypt_base64_to_string(encrypted_token)
            .map_err(|e| e.to_string())?,
    })
}

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
            call_cloudflare_api,
            get_all_cloudflare_ai_models,
            save_credentials,
            get_credentials,
            get_cloudflare_ai_models_details
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
