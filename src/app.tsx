import { createEffect, createMemo, createSignal } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { createMutation } from "@tanstack/solid-query";
import type { StreamResponse } from "../types/cloudflare";
import type {
	ChatMessage as ChatMessageType,
	ChatRequest,
} from "../types/core";

import { PromptInput } from "@features/chat/prompt/prompt-input";
import { Sidebar } from "@/features/sidebar/sidebar";
import { unwrap } from "solid-js/store";
import { useTopics } from "@/context/topics-context";
import type { Provider, TopicMessage } from "../types/core";
import MessageList from "./features/chat/message/message-list";

async function generateAIResponse(
	provider: Provider,
	model: string,
	request: ChatRequest,
): Promise<StreamResponse> {
	try {
		const response = await invoke("send_message", {
			provider,
			model,
			request,
		});
		return response as StreamResponse;
	} catch (error) {
		console.error("API Error:", error);
		throw error;
	}
}

// async function getCloudflareModelDetails(
// 	model: string,
// ): Promise<CloudflareModelResponse> {
// 	try {
// 		return (await invoke("get_model_details", {
// 			model,
// 		})) as CloudflareModelResponse;
// 	} catch (error) {
// 		console.error("API Error:", error);
// 		throw error;
// 	}
// }

const MAX_MESSAGES = 4;

function App() {
	const { topics, addMessage } = useTopics();
	const [model, setModel] = createSignal<string>("claude-3-7-sonnet-20250219");
	const [system, setSystem] = createSignal<string>(
		"You are a helpful assistant.",
	);
	const [currentProvider, setCurrentProvider] =
		createSignal<Provider>("Anthropic");

	const { currentTopicId, currentTopicMessages } = useTopics();

	const [isCollapsed, setIsCollapsed] = createSignal(false);
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
			(topic) => topic.id === currentTopicId(),
		)?.messages;
		setMessageHistory(topicMessages || []);
		console.log("*".repeat(100));
	}, topics);

	const [promptSettings, setPromptSettings] = createSignal<
		Omit<ChatRequest, "messages" | "functions" | "tools">
	>({
		model: model(),
		system: system(),
		stream: true,
		max_tokens: 2048,
		temperature: 0.6,
		top_p: 0.1,
		top_k: 1,
		seed: 1,
		repetition_penalty: 1.1,
		frequency_penalty: 0.5,
		presence_penalty: 0.0,
	});

	// const systemMessage = createMemo(() => {
	// 	if (currentProvider() === "Cloudflare") {
	// 		return {
	// 			messages: [
	// 				{
	// 					role: "system",
	// 					content: "You are a helpful assistant.",
	// 				},
	// 			],
	// 		};
	// 	}
	// 	if (currentProvider() === "Anthropic") {
	// 		return {
	// 			system: system(),
	// 		};
	// 	}
	// });

	const [request, setRequest] = createSignal<Omit<ChatRequest, "messages">>({
		system: system(),
		model: model(),
		max_tokens: promptSettings().max_tokens,
		stream: promptSettings().stream,
		temperature: promptSettings().temperature,
		top_p: promptSettings().top_p,
		top_k: promptSettings().top_k,
		seed: promptSettings().seed,
		repetition_penalty: promptSettings().repetition_penalty,
		frequency_penalty: promptSettings().frequency_penalty,
		presence_penalty: promptSettings().presence_penalty,
	});

	const getMessagesForAPI = (
		messages: Omit<TopicMessage, "id">[],
		userMessageCount: number,
	): Omit<TopicMessage, "id">[] => {
		// const systemMessage = messages.find((m) => m.role === "system");
		// if (!systemMessage) return messages;
		//
		// const nonSystemMessages = messages.filter((m) => m.role !== "system");
		const totalMessagesNeeded = userMessageCount * 2;
		const recentMessages = messages.slice(-totalMessagesNeeded);
		// if (currentProvider() === "Cloudflare") {
		// 	return [systemMessage, ...recentMessages];
		// }
		return [...recentMessages];
	};

	// const details = createQuery(() => ({
	// 	queryKey: ["details"],
	// 	queryFn: async () => {
	// 		return await getCloudflareModelDetails(model());
	// 	},
	// onSuccess: (data) => {
	// 	console.log("details: ", data);
	// },
	// }));

	const mapMessageToMessageContent = (
		messages: Omit<TopicMessage, "id">[],
	): ChatMessageType[] => {
		return messages.map((message) => {
			return {
				role: message.role,
				content: message.content,
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
				system: system(),
				model: model(),
				max_tokens: promptSettings().max_tokens,
				stream: promptSettings().stream,
				// top_p: promptSettings().top_p,
				// top_k: promptSettings().top_k,
				// seed: promptSettings().seed,
				// repetition_penalty: promptSettings().repetition_penalty,
				// frequency_penalty: promptSettings().frequency_penalty,
				// presence_penalty: promptSettings().presence_penalty,
				// temperature: promptSettings().temperature,
			};

			return await generateAIResponse(currentProvider(), model(), apiRequest);
		},
		onSuccess: (response) => {
			const newAssistantMessage: Omit<TopicMessage, "id"> = {
				role: "assistant",
				topicId: currentTopicId() as string,
				content: response.response,
				timestamp: new Date(),
				tokensUsed: response.usage?.total_tokens || 0,
			};
			addMessage(newAssistantMessage);

			setRequest(() => {
				return {
					messages: getMessagesForAPI(messageHistory(), MAX_MESSAGES),
					model: model(),
					max_tokens: promptSettings().max_tokens,
					stream: promptSettings().stream,
					top_p: promptSettings().top_p,
					top_k: promptSettings().top_k,
					seed: promptSettings().seed,
					repetition_penalty: promptSettings().repetition_penalty,
					frequency_penalty: promptSettings().frequency_penalty,
					presence_penalty: promptSettings().presence_penalty,
					temperature: promptSettings().temperature,
				};
			});
		},
	}));

	const handleSubmit = (prompt: string) => {
		const userMessage: Omit<TopicMessage, "id" | "tokensUsed"> = {
			role: "user",
			topicId: currentTopicId() as string,
			content: prompt,
			timestamp: new Date(),
		};

		const updatedHistory = [...messageHistory(), userMessage] as TopicMessage[];
		mutation.mutate(updatedHistory);
	};

	return (
		<div class="h-screen max-h-screen flex overflow-hidden">
			<div
				class="h-full transition-all flex-shrink-0"
				classList={{
					"w-[60px] ": isCollapsed(),
					"w-[20%] max-w-[300px] min-w-[200px]": !isCollapsed(),
				}}
			>
				<Sidebar
					isCollapsed={isCollapsed()}
					setIsCollapsed={setIsCollapsed}
					setCurrentProvider={setCurrentProvider}
					currentProvider={currentProvider}
				/>
			</div>

			<div
				class="flex flex-col flex-1 w-full min-w-0 h-full p-5 xl:max-w-[900px] 2xl:max-w-[1200px] mx-auto"
				classList={{
					"justify-center": isTopicMessagesEmpty(),
				}}
			>
				<MessageList mutation={mutation} />

				<div class="overflow-y-auto min-h-[120px] max-h-[55%]">
					<PromptInput
						onSubmit={handleSubmit}
						mutation={mutation}
						model={model}
						setModel={setModel}
						setPromptSettings={setPromptSettings}
						promptSettings={promptSettings}
						topicId={currentTopicId() as string}
					/>
				</div>
			</div>
		</div>
	);
}

export default App;
