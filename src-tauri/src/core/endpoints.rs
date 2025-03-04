use std::collections::HashMap;

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

pub fn get_api_url(provider: &str, params: &HashMap<String, String>) -> Result<String, String> {
    let endpoints = get_provider_endpoints(provider)?;
    Ok(format_endpoint(endpoints.api_url, params))
}

pub fn get_models_url(provider: &str, params: &HashMap<String, String>) -> Result<String, String> {
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
    params: &HashMap<String, String>,
    model: &str,
) -> Result<String, String> {
    let models_url = get_models_url(provider, params)?;
    Ok(format!("{}/schema?model={}", models_url, model))
}

pub fn format_endpoint(url: &str, params: &HashMap<String, String>) -> String {
    let mut result = url.to_string();
    for (key, value) in params {
        result = result.replace(&format!("{{{}}}", key), value);
    }
    result
}
