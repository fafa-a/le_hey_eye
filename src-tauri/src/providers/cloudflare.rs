use crate::core::credentials::{self, CloudflareCredentials};
use crate::core::endpoints;
use crate::core::models::{ChatRequest, StreamResponse};
use futures_util::StreamExt;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use std::sync::Arc;
use tauri::Emitter;
use tauri::Window;
use ts_rs::TS;

pub struct CloudflareProvider {}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct CloudflareError {
    pub code: i32,
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize, TS)]
pub struct CloudflareModelTask {
    pub id: String,
    pub name: String,
    pub description: String,
}

#[derive(Debug, Serialize, Deserialize, TS)]
pub struct CloudflareModelProperty {
    pub property_id: String,
    pub value: String,
}

#[derive(Debug, Serialize, Deserialize, TS)]
pub struct CloudflareModel {
    pub id: String,
    pub source: i32,
    pub name: String,
    pub description: String,
    pub task: CloudflareModelTask,
    pub tags: Vec<String>,
    pub properties: Vec<CloudflareModelProperty>,
}

#[derive(Debug, Serialize, Deserialize, TS)]
pub struct CloudflareResultInfo {
    pub count: i32,
    pub page: i32,
    pub per_page: i32,
    pub total_count: i32,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/cloudflare.ts")]
pub struct CloudflareModelResponse {
    pub success: bool,
    pub result: Vec<CloudflareModel>,
    pub errors: Vec<CloudflareError>,
    pub messages: Vec<String>,
    pub result_info: CloudflareResultInfo,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CloudFlareModelDetailsResponse {
    pub result: std::collections::HashMap<String, Value>,
    pub success: bool,
}

impl CloudflareProvider {
    #[allow(dead_code)]
    pub fn send_message_impl<R: tauri::Runtime>(
        &self,
        window: Window<R>,
        app: Arc<tauri::AppHandle<R>>,
        model: String,
        request: ChatRequest,
    ) -> tauri::async_runtime::JoinHandle<Result<StreamResponse, String>> {
        tauri::async_runtime::spawn(async move {
            let CloudflareCredentials {
                account_id,
                api_token,
            } = credentials::get_cloudflare_credentials(&app).await?;

            let mut params = HashMap::new();
            params.insert("account_id".to_string(), account_id.clone());
            params.insert("model".to_string(), model.clone());

            let api_url = endpoints::get_api_url("cloudflare", Some(&params))?;

            let client = reqwest::Client::new();

            let response = client
                .post(api_url)
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
            let mut tokens_usage = None;

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
                                usage: tokens_usage,
                                thinking: None,
                            });
                        }

                        match serde_json::from_str::<StreamResponse>(data) {
                            Ok(stream_response) => {
                                accumulated_text.push_str(&stream_response.response);
                                if let Some(usage) = &stream_response.usage {
                                    tokens_usage = Some(usage.clone());
                                }
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
                usage: tokens_usage,
                thinking: None,
            })
        })
    }

    #[allow(dead_code)]
    pub fn list_models_impl<R: tauri::Runtime>(
        &self,
        _app: Arc<tauri::AppHandle<R>>,
    ) -> tauri::async_runtime::JoinHandle<Result<Vec<String>, String>> {
        tauri::async_runtime::spawn(async move {
            // Implémentation pour CloudFlare
            // ...
            Ok(vec!["@cf/meta/llama-3-8b-instruct".to_string()])
        })
    }

    #[allow(dead_code)]
    pub fn get_model_details_impl<R: tauri::Runtime>(
        &self,
        app: Arc<tauri::AppHandle<R>>,
        model: String,
    ) -> tauri::async_runtime::JoinHandle<Result<serde_json::Value, String>> {
        tauri::async_runtime::spawn(async move {
            let CloudflareCredentials {
                account_id,
                api_token,
            } = credentials::get_cloudflare_credentials(&app).await?;

            let mut params = HashMap::new();
            params.insert("account_id".to_string(), account_id.clone());
            params.insert("model".to_string(), model.clone());

            let details_url = endpoints::get_model_schema_url("cloudflare", Some(&params), &model)?;

            let client = reqwest::Client::new();
            let response = client
                .get(details_url)
                .header("Authorization", format!("Bearer {}", api_token))
                .send()
                .await
                .map_err(|e| e.to_string())?;

            let result: CloudFlareModelDetailsResponse =
                response.json().await.map_err(|e| e.to_string())?;

            Ok(serde_json::to_value(result.result).map_err(|e| e.to_string())?)
        })
    }

    #[allow(dead_code)]
    pub fn has_credentials_impl<R: tauri::Runtime>(
        &self,
        app: Arc<tauri::AppHandle<R>>,
    ) -> tauri::async_runtime::JoinHandle<Result<bool, String>> {
        tauri::async_runtime::spawn(async move {
            let result = credentials::get_cloudflare_credentials(&app).await.is_ok();
            Ok(result)
        })
    }
}
