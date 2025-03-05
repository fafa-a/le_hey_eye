use crate::utils::crypto;
use serde::{Deserialize, Serialize};
use tauri_plugin_store::StoreExt;

pub const CREDENTIALS_STORE: &str = "credentials.json";

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct CloudflareCredentials {
    pub account_id: String,
    pub api_token: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct AnthropicCredentials {
    pub api_key: String,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct MistralCredentials {
    pub api_key: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProviderCredentials {
    pub provider_id: String,
    pub credentials: serde_json::Value,
}

pub const CLOUDFLARE_CREDENTIALS_KEY: &str = "CLOUDFLARE_CREDENTIALS";
pub const ANTHROPIC_CREDENTIALS_KEY: &str = "ANTHROPIC_CREDENTIALS";
pub const MISTRAL_CREDENTIALS_KEY: &str = "MISTRAL_CREDENTIALS";

pub fn get_credentials_key(provider_id: &str) -> &'static str {
    match provider_id {
        "cloudflare" => CLOUDFLARE_CREDENTIALS_KEY,
        "anthropic" => ANTHROPIC_CREDENTIALS_KEY,
        "mistral" => MISTRAL_CREDENTIALS_KEY,
        _ => panic!("Unknown provider: {}", provider_id),
    }
}

pub async fn save_credentials<T: Serialize, R: tauri::Runtime>(
    app: &tauri::AppHandle<R>,
    credentials_key: &str,
    credentials: &T,
) -> Result<(), String> {
    let store = app.store(CREDENTIALS_STORE).map_err(|e| e.to_string())?;
    let json_value = serde_json::to_value(credentials).map_err(|e| e.to_string())?;

    let encrypted_value = crypto::encrypt_value(json_value)?;

    store.set(credentials_key.to_string(), encrypted_value);

    Ok(())
}

pub async fn get_credentials<T: for<'de> Deserialize<'de>, R: tauri::Runtime>(
    app: &tauri::AppHandle<R>,
    credentials_key: &str,
) -> Result<T, String> {
    let store = app.store(CREDENTIALS_STORE).map_err(|e| e.to_string())?;

    let encrypted_value = store
        .get(credentials_key)
        .ok_or_else(|| format!("No credentials found for key: {}", credentials_key))?;

    let decrypted_value = crypto::decrypt_value(encrypted_value)?;

    serde_json::from_value::<T>(decrypted_value)
        .map_err(|e| format!("Failed to deserialize credentials: {}", e))
}

pub async fn get_cloudflare_credentials<R: tauri::Runtime>(
    app: &tauri::AppHandle<R>,
) -> Result<CloudflareCredentials, String> {
    get_credentials(app, CLOUDFLARE_CREDENTIALS_KEY).await
}

pub async fn save_cloudflare_credentials<R: tauri::Runtime>(
    app: &tauri::AppHandle<R>,
    credentials: &CloudflareCredentials,
) -> Result<(), String> {
    save_credentials(app, CLOUDFLARE_CREDENTIALS_KEY, credentials).await
}

pub async fn save_anthropic_credentials<R: tauri::Runtime>(
    app: &tauri::AppHandle<R>,
    credentials: &AnthropicCredentials,
) -> Result<(), String> {
    save_credentials(app, ANTHROPIC_CREDENTIALS_KEY, credentials).await
}

pub async fn get_anthropic_credentials<R: tauri::Runtime>(
    app: &tauri::AppHandle<R>,
) -> Result<AnthropicCredentials, String> {
    get_credentials(app, ANTHROPIC_CREDENTIALS_KEY).await
}

#[allow(dead_code)]
pub async fn save_mistral_credentials<R: tauri::Runtime>(
    app: &tauri::AppHandle<R>,
    credentials: &MistralCredentials,
) -> Result<(), String> {
    save_credentials(app, MISTRAL_CREDENTIALS_KEY, credentials).await
}

#[allow(dead_code)]
pub async fn get_mistral_credentials<R: tauri::Runtime>(
    app: &tauri::AppHandle<R>,
) -> Result<MistralCredentials, String> {
    get_credentials(app, MISTRAL_CREDENTIALS_KEY).await
}
