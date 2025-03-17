use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::providers::anthropic::{
    AnthropicSystemPrompt, AnthropicThinkingConfig, AnthropicTool, AnthropicToolChoice,
    AnthropicToolChoiceType,
};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, TS)]
#[ts(export, export_to = "../../types/core.ts")]
pub enum ProviderType {
    Anthropic,
    Cloudflare,
    Mistral,
    OpenAI,
}

impl ProviderType {
    pub fn as_str(&self) -> &'static str {
        match self {
            ProviderType::Anthropic => "anthropic",
            ProviderType::Cloudflare => "cloudflare",
            ProviderType::Mistral => "mistral",
            ProviderType::OpenAI => "openai",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s.to_lowercase().as_str() {
            "anthropic" => Some(ProviderType::Anthropic),
            "cloudflare" => Some(ProviderType::Cloudflare),
            "mistral" => Some(ProviderType::Mistral),
            "openai" => Some(ProviderType::OpenAI),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/core.ts")]
pub enum ModelSettings {
    Anthropic(crate::providers::anthropic::AnthropicModelSettings),
    Base(BaseModelSettings),
}

impl ModelSettings {
    pub fn provider_type(&self) -> ProviderType {
        match self {
            ModelSettings::Anthropic(settings) => ProviderType::Anthropic,
            ModelSettings::Base(settings) => settings.provider.clone(),
        }
    }

    pub fn model_name(&self) -> &str {
        match self {
            ModelSettings::Anthropic(settings) => &settings.base.model,
            ModelSettings::Base(settings) => &settings.model,
        }
    }

    // API Fluide
    pub fn with_model(self, model: impl Into<String>) -> Self {
        match self {
            ModelSettings::Anthropic(mut settings) => {
                settings.base.model = model.into();
                ModelSettings::Anthropic(settings)
            }
            ModelSettings::Base(mut settings) => {
                settings.model = model.into();
                ModelSettings::Base(settings)
            }
        }
    }

    pub fn with_temperature(self, temperature: f32) -> Self {
        match self {
            ModelSettings::Anthropic(mut settings) => {
                settings.base.temperature = Some(temperature);
                ModelSettings::Anthropic(settings)
            }
            ModelSettings::Base(mut settings) => {
                settings.temperature = Some(temperature);
                ModelSettings::Base(settings)
            }
        }
    }

    pub fn with_max_tokens(self, max_tokens: u32) -> Self {
        match self {
            ModelSettings::Anthropic(mut settings) => {
                settings.base.max_tokens = Some(max_tokens);
                ModelSettings::Anthropic(settings)
            }
            ModelSettings::Base(mut settings) => {
                settings.max_tokens = Some(max_tokens);
                ModelSettings::Base(settings)
            }
        }
    }

    pub fn with_stream(self, enabled: bool) -> Self {
        match self {
            ModelSettings::Anthropic(mut settings) => {
                settings.base.stream = Some(enabled);
                ModelSettings::Anthropic(settings)
            }
            ModelSettings::Base(mut settings) => {
                settings.stream = Some(enabled);
                ModelSettings::Base(settings)
            }
        }
    }

    // Méthodes spécifiques à Anthropic
    pub fn with_thinking(self, budget_tokens: u32) -> Result<Self, String> {
        match self {
            ModelSettings::Anthropic(mut settings) => {
                settings = settings.with_thinking(budget_tokens)?;
                Ok(ModelSettings::Anthropic(settings))
            }
            _ => Err("Thinking is only supported by Anthropic models".to_string()),
        }
    }

    pub fn with_tools(
        self,
        tools: Vec<crate::providers::anthropic::AnthropicTool>,
    ) -> Result<Self, String> {
        match self {
            ModelSettings::Anthropic(mut settings) => {
                settings = settings.with_tools(tools);
                Ok(ModelSettings::Anthropic(settings))
            }
            _ => Err("Tools are only supported by Anthropic models".to_string()),
        }
    }

    pub fn with_auto_tool_choice(self) -> Result<Self, String> {
        match self {
            ModelSettings::Anthropic(mut settings) => {
                settings = settings.with_auto_tool_choice();
                Ok(ModelSettings::Anthropic(settings))
            }
            _ => Err("Tool choice is only supported by Anthropic models".to_string()),
        }
    }

    pub fn apply_to_request(&self, request: &mut ChatRequest) {
        match self {
            ModelSettings::Anthropic(settings) => {
                request.model = Some(settings.base.model.clone());
                request.thinking = settings.thinking.clone();
                request.tools = settings.tools.clone();
                request.tool_choice = settings.tool_choice.clone();
                if let Some(temp) = settings.base.temperature {
                    request.temperature = Some(temp);
                }

                if let Some(max_tokens) = settings.base.max_tokens {
                    request.max_tokens = Some(max_tokens);
                }

                if let Some(stream) = settings.base.stream {
                    request.stream = Some(stream);
                }

                if let Some(top_p) = settings.base.top_p {
                    request.top_p = Some(top_p);
                }
            }
            ModelSettings::Base(settings) => {
                request.model = Some(settings.model.clone());

                if let Some(temp) = settings.temperature {
                    request.temperature = Some(temp);
                }

                if let Some(max_tokens) = settings.max_tokens {
                    request.max_tokens = Some(max_tokens);
                }

                if let Some(stream) = settings.stream {
                    request.stream = Some(stream);
                }

                if let Some(top_p) = settings.top_p {
                    request.top_p = Some(top_p);
                }

                if let Some(freq_penalty) = settings.frequency_penalty {
                    request.frequency_penalty = Some(freq_penalty);
                }

                if let Some(pres_penalty) = settings.presence_penalty {
                    request.presence_penalty = Some(pres_penalty);
                }

                if let Some(seed) = settings.seed {
                    request.seed = Some(seed as i32);
                }
            }
        }
    }

    pub fn validate(&self) -> Result<(), String> {
        match self {
            ModelSettings::Anthropic(settings) => {
                if settings.base.model.is_empty() {
                    return Err("Model name cannot be empty".to_string());
                }
                // Autres validations pour Anthropic
                Ok(())
            }
            ModelSettings::Base(settings) => {
                if settings.model.is_empty() {
                    return Err("Model name cannot be empty".to_string());
                }
                // Autres validations génériques
                Ok(())
            }
        }
    }
}

pub fn create_model_settings(provider: ProviderType, model: &str) -> ModelSettings {
    match provider {
        ProviderType::Anthropic => ModelSettings::Anthropic(
            crate::providers::anthropic::AnthropicModelSettings::new(model),
        ),
        _ => ModelSettings::Base(BaseModelSettings::new(provider, model)),
    }
}

pub trait ProviderCapabilities {
    fn supports_streaming(&self) -> bool;
    fn supports_thinking(&self) -> bool;
    fn supports_tools(&self) -> bool;
    fn get_default_model(&self) -> String;
    fn get_available_models(&self) -> Vec<String>;
    fn get_max_tokens_limit(&self) -> u32;
}

// pub trait ModelSettingsProvider: Send + Sync {
//     type RequestType;
//
//     fn provider_type(&self) -> ProviderType;
//     fn model_name(&self) -> &str;
//     fn apply_to_request(&self, request: &mut Self::RequestType) -> Result<(), String>;
//     fn validate(&self) -> Result<(), String>;
// }

// pub trait ModelSettingsBuilder: Sized {
//     type Provider: ModelSettingsProvider;
//
//     fn with_model(self, model: impl Into<String>) -> Self;
//     fn with_temperature(self, temperature: f32) -> Self;
//     fn with_max_tokens(self, max_tokens: u32) -> Self;
//     fn with_stream(self, enabled: bool) -> Self;
//
//     fn build(self) -> Self::Provider;
// }
//

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/core.ts")]
pub struct BaseModelSettings {
    pub provider: ProviderType,
    pub model: String,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_tokens: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stream: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub top_p: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub frequency_penalty: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub presence_penalty: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub seed: Option<u32>,
}

impl BaseModelSettings {
    pub fn new(provider: ProviderType, model: impl Into<String>) -> Self {
        Self {
            provider,
            model: model.into(),
            temperature: None,
            max_tokens: None,
            stream: None,
            top_p: None,
            frequency_penalty: None,
            presence_penalty: None,
            seed: None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/core.ts")]
pub enum ChatRole {
    #[serde(rename = "system")]
    System,
    #[serde(rename = "user")]
    User,
    #[serde(rename = "assistant")]
    Assistant,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/core.ts")]
pub enum AnthropicContentType {
    #[serde(rename = "text")]
    Text(String),
    #[serde(rename = "image")]
    Image(Image),
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/core.ts")]
pub struct Image {
    pub media_type: String,
    pub data: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/core.ts")]
pub struct ChatRequest {
    pub messages: Vec<ChatMessage>,
    pub system: AnthropicSystemPrompt,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_tokens: Option<u32>,
    #[ts(optional)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub model: Option<String>,
    #[ts(optional)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stream: Option<bool>,
    #[ts(optional)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f32>,
    #[ts(optional)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub thinking: Option<AnthropicThinkingConfig>,
    #[ts(optional)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub top_p: Option<f32>,
    #[ts(optional)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub top_k: Option<i32>,
    #[ts(optional)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub seed: Option<i32>,
    #[ts(optional)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub repetition_penalty: Option<f32>,
    #[ts(optional)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub frequency_penalty: Option<f32>,
    #[ts(optional)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub presence_penalty: Option<f32>,
    #[ts(optional)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub lora: Option<String>,
    #[ts(optional)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tools: Option<Vec<AnthropicTool>>,
    #[ts(optional)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tool_choice: Option<AnthropicToolChoice>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/core.ts")]
pub struct ChatMessage {
    pub role: ChatRole,
    pub content: ContentType,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/core.ts")]
#[serde(untagged)]
pub enum ContentType {
    PlainText(String),
    StructuredContent(Vec<ContentItem>),
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/core.ts")]
#[serde(tag = "type")]
pub enum ContentItem {
    #[serde(rename = "text")]
    Text { text: String },
    #[serde(rename = "image")]
    Image { source: ImageSource },
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/core.ts")]
pub struct ImageSource {
    #[serde(rename = "type")]
    pub source_type: String,
    pub media_type: String,
    pub data: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenUsage {
    pub prompt_tokens: u32,
    pub completion_tokens: u32,
    pub total_tokens: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamResponse {
    #[serde(rename = "response")]
    pub response: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub usage: Option<TokenUsage>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub thinking: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/core.ts")]
pub struct DbTopic {
    pub id: String,
    pub name: String,
    pub created_at: String,
    pub bg_color: String,
    pub last_accessed_at: String,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/core.ts")]
pub struct DbTopicMessage {
    pub id: String,
    pub topic_id: String,
    pub role: ChatRole,
    pub content: ContentType,
    pub timestamp: String,
    pub tokens_used: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/core.ts", rename_all = "camelCase")]
pub struct Topic {
    pub id: String,
    pub name: String,
    #[ts(type = "Date")]
    pub created_at: String,
    pub bg_color: String,
    #[ts(type = "Date")]
    pub last_accessed_at: String,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/core.ts", rename_all = "camelCase")]
pub struct TopicMessage {
    pub id: String,
    pub topic_id: String,
    pub role: ChatRole,
    pub content: ContentType,
    #[ts(type = "Date")]
    pub timestamp: String,
    pub tokens_used: Option<i32>,
}

// #[derive(Debug, Serialize, Deserialize, TS)]
// #[ts(export, export_to = "../../types/core.ts", rename_all = "camelCase")]
// pub struct ModelSettings {
//     provider: ProviderType,
//
//     max_tokens: u32,
//     model_name: String,
//     stream: bool,
//     system: AnthropicSystemPrompt,
//
//     temperature: Option<f32>,
//     thinking: Option<AnthropicThinkingConfig>,
//     tool_choice: Option<AnthropicToolChoice>,
//     top_p: Option<f32>,
// }
