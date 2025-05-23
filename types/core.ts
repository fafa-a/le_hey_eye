// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.
import type { AnthropicModelSettings } from "../src-tauri/bindings/AnthropicModelSettings.js";
import type { ChatRole } from "../shared/types/llm/core.js";
import type { ContentType } from "../src-tauri/bindings/ContentType.js";
import type { ProviderType } from "../shared/types/llm/core.js";

export type AnthropicContentType = { "text": string } | { "image": Image };

export type BaseModelSettings = {
  provider: ProviderType;
  model: string;
  temperature: number | null;
  max_tokens: number | null;
  stream: boolean | null;
  top_p: number | null;
  frequency_penalty: number | null;
  presence_penalty: number | null;
  seed: number | null;
};

export type ContentItem = { "type": "text"; text: string } | {
  "type": "image";
  source: ImageSource;
};

export type DbTopic = {
  id: string;
  name: string;
  created_at: string;
  bg_color: string;
  last_accessed_at: string;
};

export type DbTopicMessage = {
  id: string;
  topic_id: string;
  role: ChatRole;
  content: ContentType;
  timestamp: string;
  tokens_used: number | null;
};

export type Image = { media_type: string; data: string };

export type ImageSource = { type: string; media_type: string; data: string };

export type ModelSettings = { "Anthropic": AnthropicModelSettings } | {
  "Base": BaseModelSettings;
};

export type Topic = {
  id: string;
  name: string;
  createdAt: Date;
  bgColor: string;
  lastAccessedAt: Date;
};

export type TopicMessage = {
  id: string;
  topicId: string;
  role: ChatRole;
  content: ContentType;
  timestamp: Date;
  tokensUsed: number | null;
};
