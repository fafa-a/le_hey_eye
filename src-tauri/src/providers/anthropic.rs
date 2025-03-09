use crate::core::credentials::{self, AnthropicCredentials};
use crate::core::endpoints;
use crate::core::llm_trait::{AnthropicAdapter, LLMProvider};
use crate::core::models::{
     ChatRequest, ChatRole, ContentItem, ContentType, StreamResponse,
    TokenUsage,
};
use futures_util::StreamExt;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::Emitter;
use tauri::Window;
use ts_rs::TS;

#[derive(Debug, Clone)]
pub struct AnthropicProvider {}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AnthropicMessageRole {
    #[serde(rename = "user")]
    User,
    #[serde(rename = "assistant")]
    Assistant,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/core.ts")]
#[serde(tag = "type")]
pub enum ContentBlock {
    #[serde(rename = "text")]
    Text { text: String },

    #[serde(rename = "image")]
    Image { source: AnthropicImageSource },
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/core.ts")]
pub struct AnthropicImageSource {
    #[serde(rename = "type")]
    pub source_type: ImageSourceType,
    pub media_type: ImageMediaType,
    pub data: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/core.ts")]
#[serde(rename_all = "lowercase")]
pub enum ImageSourceType {
    #[serde(rename = "base64")]
    Base64,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/core.ts")]
pub enum ImageMediaType {
    #[serde(rename = "image/jpeg")]
    Jpeg,
    #[serde(rename = "image/png")]
    Png,
    #[serde(rename = "image/gif")]
    Gif,
    #[serde(rename = "image/webp")]
    Webp,
}
mod content_deserialization {
    use super::*;
    use serde::{de, Deserializer};
    use std::fmt;

    impl<'de> Deserialize<'de> for MessageContent {
        fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
        where
            D: Deserializer<'de>,
        {
            struct MessageContentVisitor;

            impl<'de> de::Visitor<'de> for MessageContentVisitor {
                type Value = MessageContent;

                fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
                    formatter.write_str("string or array of content blocks")
                }

                fn visit_str<E>(self, value: &str) -> Result<Self::Value, E>
                where
                    E: de::Error,
                {
                    Ok(MessageContent::String(value.to_owned()))
                }

                fn visit_string<E>(self, value: String) -> Result<Self::Value, E>
                where
                    E: de::Error,
                {
                    Ok(MessageContent::String(value))
                }

                fn visit_seq<S>(self, visitor: S) -> Result<Self::Value, S::Error>
                where
                    S: de::SeqAccess<'de>,
                {
                    // Déléguer à la désérialisation standard pour Vec<ContentBlock>
                    let blocks: Vec<ContentBlock> = de::Deserialize::deserialize(
                        de::value::SeqAccessDeserializer::new(visitor),
                    )?;
                    Ok(MessageContent::Blocks(blocks))
                }
            }

            deserializer.deserialize_any(MessageContentVisitor)
        }
    }

