use magic_crypt::{new_magic_crypt, MagicCrypt256, MagicCryptTrait};
use serde::{Deserialize, Serialize};
use tauri::{Runtime, State};
use tauri_plugin_store::Store;
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
    pub stream: bool,
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

pub struct EncryptedStore<R: Runtime> {
    pub store: Store<R>,
    pub crypto: MagicCrypt256,
}

#[derive(Debug, Serialize, Deserialize, TS)]
pub struct StreamResponse {
    pub response: String,
}
