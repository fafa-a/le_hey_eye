import { useGlobalContext } from "@/context/global-context";
import {
	createMutation,
	type CreateMutationResult,
} from "@tanstack/solid-query";
import MessageList from "./message/message-list";
import { PromptInput } from "./prompt/prompt-input";
import type {
	ChatMessage,
	ChatRequest,
	ChatRole,
	ProviderType,
	StreamResponse,
} from "shared/types";
import type { Topic, TopicMessage } from "@/store/topics";
import {
	createEffect,
	createMemo,
	createSignal,
	type Accessor,
	type Setter,
} from "solid-js";
import { helper } from "@/lib/helper";
import { llmApi } from "../../../shared/api";
import { unwrap } from "solid-js/store";

// interface ConversationViewProps {
// 	system: Accessor<string>;
// 	currentProvider: Accessor<ProviderType>;
// 	model: Accessor<string>;
// 	setModel: Setter<string>;
// 	setPromptSettings: Setter<
// 		Omit<ChatRequest, "messages" | "functions" | "tools">
// 	>;
// 	promptSettings: Accessor<
// 		Omit<ChatRequest, "messages" | "functions" | "tools">
// 	>;
// }

const MAX_MESSAGES = 4;

const ConversationView = () => {
	const { topics, currentTopicId, currentTopicMessages, addMessage } =
		useGlobalContext().topics;
	const { currentModelSettings, setModelName } =
		useGlobalContext().modelSettings;

	const { settingsPanelOpen } = useGlobalContext().ui;
	const [messageHistory, setMessageHistory] = createSignal<
		Omit<TopicMessage, "id">[]
	>([]);

	const isTopicMessagesEmpty = createMemo(
		() => currentTopicMessages().length === 0,
	);
	createEffect(() => {
		console.log("*".repeat(100));
		console.log("topics: ", unwrap(topics));
		const topicMessages = topics.find(
			(topic: Topic) => topic.id === currentTopicId(),
		)?.messages;
		setMessageHistory(topicMessages || []);
		console.log("*".repeat(100));
	}, topics);

	const getMessagesForAPI = (
		messages: Omit<TopicMessage, "id">[],
		userMessageCount: number,
	): Omit<TopicMessage, "id">[] => {
		const totalMessagesNeeded = userMessageCount * 2;
		const recentMessages = messages.slice(-totalMessagesNeeded);
		return [...recentMessages];
	};

	const mapMessageToMessageContent = (
		messages: Omit<TopicMessage, "id">[],
	): ChatMessage[] => {
		return messages.map((msg) => {
			return {
				role: msg.role,
				content: helper.message.mapContent(msg.content),
			};
		});
	};

	const mutation = createMutation(() => ({
		mutationFn: async (
			topicMessages: TopicMessage[],
		): Promise<StreamResponse> => {
			const apiMessages = getMessagesForAPI(topicMessages, MAX_MESSAGES);
			const messages = mapMessageToMessageContent(apiMessages);

			const apiRequest: ChatRequest = {
				messages,
				system: currentModelSettings.system,
				model: currentModelSettings.modelName,
				max_tokens: currentModelSettings.maxTokens,
				stream: currentModelSettings.stream,
			};

			return await llmApi.sendMessage(
				currentModelSettings.provider,
				currentModelSettings.modelName,
				apiRequest,
			);
		},
		onSuccess: (response) => {
			const newAssistantMessage = {
				role: "assistant" as ChatRole,
				topicId: currentTopicId(),
				content: response.response,
				tokensUsed: response.usage?.completion_tokens,
			} as TopicMessage;

			addMessage(newAssistantMessage);
			console.log("response", response);
			setRequest(() => {
				return {
					messages: getMessagesForAPI(messageHistory(), MAX_MESSAGES),
					model: currentModelSettings.modelName,
					max_tokens: currentModelSettings.maxTokens,
					stream: currentModelSettings.stream,
					temperature: currentModelSettings.temperature,
				};
			});
		},
	}));

	const handleSubmit = (prompt: string) => {
		const userMessage = {
			role: "user" as ChatRole,
			topicId: currentTopicId(),
			content: prompt,
		};

		const updatedHistory = [...messageHistory(), userMessage] as TopicMessage[];
		mutation.mutate(updatedHistory);
	};

	return (
		<div
			class="flex flex-col flex-1 w-full min-w-0 h-full p-5 xl:max-w-[900px] 2xl:max-w-[1200px] mx-auto"
			classList={{
				"justify-center": isTopicMessagesEmpty(),
				"blur-sm will-change-transform": settingsPanelOpen(),
			}}
		>
			<MessageList mutation={mutation} />

			<PromptInput
				onSubmit={handleSubmit}
				mutation={mutation}
				model={currentModelSettings.modelName}
				setModel={setModelName}
				topicId={currentTopicId()}
			/>
		</div>
	);
};

export default ConversationView;
