import { createMutation } from "@tanstack/solid-query";
import {
	Show,
	createEffect,
	createMemo,
	createSignal,
	onMount,
} from "solid-js";

import type {
	ChatMessage as ChatMessageType,
	ChatRequest,
	ChatRole,
	StreamResponse,
} from "../shared/types/llm/core.ts";

import { Sidebar } from "@/features/sidebar/sidebar";
import { PromptInput } from "@features/chat/prompt/prompt-input";
import { unwrap } from "solid-js/store";

import SettingsPanel from "@/features/settings-panel/settings-panel";
import { llmApi } from "../shared/api.ts";
import type { ProviderType } from "../shared/types/llm/core.js";
import MessageList from "./features/chat/message/message-list";
import { helper } from "./lib/helper.ts";
import { useGlobalContext } from "./context/global-context.tsx";
import type { Topic, TopicMessage } from "./store/topics.ts";

const MAX_MESSAGES = 4;

function App() {
	const {
		topics,
		addMessage,
		loadTopics,
		currentTopicId,
		currentTopicMessages,
	} = useGlobalContext().topics;
	const { sidebarCollapsed, settingsPanelOpen, setSettingsPanelOpen } =
		useGlobalContext().ui;

	const [model, setModel] = createSignal<string>("claude-3-7-sonnet-20250219");
	const [system, setSystem] = createSignal<string>(
		"You are a helpful assistant.",
	);
	const [currentProvider, setCurrentProvider] =
		createSignal<ProviderType>("Anthropic");

	const [messageHistory, setMessageHistory] = createSignal<
		Omit<TopicMessage, "id">[]
	>([]);
	const isTopicMessagesEmpty = createMemo(
		() => currentTopicMessages().length === 0,
	);

	onMount(() => {
		loadTopics();
	});

	createEffect(() => {
		console.log("*".repeat(100));
		console.log("topics: ", unwrap(topics));
		const topicMessages = topics.find(
			(topic: Topic) => topic.id === currentTopicId(),
		)?.messages;
		setMessageHistory(topicMessages || []);
		console.log("*".repeat(100));
	}, topics);

	createEffect(() => {
		console.log("*".repeat(100));
		console.log({ sidebarCollapsed: sidebarCollapsed() });
		console.log({ setIsSettingsPanelOpen: settingsPanelOpen() });
	});

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

			return await llmApi.sendMessage(currentProvider(), model(), apiRequest);
		},
		onSuccess: (response) => {
			const newAssistantMessage = {
				role: "assistant" as ChatRole,
				topicId: currentTopicId(),
				content: response.response,
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
		const userMessage = {
			role: "user" as ChatRole,
			topicId: currentTopicId(),
			content: prompt,
		};

		const updatedHistory = [...messageHistory(), userMessage] as TopicMessage[];
		mutation.mutate(updatedHistory);
	};

	return (
		<div class="h-screen max-h-screen flex overflow-hidden ">
			<Sidebar
				setCurrentProvider={setCurrentProvider}
				currentProvider={currentProvider}
			/>

			<div
				class="flex flex-col flex-1 w-full min-w-0 h-full p-5 xl:max-w-[900px] 2xl:max-w-[1200px] mx-auto"
				classList={{
					"justify-center": isTopicMessagesEmpty(),
					"blur-sm will-change-transform": settingsPanelOpen(),
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
						topicId={currentTopicId()}
					/>
				</div>
			</div>
			<Show when={settingsPanelOpen()}>
				<div
					class="fixed inset-0 blur-lg will-change-transform "
					onClick={() => setSettingsPanelOpen(false)}
					onKeyDown={(e) => {
						if (e.key === "Escape") {
							setSettingsPanelOpen(false);
						}
					}}
				/>
				<div class="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
					<div class="w-4/5 h-4/5 bg-white rounded-lg shadow-xl flex overflow-hidden pointer-events-auto">
						<SettingsPanel
							setIsOpen={setSettingsPanelOpen}
							model={model()}
							setModel={setModel}
							promptSettings={promptSettings()}
							setPromptSettings={setPromptSettings}
						/>
					</div>
				</div>
			</Show>
		</div>
	);
}

export default App;
