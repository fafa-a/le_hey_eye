use crate::core::credentials::{self, AnthropicCredentials};
use crate::core::endpoints;
use crate::core::models::{ChatRequest, Provider, StreamResponse};
use futures_util::StreamExt;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use std::sync::Arc;
use tauri::Emitter;
use tauri::Window;
use ts_rs::TS;

pub struct AnthropicProvider {}

impl AnthropicProvider  {
    #[allow(dead_code)]
    pub fn send_message_impl<R: tauri::Runtime>(
        &self,
        window: Window<R>,
        app: Arc<tauri::AppHandle<R>>,
        model: String,
        request: ChatRequest,
    ) -> tauri::async_runtime::JoinHandle<Result<StreamResponse, String>> {
        tauri::async_runtime::spawn(async move {

            let AnthropicCredentials {
                api_key,
            } = credentials::get_anthropic_credentials(&app).await?;


            let api_url = endpoints::get_api_url("cloudflare", None)?;

            let client = reqwest::Client::new();

            let response = client
                .post(api_url)
                .header("x-api-key", api_key)
                .header("anthropic-version", "2023-06-01")
                .header("Content-Type", "application/json")
                .json(&request)
                .send()
                .await
                .map_err(|e| e.to_string())?;

            if response.status().is_client_error() || response.status().is_server_error() {
                let error_body = response.text().await.map_err(|e| e.to_string())?;
                return Err(format!("Anthropic API Error: {}", error_body));
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
            })
        })
    }

    #[allow(dead_code)]
    pub fn list_models_impl<R: tauri::Runtime>(
        &self,
        app: Arc<tauri::AppHandle<R>>,
    ) -> tauri::async_runtime::JoinHandle<Result<Vec<String>, String>> {
        tauri::async_runtime::spawn(async move {
            // Implémentation pour CloudFlare
            // ...
            Ok(vec!["claude-3-7-sonnet-20250219".to_string()])
        })
    }

    // #[allow(dead_code)]
    // pub fn get_model_details_impl<R: tauri::Runtime>(
    //     &self,
    //     app: Arc<tauri::AppHandle<R>>,
    //     model: String,
    // ) -> tauri::async_runtime::JoinHandle<Result<serde_json::Value, String>> {
    //     tauri::async_runtime::spawn(async move {
    //         let AnthropicCredentials {
    //             api_key,
    //         } = credentials::get_anthropic_credentials(&app).await?;
    //
    //         let details_url = endpoints::get_model_schema_url("anthropic", &params, &model)?;
    //
    //         let client = reqwest::Client::new();
    //         let response = client
    //             .get(details_url)
    //             .header("Authorization", format!("Bearer {}", api_token))
    //             .send()
    //             .await
    //             .map_err(|e| e.to_string())?;
    //
    //         let result: CloudFlareModelDetailsResponse =
    //             response.json().await.map_err(|e| e.to_string())?;
    //
    //         Ok(serde_json::to_value(result.result).map_err(|e| e.to_string())?)
    //     })
    // }

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
