pub struct AIProvider {
    id: String,
    name: String,
    endpoint: String,
    requires_account_id: bool,
    default_model: Option<String>,
    models: Vec<AIModel>,
}

pub struct AIModel {
    id: String,
    name: String,
    max_tokens: u32,
    capabilities: Vec<String>,
}

pub struct AICredentials {
    provider_id: String,
    api_key: String,
    account_id: Option<String>,
    organization_id: Option<String>,
}

mod credentials_manager {
    // Chiffrement et déchiffrement des credentials
    // Stockage sécurisé dans le store Tauri
}
