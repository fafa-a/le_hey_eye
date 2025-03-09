use serde::{Deserialize, Serialize};
use serde_json::Value;
use ts_rs::TS;

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/cloudflare.ts")]
pub enum MessageRole {
    #[serde(rename = "system")]
    System,
    #[serde(rename = "user")]
    User,
    #[serde(rename = "assistant")]
    Assistant,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/cloudflare.ts")]
pub struct Message {
    pub role: MessageRole,
    pub content: String,
    #[ts(optional)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tokens_used: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/cloudflare.ts")]
pub struct ChatInput {
    pub messages: Vec<Message>,
    pub stream: bool,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/cloudflare.ts")]
pub struct PromptSettings {
    pub stream: Option<bool>,
    pub max_tokens: Option<i32>,
    pub temperature: Option<f64>,
    pub top_p: Option<f64>,
    pub top_k: Option<i32>,
    pub seed: Option<i32>,
    pub repetition_penalty: Option<f64>,
    pub frequency_penalty: Option<f64>,
    pub presence_penalty: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/cloudflare.ts")]
pub struct PromptRequest {
    pub prompt: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub raw: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stream: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_tokens: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub top_p: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub top_k: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub seed: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub repetition_penalty: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub frequency_penalty: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub presence_penalty: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub lora: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/cloudflare.ts")]
pub struct MessagesRequest {
    pub messages: Vec<Message>,
    #[ts(optional)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub functions: Option<Vec<FunctionTool>>,
    #[ts(optional)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tools: Option<Vec<FunctionToolWrapper>>,
    #[ts(optional)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stream: Option<bool>,
    #[ts(optional)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_tokens: Option<i32>,
    #[ts(optional)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f64>,
    #[ts(optional)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub top_p: Option<f64>,
    #[ts(optional)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub top_k: Option<i32>,
    #[ts(optional)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub seed: Option<i32>,
    #[ts(optional)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub repetition_penalty: Option<f64>,
    #[ts(optional)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub frequency_penalty: Option<f64>,
    #[ts(optional)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub presence_penalty: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/cloudflare.ts")]
pub struct FunctionTool {
    pub name: String,
    pub code: String,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/cloudflare.ts")]
pub struct ToolParameter {
    pub type_field: String,
    pub description: String,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/cloudflare.ts")]
pub struct ToolParameters {
    #[serde(rename = "type")]
    pub type_field: String,
    pub properties: std::collections::HashMap<String, ToolParameter>,
    pub required: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/cloudflare.ts")]
pub struct Tool {
    pub name: String,
    pub description: String,
    pub parameters: ToolParameters,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/cloudflare.ts")]
pub struct FunctionToolWrapper {
    #[serde(rename = "type")]
    pub type_field: String,
    pub function: Tool,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/cloudflare.ts")]
pub struct ChatRequest {
    pub messages: Vec<Message>,
    #[ts(optional)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub stream: Option<bool>,
    #[ts(optional)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_tokens: Option<i32>,
    #[ts(optional)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f64>,
    #[ts(optional)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub top_p: Option<f64>,
    #[ts(optional)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub top_k: Option<i32>,
    #[ts(optional)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub seed: Option<i32>,
    #[ts(optional)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub repetition_penalty: Option<f64>,
    #[ts(optional)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub frequency_penalty: Option<f64>,
    #[ts(optional)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub presence_penalty: Option<f64>,
    #[ts(optional)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub lora: Option<String>,
    #[ts(optional)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub functions: Option<Vec<FunctionTool>>,
    #[ts(optional)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tools: Option<Vec<FunctionToolWrapper>>,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/cloudflare.ts")]
pub struct CloudflareResponse {
    pub errors: Vec<CloudflareError>,
    pub messages: Vec<Message>,
    pub result: CloudflareResult,
    pub success: bool,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/cloudflare.ts")]
pub struct CloudflareResult {
    pub response: String,
    pub usage: CloudflareUsage,
}

#[derive(Debug, Serialize, Deserialize, TS, Clone)]
#[ts(export)]
pub struct CloudflareUsage {
    pub completion_tokens: i32,
    pub prompt_tokens: i32,
    pub total_tokens: i32,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct CloudflareError {
    pub code: i32,
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize, TS)]
pub struct CloudflareModelTask {
    pub id: String,
    pub name: String,
    pub description: String,
}

#[derive(Debug, Serialize, Deserialize, TS)]
pub struct CloudflareModelProperty {
    pub property_id: String,
    pub value: String,
}

#[derive(Debug, Serialize, Deserialize, TS)]
pub struct CloudflareModel {
    pub id: String,
    pub source: i32,
    pub name: String,
    pub description: String,
    pub task: CloudflareModelTask,
    pub tags: Vec<String>,
    pub properties: Vec<CloudflareModelProperty>,
}

#[derive(Debug, Serialize, Deserialize, TS)]
pub struct CloudflareResultInfo {
    pub count: i32,
    pub page: i32,
    pub per_page: i32,
    pub total_count: i32,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/cloudflare.ts")]
pub struct CloudflareModelResponse {
    pub success: bool,
    pub result: Vec<CloudflareModel>,
    pub errors: Vec<CloudflareError>,
    pub messages: Vec<String>,
    pub result_info: CloudflareResultInfo,
}

#[derive(Serialize, Deserialize, Clone, TS)]
pub struct Credentials {
    pub account_id: String,
    pub api_token: String,
}

// pub struct EncryptedStore<R: Runtime> {
//     pub store: Store<R>,
//     pub crypto: MagicCrypt256,
// }

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/cloudflare.ts")]
pub struct StreamResponse {
    pub response: String,
    pub usage: Option<CloudflareUsage>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CloudFlareModelDetailsResponse {
    pub result: std::collections::HashMap<String, Value>,
    pub success: bool,
}
