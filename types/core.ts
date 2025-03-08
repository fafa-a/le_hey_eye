// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.

export type AnthropicContentType = { "text": string } | { "image": Image };

export type AnthropicThinkingConfig = {
  type: ThinkingType;
  budget_tokens: number;
};

export type ChatMessage = {
  role: ChatRole;
  content: Array<AnthropicContentType>;
};

export type ChatRequest = {
  messages: Array<ChatMessage>;
  max_tokens: number | null;
  model?: string;
  system?: string;
  stream?: boolean;
  temperature?: number;
  thinking?: AnthropicThinkingConfig;
  top_p?: number;
  top_k?: number;
  seed?: number;
  repetition_penalty?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  lora?: string;
};

export type ChatRole = "system" | "user" | "assistant";

export type Image = { media_type: string; data: string };

export type Provider = "Cloudflare" | "Anthropic" | "Mistral";

export type ThinkingType = "enabled";
