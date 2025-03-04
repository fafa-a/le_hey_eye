use crate::core::models::{ChatRequest, Provider, StreamResponse};
use std::sync::Arc;
use tauri::{AppHandle, Runtime, Window};

// We can't use generic methods in trait objects, so we need to redesign
// our approach completely.

// Define a trait that doesn't rely on generic methods
pub trait LLMProvider: Send + Sync {
    fn provider_id(&self) -> &'static str;
}

// We'll implement provider-specific methods without using generics in the trait object
// Instead, we'll use concrete implementations for specific Runtime types
// and dispatch to those as needed.

// Function to dispatch to the actual provider implementation based on provider ID
#[allow(dead_code)]
pub fn get_provider(provider_id: &str) -> Option<Box<dyn LLMProvider>> {
    // Use our own Provider enum
    match Provider::from_str(provider_id) {
        Some(Provider::Cloudflare) => {
            let provider = crate::providers::cloudflare::CloudflareProvider {};
            // We need to implement the LLMProvider trait for CloudflareProvider
            struct CloudflareProviderWrapper(crate::providers::cloudflare::CloudflareProvider);
            impl LLMProvider for CloudflareProviderWrapper {
                fn provider_id(&self) -> &'static str {
                    "cloudflare"
                }
            }
            Some(Box::new(CloudflareProviderWrapper(provider)))
        },
        Some(Provider::Anthropic) => None, 
        Some(Provider::Mistral) => None,  
        None => None,
    }
}

// Concrete dispatching functions for each runtime operation
#[allow(dead_code)]
pub async fn send_message<R: Runtime>(
    provider: &dyn LLMProvider,
    window: Window<R>,
    app: AppHandle<R>,
    model: String,
    request: ChatRequest,
) -> Result<StreamResponse, String> {
    let app_arc = Arc::new(app);
    
    // Create a new provider instance rather than trying to access the internal one
    // This is safe since CloudflareProvider doesn't have any state
    match provider.provider_id() {
        "cloudflare" => {
            let provider = crate::providers::cloudflare::CloudflareProvider {};
            let handle = provider.send_message_impl(window, app_arc, model, request);
            handle.await.unwrap()
        },
        _ => Err(format!("Unsupported provider: {}", provider.provider_id()))
    }
}

#[allow(dead_code)]
pub async fn list_models<R: Runtime>(
    provider: &dyn LLMProvider,
    app: AppHandle<R>,
) -> Result<Vec<String>, String> {
    let app_arc = Arc::new(app);
    
    // Create a new provider instance
    match provider.provider_id() {
        "cloudflare" => {
            let provider = crate::providers::cloudflare::CloudflareProvider {};
            let handle = provider.list_models_impl(app_arc);
            handle.await.unwrap()
        },
        _ => Err(format!("Unsupported provider: {}", provider.provider_id()))
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
        },
        _ => Err(format!("Unsupported provider: {}", provider.provider_id()))
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
        },
        _ => Err(format!("Unsupported provider: {}", provider.provider_id()))
    }
}
