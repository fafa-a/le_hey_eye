// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.

export type AnthropicContentType = { text: string } | { image: Image };

export type AnthropicImageSource = {
	type: ImageSourceType;
	media_type: ImageMediaType;
	data: string;
};

export type AnthropicThinkingConfig = {
	type: ThinkingType;
	budget_tokens: number;
};

export type ChatMessage = { role: ChatRole; content: ContentType };

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

export type ContentBlock =
	| { type: "text"; text: string }
	| {
			type: "image";
			source: AnthropicImageSource;
	  };

export type ContentItem =
	| { type: "text"; text: string }
	| {
			type: "image";
			source: ImageSource;
	  };

export type ContentType = string | Array<ContentItem>;

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

export type ImageMediaType =
	| "image/jpeg"
	| "image/png"
	| "image/gif"
	| "image/webp";

export type ImageSource = { type: string; media_type: string; data: string };

export type ImageSourceType = "base64";

export type MessageContent =
	| { String: string }
	| {
			Blocks: Array<ContentBlock>;
	  };

export type Provider = "Cloudflare" | "Anthropic" | "Mistral";

export type ThinkingType = "enabled";

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
