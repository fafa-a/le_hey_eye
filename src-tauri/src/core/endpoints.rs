use std::collections::HashMap;

use super::models::{ChatRequest, ProviderType};

pub struct ProviderEndpoints {
    pub api_url: &'static str,
    pub models_url: Option<&'static str>,
}

pub const CLOUDFLARE: ProviderEndpoints = ProviderEndpoints {
    api_url: "https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/run/{model}",
    models_url: Some("https://api.cloudflare.com/client/v4/accounts/{account_id}/ai/models"),
};

pub const ANTHROPIC: ProviderEndpoints = ProviderEndpoints {
    api_url: "https://api.anthropic.com/v1/messages",
    models_url: None,
};

pub const MISTRAL: ProviderEndpoints = ProviderEndpoints {
    api_url: "https://api.mistral.ai/v1/chat/completions",
    models_url: Some("https://api.mistral.ai/v1/models"),
};

pub fn get_provider_endpoints(provider_id: &str) -> Result<&'static ProviderEndpoints, String> {
    match provider_id {
        "cloudflare" => Ok(&CLOUDFLARE),
        "anthropic" => Ok(&ANTHROPIC),
        "mistral" => Ok(&MISTRAL),
        _ => Err(format!("Unknown provider: {}", provider_id)),
    }
}

pub fn get_api_url(
    provider: &str,
    params: Option<&HashMap<String, String>>,
) -> Result<String, String> {
    let endpoints = get_provider_endpoints(provider)?;
    Ok(format_endpoint(endpoints.api_url, params))
}

pub fn get_models_url(
    provider: &str,
    params: Option<&HashMap<String, String>>,
) -> Result<String, String> {
    let endpoints = get_provider_endpoints(provider)?;
    match &endpoints.models_url {
        Some(url) => Ok(format_endpoint(url, params)),
        None => Err(format!(
            "Provider {} doesn't have a models URL configured",
            provider
        )),
    }
}

pub fn get_model_schema_url(
    provider: &str,
    params: Option<&HashMap<String, String>>,
    model: &str,
) -> Result<String, String> {
    let models_url = get_models_url(provider, params)?;
    Ok(format!("{}/schema?model={}", models_url, model))
}

pub fn format_endpoint(url: &str, params: Option<&HashMap<String, String>>) -> String {
    let mut result = url.to_string();
    if let Some(params) = params {
        for (key, value) in params {
            result = result.replace(&format!("{{{}}}", key), value);
        }
    }
    result
}

pub fn prepare_request_for_provider(
    provider: &ProviderType,
    model: &str,
    mut request: ChatRequest,
) -> (ChatRequest, Option<HashMap<String, String>>) {
    match provider.as_str() {
        "anthropic" => {
            request.model = Some(model.to_string());
            (request, None)
        }
        "cloudflare" => {
            let mut params = HashMap::new();
            params.insert("model".to_string(), model.to_string());
            (request, Some(params))
        }
        "mistral" => {
            request.model = Some(model.to_string());
            (request, None)
        }
        _ => (request, None),
    }
}
