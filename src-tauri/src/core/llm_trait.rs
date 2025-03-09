use crate::{
    core::models::{ChatRequest, Provider, StreamResponse},
    providers::anthropic::{AnthropicChatRequest, AnthropicResponse},
};
use std::sync::Arc;
use tauri::{AppHandle, Runtime, Window};

pub trait LLMProvider: Send + Sync {
    fn provider_id(&self) -> &'static str;
}

pub trait AnthropicAdapter {
    fn adapt_request(&self, request: ChatRequest) -> AnthropicChatRequest;
    fn adapt_response(&self, response: AnthropicResponse) -> StreamResponse;
}

// pub trait CloudflareAdapter {
//     fn adapt_request(&self, request: ChatRequest) -> CloudflareChatRequest;
//     fn adapt_response(&self, response: CloudflareResponse) -> StreamResponse;
// }

#[allow(dead_code)]
pub fn get_provider(provider_id: &str) -> Option<Box<dyn LLMProvider>> {
    match Provider::from_str(provider_id) {
        Some(Provider::Cloudflare) => {
            let provider = crate::providers::cloudflare::CloudflareProvider {};
            struct CloudflareProviderWrapper(crate::providers::cloudflare::CloudflareProvider);
            impl LLMProvider for CloudflareProviderWrapper {
                fn provider_id(&self) -> &'static str {
                    "cloudflare"
                }
            }
            Some(Box::new(CloudflareProviderWrapper(provider)))
        }
        Some(Provider::Anthropic) => {
            let provider = crate::providers::anthropic::AnthropicProvider {};
            struct AnthropicProviderWrapper(crate::providers::anthropic::AnthropicProvider);
            impl LLMProvider for AnthropicProviderWrapper {
                fn provider_id(&self) -> &'static str {
                    "anthropic"
                }
            }
            Some(Box::new(AnthropicProviderWrapper(provider)))
        }
        Some(Provider::Mistral) => None,
        None => None,
    }
}

#[allow(dead_code)]
pub async fn send_message<R: Runtime>(
    provider: &dyn LLMProvider,
    window: Window<R>,
    app: AppHandle<R>,
    model: String,
    request: ChatRequest,
) -> Result<StreamResponse, String> {
    let app_arc = Arc::new(app);

    match provider.provider_id() {
        "cloudflare" => {
            let provider = crate::providers::cloudflare::CloudflareProvider {};
            let handle = provider.send_message_impl(window, app_arc, model, request);
            handle.await.unwrap()
        }
        "anthropic" => {
            let provider = crate::providers::anthropic::AnthropicProvider {};
            let handle = provider.send_message_impl(window, app_arc, model, request);
            handle.await.unwrap()
        }
        _ => Err(format!("Unsupported provider: {}", provider.provider_id())),
    }
}

#[allow(dead_code)]
pub async fn list_models<R: Runtime>(
    provider: &dyn LLMProvider,
    app: AppHandle<R>,
) -> Result<Vec<String>, String> {
    let app_arc = Arc::new(app);

    match provider.provider_id() {
        "cloudflare" => {
            let provider = crate::providers::cloudflare::CloudflareProvider {};
            let handle = provider.list_models_impl(app_arc);
            handle.await.unwrap()
        }
        _ => Err(format!("Unsupported provider: {}", provider.provider_id())),
    }
}

#[allow(dead_code)]
pub async fn get_model_details<R: Runtime>(
    provider: &dyn LLMProvider,
    app: AppHandle<R>,
    model: String,
) -> Result<serde_json::Value, String> {
    let app_arc = Arc::new(app);

    // Create a new provider instance
    match provider.provider_id() {
        "cloudflare" => {
            let provider = crate::providers::cloudflare::CloudflareProvider {};
            let handle = provider.get_model_details_impl(app_arc, model);
            handle.await.unwrap()
        }
        _ => Err(format!("Unsupported provider: {}", provider.provider_id())),
    }
}

#[allow(dead_code)]
pub async fn has_credentials<R: Runtime>(
    provider: &dyn LLMProvider,
    app: AppHandle<R>,
) -> Result<bool, String> {
    let app_arc = Arc::new(app);

    // Create a new provider instance
    match provider.provider_id() {
        "cloudflare" => {
            let provider = crate::providers::cloudflare::CloudflareProvider {};
            let handle = provider.has_credentials_impl(app_arc);
            handle.await.unwrap()
        }
        _ => Err(format!("Unsupported provider: {}", provider.provider_id())),
    }
}
