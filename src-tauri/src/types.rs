use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Message {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../types/cloudflare.ts")]
pub struct ChatInput {
    pub messages: Vec<Message>,
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

#[derive(Debug, Serialize, Deserialize, TS)]
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
