use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Runtime, Window};

use crate::core::credentials::{
    self, AnthropicCredentials, CloudflareCredentials, MistralCredentials,
};
use crate::core::llm_trait;
use crate::core::models::{ChatRequest, Provider, StreamResponse};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum ProviderCredentials {
    Cloudflare {
        account_id: String,
        api_token: String,
    },
    Anthropic {
        api_key: String,
    },
    Mistral {
        api_key: String,
    },
}

#[tauri::command]
pub async fn send_message<R: Runtime>(
    window: Window<R>,
    app: AppHandle<R>,
    provider: Provider,
    model: String,
    request: serde_json::Value,
) -> Result<StreamResponse, String> {
    let provider_id = provider.as_str();
    let request: ChatRequest = match serde_json::from_value(request.clone()) {
        Ok(req) => req,
        Err(e) => {
            println!("Désérialisation error: {}", e);
            println!(
                "JSON structure: {}",
                serde_json::to_string_pretty(&request).unwrap()
            );
            return Err(format!("Invalid request format: {}", e));
        }
    };

    let provider_impl = llm_trait::get_provider(provider_id)
        .ok_or(format!("Unsupported provider: {}", provider_id))?;

    llm_trait::send_message(&*provider_impl, window, app, model, request).await
}

#[tauri::command]
#[allow(dead_code)]
pub async fn list_models<R: Runtime>(
    app: AppHandle<R>,
    provider: Provider,
) -> Result<Vec<String>, String> {
    let provider_id = provider.as_str();

    let provider_impl = llm_trait::get_provider(provider_id)
        .ok_or(format!("Unsupported provider: {}", provider_id))?;

    llm_trait::list_models(&*provider_impl, app).await
}

#[tauri::command]
#[allow(dead_code)]
pub async fn get_model_details<R: Runtime>(
    app: AppHandle<R>,
    provider: Provider,
    model: String,
) -> Result<serde_json::Value, String> {
    let provider_id = provider.as_str();

    let provider_impl = llm_trait::get_provider(provider_id)
        .ok_or(format!("Unsupported provider: {}", provider_id))?;

    llm_trait::get_model_details(&*provider_impl, app, model).await
}

#[tauri::command]
#[allow(dead_code)]
pub async fn has_credentials<R: Runtime>(
    app: AppHandle<R>,
    provider: Provider,
) -> Result<bool, String> {
    let provider_id = provider.as_str();

    let provider_impl = llm_trait::get_provider(provider_id)
        .ok_or(format!("Unsupported provider: {}", provider_id))?;

    llm_trait::has_credentials(&*provider_impl, app).await
}

#[tauri::command]
#[allow(dead_code)]
pub async fn save_credentials<R: Runtime>(
    app: AppHandle<R>,
    creds: ProviderCredentials,
) -> Result<(), String> {
    match creds {
        ProviderCredentials::Cloudflare {
            account_id,
            api_token,
        } => {
            let credentials = CloudflareCredentials {
                account_id,
                api_token,
            };
            credentials::save_cloudflare_credentials(&app, &credentials).await
        }
        ProviderCredentials::Anthropic { api_key } => {
            let credentials = AnthropicCredentials { api_key };
            credentials::save_anthropic_credentials(&app, &credentials).await
        }
        ProviderCredentials::Mistral { api_key } => {
            let credentials = MistralCredentials { api_key };
            credentials::save_mistral_credentials(&app, &credentials).await
        }
    }
}

#[tauri::command]
#[allow(dead_code)]
pub fn get_supported_providers() -> Vec<Provider> {
    vec![Provider::Cloudflare, Provider::Anthropic, Provider::Mistral]
}
