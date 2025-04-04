import { invoke } from "@tauri-apps/api/core";
import type {
	ProviderType,
	ChatRequest,
	StreamResponse,
	Topic,
	Message,
} from "./types";

export const llmApi = {
	sendMessage: (provider: ProviderType, model: string, request: ChatRequest) =>
		invoke<StreamResponse>("send_message", { provider, model, request }),

	listModels: (provider: ProviderType) =>
		invoke<string[]>("list_models", { provider }),

	// getModelDetails: (provider: ProviderType, modelId: string) =>
	// 	invoke<ModelDetails>("get_model_details", { provider, model_id: modelId }),

	hasCredentials: (provider: ProviderType) =>
		invoke<boolean>("has_credentials", { provider }),

	saveCredentials: (provider: ProviderType, apiKey: string) =>
		invoke<boolean>("save_credentials", { provider, api_key: apiKey }),

	getSupportedProviders: () =>
		invoke<ProviderType[]>("get_supported_providers"),
};

export const dbApi = {
	getAllTopics: () => invoke<Topic[]>("get_all_topics"),

	getMessagesByTopic: (topicId: number) =>
		invoke<Message[]>("get_messages_by_topic", { topicId }),

	addTopic: (name: string) => invoke<Topic>("add_topic", { name }),

	removeTopic: (topicId: number) =>
		invoke<boolean>("remove_topic", { topicId }),

	editTopicName: (topicId: number, newName: string) =>
		invoke<Topic>("edit_topic_name", { topicId, name: newName }),

	updateTopicAccess: (topicId: number) =>
		invoke<boolean>("update_topic_access", { topicId }),

	getLastAccessedTopic: () => invoke<number | null>("get_last_accessed_topic"),

	addMessage: (topicId: number, role: string, content: string) =>
		invoke<Message>("add_message", { topicId, role, content }),

	removeMessages: (messageIds: number[]) =>
		invoke<boolean>("remove_messages", { messageIds }),
};
