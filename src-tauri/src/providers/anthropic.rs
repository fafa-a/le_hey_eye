use crate::core::credentials::{self, AnthropicCredentials};
use crate::core::endpoints;
use crate::core::llm_trait::{AnthropicAdapter, LLMProvider};
use crate::core::models::{ChatRequest, ChatRole, AnthropicContentType, StreamResponse, TokenUsage};
use futures_util::StreamExt;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
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

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum ContentBlock {
    #[serde(rename = "text")]
    Text { text: String },

    #[serde(rename = "image")]
    Image { source: ImageSource },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ImageSource {
    #[serde(rename = "type")]
    pub source_type: ImageSourceType,
    pub media_type: ImageMediaType,
    pub data: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ImageSourceType {
    Base64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
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

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnthropicMessage {
    pub role: AnthropicMessageRole,
    pub content: Vec<ContentBlock>,
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

/// Delta updates for message properties
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MessageDelta {
    pub stop_reason: Option<StopReason>,
    pub stop_sequence: Option<String>,
}

/// Structure for parsing SSE lines
#[derive(Debug, Clone)]
pub struct ServerSentEvent {
    pub event: String,
    pub data: String,
}

pub struct AnthropicStreamProcessor {
    message: Option<AnthropicResponse>,
    content_blocks: Vec<ResponseContentBlock>,
    current_block_index: Option<usize>,
}

impl AnthropicStreamProcessor {
    pub fn new() -> Self {
        Self {
            message: None,
            content_blocks: Vec::new(),
            current_block_index: None,
        }
    }

    pub fn process_sse_line(&mut self, line: &str) -> Result<bool, Box<dyn std::error::Error>> {
        if line.trim().is_empty() {
            return Ok(false);
        }

        let sse = self.parse_sse_line(line)?;

        if sse.event.is_empty() || sse.data.is_empty() {
            return Ok(false);
        }

        let event: StreamEvent = serde_json::from_str(&sse.data)?;
       let is_message_stop = matches!(event, StreamEvent::MessageStop);
        self.process_event(event)?;
        Ok(is_message_stop) 
    }

    fn parse_sse_line(&self, line: &str) -> Result<ServerSentEvent, Box<dyn std::error::Error>> {
        if let Some(line) = line.strip_prefix("event: ") {
            return Ok(ServerSentEvent {
                event: line.trim().to_string(),
                data: String::new(),
            });
        } else if let Some(line) = line.strip_prefix("data: ") {
            return Ok(ServerSentEvent {
                event: String::new(),
                data: line.trim().to_string(),
            });
        }

        Ok(ServerSentEvent {
            event: String::new(),
            data: String::new(),
        })
    }

    fn process_event(&mut self, event: StreamEvent) -> Result<(), Box<dyn std::error::Error>> {
        match event {
            StreamEvent::MessageStart { message } => {
                self.message = Some(message);
                self.content_blocks = Vec::new();
            }

            StreamEvent::ContentBlockStart {
                index,
                content_block,
            } => {
                if self.content_blocks.len() <= index {
                    self.content_blocks.resize_with(index + 1, || {
                        match &content_block {
                            ResponseContentBlock::Text { .. } => ResponseContentBlock::Text {
                                text: String::new(),
                            },
                            ResponseContentBlock::Thinking { .. } => {
                                ResponseContentBlock::Thinking {
                                    thinking: String::new(),
                                }
                            }
                        }
                    });
                }

                self.content_blocks[index] = content_block;
                self.current_block_index = Some(index);
            }

            StreamEvent::ContentBlockDelta { index, delta } => {
                if index >= self.content_blocks.len() {
                    return Err("Content block delta for non-existent block".into());
                }

                match (&mut self.content_blocks[index], delta) {
                    (
                        ResponseContentBlock::Text { text },
                        DeltaType::TextDelta { text: delta_text },
                    ) => {
                        text.push_str(&delta_text);
                    }
                    (
                        ResponseContentBlock::Thinking { thinking },
                        DeltaType::ThinkingDelta {
                            thinking: delta_thinking,
                        },
                    ) => {
                        thinking.push_str(&delta_thinking);
                    }
                    (_, DeltaType::SignatureDelta { .. }) => {}
                    _ => return Err("Mismatched content block and delta types".into()),
                }
            }

            StreamEvent::ContentBlockStop { .. } => {
                self.current_block_index = None;
            }

            StreamEvent::MessageDelta { delta, usage } => {
                if let Some(ref mut message) = self.message {
                    if let Some(stop_reason) = delta.stop_reason {
                        message.stop_reason = Some(stop_reason);
                    }
                    message.stop_sequence = delta.stop_sequence;

                    if let Some(usage) = usage {
                        message.usage = Some(usage);
                    }
                }
            }

            StreamEvent::MessageStop => {
                if let Some(ref mut message) = self.message {
                    message.content = self.content_blocks.clone();
                }
            }

            StreamEvent::Ping => {}
        }

        Ok(())
    }

    pub fn get_message(&self) -> Option<AnthropicResponse> {
        if let Some(ref message) = self.message {
            let mut result = message.clone();
            result.content = self.content_blocks.clone();
            Some(result)
        } else {
            None
        }
    }

    pub fn get_text_content(&self) -> String {
        let mut result = String::new();
        for block in &self.content_blocks {
            if let ResponseContentBlock::Text { text } = block {
                result.push_str(text);
            }
        }
        result
    }

    pub fn get_thinking_content(&self) -> Option<String> {
        for block in &self.content_blocks {
            if let ResponseContentBlock::Thinking { thinking } = block {
                return Some(thinking.clone());
            }
        }
        None
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
    let system_message = request.messages.iter()
        .find(|msg| matches!(msg.role, ChatRole::System))
        .and_then(|msg| extract_system_content(&msg.content));

    let anthropic_messages = request.messages.into_iter()
        .filter_map(|msg| {
            match msg.role {
                ChatRole::User => Some(AnthropicMessage {
                    role: AnthropicMessageRole::User,
                    content: convert_content_items_to_anthropic(msg.content),
                }),
                ChatRole::Assistant => Some(AnthropicMessage {
                    role: AnthropicMessageRole::Assistant,
                    content: convert_content_items_to_anthropic(msg.content),
                }),
                ChatRole::System => unreachable!(),
            }
        })
        .collect();

    AnthropicChatRequest {
        model: request.model,
        messages: anthropic_messages,
        system: system_message,
        temperature: request.temperature,
        max_tokens: request.max_tokens,
        stream: Some(true),
        thinking: request.thinking.map(|config| {
            AnthropicThinkingConfig{
                thinking_type: ThinkingType::Enabled,
                budget_tokens: config.budget_tokens,
            }
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

fn convert_content_items_to_anthropic(content_items: Vec<AnthropicContentType>) -> Vec<ContentBlock> {
    content_items.into_iter()
        .map(|item| convert_single_content_to_anthropic(item))
        .collect()
}

fn convert_single_content_to_anthropic(content: AnthropicContentType) -> ContentBlock {
    match content {
        AnthropicContentType::Text(text) => ContentBlock::Text { text },
        AnthropicContentType::Image(image) => ContentBlock::Image { 
            source: ImageSource { 
                source_type: ImageSourceType::Base64,
                media_type: convert_media_type(&image.media_type),
                data: image.data,
            } 
        },
    }
}

fn extract_system_content(content: &Vec<AnthropicContentType>) -> Option<String> {
    // Extract text from system message content
    let text_contents: Vec<String> = content.iter()
        .filter_map(|item| {
            match item {
                AnthropicContentType::Text(text) => Some(text.clone()),
                _ => None
            }
        })
        .collect();
    
    if text_contents.is_empty() {
        None
    } else {
        Some(text_contents.join("\n"))
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
        model: String,
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

            println!("response: {:?}", response);
            if response.status().is_client_error() || response.status().is_server_error() {
                let error_body = response.text().await.map_err(|e| e.to_string())?;
                return Err(format!("Anthropic API Error: {}", error_body));
            }

            let mut stream_processor = AnthropicStreamProcessor::new();
            let mut buffer = String::new();
            let mut stream = response.bytes_stream();

            while let Some(chunk) = stream.next().await {
                let chunk = chunk.map_err(|e| e.to_string())?;
                let chunk_str = String::from_utf8(chunk.to_vec()).map_err(|e| e.to_string())?;

                buffer.push_str(&chunk_str);

                while let Some(pos) = buffer.find('\n') {
                    let line = buffer[..pos].to_string();
                    buffer = buffer[pos + 1..].to_string();

                    let is_complete = stream_processor
                        .process_sse_line(&line)
                        .map_err(|e| e.to_string())?;

                    let current_text = stream_processor.get_text_content();
                    if !current_text.is_empty() {
                        window
                            .emit("stream-response", &current_text)
                            .map_err(|e| e.to_string())?;
                    }

                    if let Some(thinking) = stream_processor.get_thinking_content() {
                        window
                            .emit("thinking-response", &thinking)
                            .map_err(|e| e.to_string())?;
                    }

                    if is_complete {
                        break;
                    }
                }
            }

            if let Some(message) = stream_processor.get_message() {
                let final_text = stream_processor.get_text_content();

                let usage = message.usage.map(|u| TokenUsage {
                    prompt_tokens: u.input_tokens,
                    completion_tokens: u.output_tokens,
                    total_tokens: u.input_tokens + u.output_tokens,
                });

                Ok(StreamResponse {
                    response: final_text,
                    usage,
                    thinking: None,
                })
            } else {
                Err("Failed to get complete response from Anthropic API".to_string())
            }
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