    pub fn deserialize_flexible_content<'de, D>(deserializer: D) -> Result<MessageContent, D::Error>
    where
        D: Deserializer<'de>,
    {
        MessageContent::deserialize(deserializer)
    }
}
use content_deserialization::deserialize_flexible_content;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnthropicMessage {
    pub role: AnthropicMessageRole,
    #[serde(deserialize_with = "deserialize_flexible_content")]
    pub content: MessageContent,
}

#[derive(Debug, Clone,TS)]
#[ts(export, export_to = "../../types/core.ts")]
pub enum MessageContent {
    String(String),
    Blocks(Vec<ContentBlock>),
}
impl Serialize for MessageContent {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        match self {
            MessageContent::String(s) => {
                let blocks = vec![ContentBlock::Text { text: s.clone() }];
                blocks.serialize(serializer)
            }
            MessageContent::Blocks(blocks) => blocks.serialize(serializer),
        }
    }
}
#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/core.ts")]
pub struct AnthropicThinkingConfig {
    #[serde(rename = "type")]
    pub thinking_type: ThinkingType,
    pub budget_tokens: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/core.ts")]
#[serde(rename_all = "lowercase")]
pub enum ThinkingType {
    Enabled,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnthropicChatRequest {
    pub model: Option<String>,
    pub messages: Vec<AnthropicMessage>,
    pub system: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f32>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_tokens: Option<u32>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub stream: Option<bool>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub thinking: Option<AnthropicThinkingConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum ResponseContentBlock {
    #[serde(rename = "text")]
    Text { text: String },

    #[serde(rename = "thinking")]
    Thinking { thinking: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum DeltaType {
    #[serde(rename = "text_delta")]
    TextDelta { text: String },

    #[serde(rename = "thinking_delta")]
    ThinkingDelta { thinking: String },

    #[serde(rename = "signature_delta")]
    SignatureDelta { signature: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum StopReason {
    EndTurn,
    MaxTokens,
    StopSequence,
    ToolUse,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Usage {
    pub input_tokens: u32,
    pub output_tokens: u32,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub cache_creation_input_tokens: Option<u32>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub cache_read_input_tokens: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnthropicResponse {
    pub id: String,

    #[serde(rename = "type")]
    pub message_type: String,

    pub role: String,
    pub content: Vec<ResponseContentBlock>,
    pub model: String,
    pub stop_reason: Option<StopReason>,
    pub stop_sequence: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub usage: Option<Usage>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum StreamEvent {
    #[serde(rename = "message_start")]
    MessageStart { message: AnthropicResponse },

    #[serde(rename = "content_block_start")]
    ContentBlockStart {
        index: usize,
        content_block: ResponseContentBlock,
    },

    #[serde(rename = "content_block_delta")]
    ContentBlockDelta { index: usize, delta: DeltaType },

    #[serde(rename = "content_block_stop")]
    ContentBlockStop { index: usize },

    #[serde(rename = "message_delta")]
    MessageDelta {
        delta: MessageDelta,
        #[serde(skip_serializing_if = "Option::is_none")]
        usage: Option<Usage>,
    },

    #[serde(rename = "message_stop")]
    MessageStop,

    #[serde(rename = "ping")]
    Ping,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MessageDelta {
    pub stop_reason: Option<StopReason>,
    pub stop_sequence: Option<String>,
}

// #[derive(Debug, Clone)]
// pub struct ServerSentEvent {
//     pub event: String,
//     pub data: String,
// }

#[derive(Debug, Clone, Default)]
struct AnthropicStreamProcessor {
    current_content: String,
    thinking_content: Option<String>,
    is_complete: bool,
    usage: Option<AnthropicUsage>,
    last_output_tokens: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnthropicUsage {
    pub input_tokens: u32,
    #[serde(default)]
    pub output_tokens: u32,
    #[serde(default)]
    pub cache_creation_input_tokens: u32,
    #[serde(default)]
    pub cache_read_input_tokens: u32,
}

impl AnthropicStreamProcessor {
    pub fn new() -> Self {
        Self {
            current_content: String::new(),
            thinking_content: None,
            is_complete: false,
            usage: None,
            last_output_tokens: None,
        }
    }

    pub fn process_sse_line(&mut self, line: &str) -> Result<bool, String> {
        if line.is_empty() || line.starts_with(":") {
            return Ok(false);
        }

        if line.starts_with("event: ") {
            return Ok(false);
        }

        if line.starts_with("data: ") {
            let data = line.strip_prefix("data: ").unwrap();

            if data.contains("\"type\": \"ping\"") || data.contains("\"type\":\"ping\"") {
                return Ok(false);
            }

            match serde_json::from_str::<serde_json::Value>(data) {
                Ok(json) => {
                    if let Some(event_type) = json.get("type").and_then(|t| t.as_str()) {
                        match event_type {
                            "message_start" => {
                                if let Some(message_json) = json.get("message") {
                                    if let Some(usage_json) = message_json.get("usage") {
                                        if let Ok(usage) =
                                            serde_json::from_value(usage_json.clone())
                                        {
                                            self.usage = Some(usage);
                                        }
                                    }
                                }
                            }
                            "content_block_delta" => {
                                if let Some(delta) = json
                                    .get("delta")
                                    .and_then(|d| d.get("text"))
                                    .and_then(|t| t.as_str())
                                {
                                    self.current_content.push_str(delta);
                                }
                            }
                            "message_delta" => {
                                if let Some(usage_json) = json.get("usage") {
                                    if let Some(output_tokens) =
                                        usage_json.get("output_tokens").and_then(|t| t.as_u64())
                                    {
                                        self.last_output_tokens = Some(output_tokens as u32);
                                    }
                                }
                            }
                            "message_stop" => {
                                self.is_complete = true;
                                if let Some(tokens) = self.last_output_tokens {
                                    if let Some(usage) = &mut self.usage {
                                        usage.output_tokens = tokens;
                                    } else if tokens > 0 {
                                        self.usage = Some(AnthropicUsage {
                                            input_tokens: 0,
                                            output_tokens: tokens,
                                            cache_creation_input_tokens: 0,
                                            cache_read_input_tokens: 0,
                                        });
                                    }
                                }
                                return Ok(true);
                            }
                            _ => {}
                        }
                    }
                }
                Err(e) => {
                    println!("Error parsing SSE data: {}. Raw data: {}", e, data);
                }
            }
        }

        Ok(self.is_complete)
    }

    pub fn get_text_content(&self) -> String {
        self.current_content.clone()
    }

    pub fn get_thinking_content(&self) -> Option<String> {
        self.thinking_content.clone()
    }

    pub fn get_message(&self) -> Option<AnthropicMessage> {
        if self.is_complete || !self.current_content.is_empty() {
            let content = vec![ContentBlock::Text {
                text: self.current_content.clone(),
            }];

            Some(AnthropicMessage {
                role: AnthropicMessageRole::Assistant,
                content: MessageContent::Blocks(content),
            })
        } else {
            None
        }
    }

    pub fn get_usage(&self) -> Option<AnthropicUsage> {
        if let (Some(mut usage), Some(tokens)) = (self.usage.clone(), self.last_output_tokens) {
            usage.output_tokens = tokens;
            Some(usage)
        } else {
            self.usage.clone()
        }
    }
}

struct AnthropicProviderWrapper(crate::providers::anthropic::AnthropicProvider);

impl LLMProvider for AnthropicProviderWrapper {
    fn provider_id(&self) -> &'static str {
        "anthropic"
    }
}

impl AnthropicAdapter for AnthropicProviderWrapper {
    fn adapt_request(&self, request: ChatRequest) -> AnthropicChatRequest {
        let anthropic_messages: Vec<AnthropicMessage> = request
            .messages
            .iter()
            .filter(|msg| !matches!(msg.role, ChatRole::System))
            .map(|msg| create_anthropic_message(msg.role.clone(), &msg.content))
            .collect();

        AnthropicChatRequest {
            model: request.model,
            messages: anthropic_messages,
            system: request.system,
            temperature: request.temperature,
            max_tokens: request.max_tokens,
            stream: Some(true),
            thinking: request.thinking.map(|config| AnthropicThinkingConfig {
                thinking_type: ThinkingType::Enabled,
                budget_tokens: config.budget_tokens,
            }),
        }
    }

    fn adapt_response(&self, response: AnthropicResponse) -> StreamResponse {
        let text_content = response
            .content
            .iter()
            .filter_map(|block| {
                if let ResponseContentBlock::Text { text } = block {
                    Some(text.clone())
                } else {
                    None
                }
            })
            .collect::<Vec<String>>()
            .join("");

        let thinking_content = response.content.iter().find_map(|block| {
            if let ResponseContentBlock::Thinking { thinking } = block {
                Some(thinking.clone())
            } else {
                None
            }
        });

        let usage = response.usage.map(|u| TokenUsage {
            prompt_tokens: u.input_tokens,
            completion_tokens: u.output_tokens,
            total_tokens: u.input_tokens + u.output_tokens,
        });

        StreamResponse {
            response: text_content,
            usage,
            thinking: thinking_content,
        }
    }
}

fn convert_content_to_anthropic_content_blocks(content: &ContentType) -> Vec<ContentBlock> {
    match content {
        ContentType::PlainText(text) => {
            vec![ContentBlock::Text { text: text.clone() }]
        }
        ContentType::StructuredContent(items) => items
            .iter()
            .map(|item| match item {
                ContentItem::Text { text } => ContentBlock::Text { text: text.clone() },
                ContentItem::Image { source } => ContentBlock::Image {
                    source: AnthropicImageSource {
                        source_type: convert_source_type(&source.source_type),
                        media_type: convert_media_type(&source.media_type),
                        data: source.data.clone(),
                    },
                },
            })
            .collect(),
    }
}

fn create_anthropic_message(role: ChatRole, content: &ContentType) -> AnthropicMessage {
    AnthropicMessage {
        role: match role {
            ChatRole::User => AnthropicMessageRole::User,
            ChatRole::Assistant => AnthropicMessageRole::Assistant,
            _ => unreachable!(),
        },
        content: MessageContent::Blocks(convert_content_to_anthropic_content_blocks(content)),
    }
}

fn convert_source_type(source_type: &str) -> ImageSourceType {
    match source_type {
        "base64" => ImageSourceType::Base64,
        _ => {
            // Log ou gestion d'erreur pour les types non reconnus
            eprintln!(
                "Type de source non reconnu: {}, utilisation de base64 par défaut",
                source_type
            );
            ImageSourceType::Base64
        }
    }
}

fn convert_media_type(media_type: &str) -> ImageMediaType {
    match media_type {
        "image/jpeg" => ImageMediaType::Jpeg,
        "image/png" => ImageMediaType::Png,
        "image/gif" => ImageMediaType::Gif,
        "image/webp" => ImageMediaType::Webp,
        _ => ImageMediaType::Jpeg,
    }
}

impl AnthropicProvider {
    pub fn send_message_impl<R: tauri::Runtime>(
        &self,
        window: Window<R>,
        app: Arc<tauri::AppHandle<R>>,
        _model: String,
        request: ChatRequest,
    ) -> tauri::async_runtime::JoinHandle<Result<StreamResponse, String>> {
        let wrapper = AnthropicProviderWrapper(self.clone());
        let anthropic_request = wrapper.adapt_request(request);

        tauri::async_runtime::spawn(async move {
            let AnthropicCredentials { api_key } =
                credentials::get_anthropic_credentials(&app).await?;

            let api_url = endpoints::get_api_url("anthropic", None)?;

            let client = reqwest::Client::new();

            let response = client
                .post(api_url)
                .header("x-api-key", api_key)
                .header("anthropic-version", "2023-06-01")
                .header("Content-Type", "application/json")
                .json(&anthropic_request)
                .send()
                .await
                .map_err(|e| e.to_string())?;

            if response.status().is_client_error() || response.status().is_server_error() {
                let error_body = response.text().await.map_err(|e| e.to_string())?;
                return Err(format!("Anthropic API Error: {}", error_body));
            }

            let mut stream_processor = AnthropicStreamProcessor::new();
            let mut buffer = String::new();
            let mut stream = response.bytes_stream();
            let mut stream_completed = false;

            while let Some(chunk) = stream.next().await {
                let chunk = chunk.map_err(|e| e.to_string())?;
                let chunk_str = String::from_utf8(chunk.to_vec()).map_err(|e| e.to_string())?;

                buffer.push_str(&chunk_str);

                let mut processed_up_to = 0;
                let mut lines_start = 0;

                while let Some(pos) = buffer[lines_start..].find('\n') {
                    let line_end = lines_start + pos;
                    let line = buffer[lines_start..line_end].trim().to_string();

                    if !line.is_empty() {
                        match stream_processor.process_sse_line(&line) {
                            Ok(is_complete) => {
                                let current_text = stream_processor.get_text_content();
                                if !current_text.is_empty() {
                                    let _ = window.emit("stream-response", &current_text);
                                }

                                if is_complete {
                                    stream_completed = true;
                                }
                            }
                            Err(e) => {
                                println!("Error processing line: {}", e);
                            }
                        }
                    }

                    lines_start = line_end + 1;
                    processed_up_to = lines_start;
                }

                if processed_up_to > 0 {
                    buffer = buffer[processed_up_to..].to_string();
                }

                if stream_completed {
                    break;
                }
            }

            if !buffer.trim().is_empty() {
                let _ = stream_processor.process_sse_line(&buffer);

                let current_text = stream_processor.get_text_content();
                if !current_text.is_empty() {
                    let _ = window.emit("stream-response", &current_text);
                }
            }

            let usage = stream_processor.get_usage().map(|u| TokenUsage {
                prompt_tokens: u.input_tokens,
                completion_tokens: u.output_tokens,
                total_tokens: u.input_tokens + u.output_tokens,
            });

            if let Some(_message) = stream_processor.get_message() {
                let final_text = stream_processor.get_text_content();

                Ok(StreamResponse {
                    response: final_text,
                    usage,
                    thinking: stream_processor.get_thinking_content(),
                })
            } else if !stream_processor.get_text_content().is_empty() {
                let text = stream_processor.get_text_content();
                Ok(StreamResponse {
                    response: text,
                    usage,
                    thinking: stream_processor.get_thinking_content(),
                })
            } else {
                Err("Failed to get complete response from Anthropic API".to_string())
            }
        })
    }

    #[allow(dead_code)]
    pub fn list_models_impl<R: tauri::Runtime>(
        &self,
        _app: Arc<tauri::AppHandle<R>>,
    ) -> tauri::async_runtime::JoinHandle<Result<Vec<String>, String>> {
        tauri::async_runtime::spawn(
            async move { Ok(vec!["claude-3-7-sonnet-20250219".to_string()]) },
        )
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
