import {
	createEffect,
	createMemo,
	createSignal,
	For,
	onCleanup,
	onMount,
	Show,
} from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { createMutation, createQuery } from "@tanstack/solid-query";
import type {
	Message,
	ChatRequest,
	StreamResponse,
	CloudflareModelResponse,
} from "../types/cloudflare";
import { SolidMarkdown } from "solid-markdown";
import { listen } from "@tauri-apps/api/event";
import { PromptInput } from "@features/chat/prompt/PromptInput";
import { Sidebar } from "./components/common/Sidebar";
import SettingsPopover from "@features/chat/settings/SettingsPopover";
import ChatMessage from "@/features/chat/message/ChatMessage";
import { unwrap } from "solid-js/store";
import type { TopicMessage } from "@/context/topicsContext";
import { useTopics } from "@/context/topicsContext";

async function generateAIResponse(
	model: string,
	request: ChatRequest,
): Promise<StreamResponse> {
	try {
		const response = await invoke("call_cloudflare_api", {
			model,
			request,
		});
		return response as StreamResponse;
	} catch (error) {
		console.error("API Error:", error);
		throw error;
	}
}

async function getCloudflareModelDetails(
	model: string,
): Promise<CloudflareModelResponse> {
	try {
		return (await invoke("get_cloudflare_ai_models_details", {
			model,
		})) as CloudflareModelResponse;
	} catch (error) {
		console.error("API Error:", error);
		throw error;
	}
}

const MAX_MESSAGES = 4;

function App() {
	const { topics, addMessage } = useTopics();
	const [model, setModel] = createSignal<string>(
		"@cf/mistral/mistral-7b-instruct-v0.1",
	);
	const [topicId, setTopicId] = createSignal("");
	const [topicActive, setTopicActive] = createSignal("");

	const [isCollapsed, setIsCollapsed] = createSignal(false);
	const [messageHistory, setMessageHistory] = createSignal<
		Omit<TopicMessage, "id">[]
	>([]);

	createEffect(() => {
		console.log("*".repeat(100));
		console.log("topics: ", unwrap(topics));
		const topicMessages = topics.find(
			(topic) => topic.id === topicActive(),
		)?.messages;
		setMessageHistory(topicMessages || []);
		console.log("*".repeat(100));
	}, topics);

	const [promptSettings, setPromptSettings] = createSignal<
		Omit<ChatRequest, "messages" | "functions" | "tools">
	>({
		stream: true,
		max_tokens: 256,
		temperature: 0.6,
		top_p: 0.1,
		top_k: 1,
		seed: 1,
		repetition_penalty: 1.1,
		frequency_penalty: 0.5,
		presence_penalty: 0.0,
	});

	const [request, setRequest] = createSignal<ChatRequest>({
		messages: [
			{
				role: "system",
				content: "You are a helpful assistant.",
			},
		],
		stream: promptSettings().stream,
		max_tokens: promptSettings().max_tokens,
		temperature: promptSettings().temperature,
		top_p: promptSettings().top_p,
		top_k: promptSettings().top_k,
		seed: promptSettings().seed,
		repetition_penalty: promptSettings().repetition_penalty,
		frequency_penalty: promptSettings().frequency_penalty,
		presence_penalty: promptSettings().presence_penalty,
	});
	const [currentStreamedResponse, setCurrentStreamedResponse] =
		createSignal("");

	const getMessagesForAPI = (
		messages: Message[],
		userMessageCount: number,
	): Message[] => {
		const systemMessage = messages.find((m) => m.role === "system");
		if (!systemMessage) return messages;

		const nonSystemMessages = messages.filter((m) => m.role !== "system");
		const totalMessagesNeeded = userMessageCount * 2;
		const recentMessages = nonSystemMessages.slice(-totalMessagesNeeded);

		return [systemMessage, ...recentMessages];
	};

	onMount(() => {
		const unlisten = listen("stream-response", (event) => {
			setCurrentStreamedResponse((prev) => (prev + event.payload) as string);
		});

		onCleanup(() => {
			unlisten.then((fn) => fn());
		});
	});

	const details = createQuery(() => ({
		queryKey: ["details"],
		queryFn: async () => {
			return await getCloudflareModelDetails(model());
		},
		// onSuccess: (data) => {
		// 	console.log("details: ", data);
		// },
	}));

	const mutation = createMutation(() => ({
		mutationFn: async (messages: Message[]): Promise<StreamResponse> => {
			setCurrentStreamedResponse("");
			const apiMessages = getMessagesForAPI(messages, MAX_MESSAGES);
			const apiRequest: ChatRequest = {
				messages: apiMessages,
				stream: promptSettings().stream,
				max_tokens: promptSettings().max_tokens,
				top_p: promptSettings().top_p,
				top_k: promptSettings().top_k,
				seed: promptSettings().seed,
				repetition_penalty: promptSettings().repetition_penalty,
				frequency_penalty: promptSettings().frequency_penalty,
				presence_penalty: promptSettings().presence_penalty,
				temperature: promptSettings().temperature,
			};

			return await generateAIResponse(model(), apiRequest);
		},
		onSuccess: () => {
			const newAssistantMessage: Omit<TopicMessage, "id"> = {
				role: "assistant",
				content: currentStreamedResponse(),
				timestamp: new Date(),
			};
			addMessage(topicActive(), newAssistantMessage);

			setRequest(() => {
				return {
					messages: getMessagesForAPI(messageHistory(), MAX_MESSAGES),
					stream: promptSettings().stream,
					max_tokens: promptSettings().max_tokens,
					top_p: promptSettings().top_p,
					top_k: promptSettings().top_k,
					seed: promptSettings().seed,
					repetition_penalty: promptSettings().repetition_penalty,
					frequency_penalty: promptSettings().frequency_penalty,
					presence_penalty: promptSettings().presence_penalty,
					temperature: promptSettings().temperature,
				};
			});
			setCurrentStreamedResponse("");
		},
	}));

	const handleSubmit = (prompt: string) => {
		const userMessage: Omit<TopicMessage, "id"> = {
			role: "user",
			content: prompt,
			timestamp: new Date(),
		};
		const updatedHistory = [...messageHistory(), userMessage];

		mutation.mutate(updatedHistory);
	};

	// Create a memoized signal for the current topic's messages
	const currentTopicMessages = createMemo(() => {
		const currentTopic = topics.find((topic) => topic.id === topicActive());
		return currentTopic?.messages || [];
	});

	// Create a memoized signal for the displayable messages
	const displayMessages = createMemo(() => {
		// Skip the first message (system message) and add any streaming message
		const messages = currentTopicMessages().slice(1);
		return messages;
	});

	return (
		<div class="h-screen flex overflow-hidden">
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
					topicId={topicId()}
					setTopicId={setTopicId}
					topicActive={topicActive()}
					setTopicActive={setTopicActive}
				/>
			</div>

			<div class="flex flex-col flex-1 w-full min-w-0">
				<div class="h-[85%] overflow-y-auto w-full">
					<div class="space-y-4 w-full p-3">
						<For each={displayMessages()}>
							{(message) => <ChatMessage message={message} />}
						</For>
						<Show when={currentStreamedResponse()}>
							<div class="rounded break-words">
								<SolidMarkdown>{currentStreamedResponse()}</SolidMarkdown>
							</div>
						</Show>
						<Show when={mutation.isPending && !currentStreamedResponse()}>
							<div class="p-4 rounded w-full">
								<div class="animate-pulse text-slate-500">Thinking...</div>
							</div>
						</Show>
					</div>
				</div>

				<div class="h-[15%] mr-3">
					<div class="flex justify-end">
						<SettingsPopover
							model={model}
							setModel={setModel}
							promptSettings={promptSettings}
							setPromptSettings={setPromptSettings}
						/>
					</div>
					<PromptInput
						onSubmit={handleSubmit}
						mutation={mutation}
						model={model}
						setModel={setModel}
						setPromptSettings={setPromptSettings}
						promptSettings={promptSettings}
						topicId={topicActive()}
					/>
				</div>
			</div>
		</div>
	);

	// return (
	// 	<main class="grid h-screen bg-white grid-cols-[auto_1fr] grid-rows-[1fr_auto]">
	// 		<div
	// 			class={`h-full transition-all duration-300 ${
	// 				isCollapsed()
	// 					? "w-[60px] bg-red-500"
	// 					: "w-[20%] max-w-[300px] min-w-[200px] bg-blue-500"
	// 			}`}
	// 		>
	// 			<Sidebar
	// 				isCollapsed={isCollapsed()}
	// 				setIsCollapsed={setIsCollapsed}
	// 				topicId={topicId()}
	// 				setTopicId={setTopicId}
	// 				topicActive={topicActive()}
	// 				setTopicActive={setTopicActive}
	// 			/>
	// 		</div>
	//
	// 		<div class="flex flex-col h-full">
	// 			<div class="flex-grow overflow-y-auto p-4">
	// 				<div class="space-y-4 max-w-full">
	// 					<For each={displayMessages()}>
	// 						{(message) => <ChatMessage message={message} />}
	// 					</For>
	// 					<Show when={currentStreamedResponse()}>
	// 						<div class="p-4 rounded mr-9 break-words bg-red-500">
	// 							<SolidMarkdown>{currentStreamedResponse()}</SolidMarkdown>
	// 						</div>
	// 					</Show>
	// 					<Show when={mutation.isPending && !currentStreamedResponse()}>
	// 						<div class="p-4 rounded w-full">
	// 							<div class="animate-pulse text-slate-500">Thinking...</div>
	// 						</div>
	// 					</Show>
	// 				</div>
	// 			</div>
	//
	// 			<div class="flex-shrink-0 pb-2 space-y-1 p-4 bg-gray-100 border-t">
	// 				<PromptInput
	// 					onSubmit={handleSubmit}
	// 					mutation={mutation}
	// 					model={model}
	// 					setModel={setModel}
	// 					setPromptSettings={setPromptSettings}
	// 					promptSettings={promptSettings}
	// 					topicId={topicActive()}
	// 				/>
	// 			</div>
	// 		</div>
	//
	// 		<div class="flex justify-end p-4 bg-gray-100 border-t">
	// 			<SettingsPopover
	// 				model={model}
	// 				setModel={setModel}
	// 				promptSettings={promptSettings}
	// 				setPromptSettings={setPromptSettings}
	// 			/>
	// 		</div>
	// 	</main>
	// );
	// return (
	// 	<main class="flex flex-col h-screen bg-white">
	// 		<div class="flex h-full">
	// 			<div
	// 				class="h-full"
	// 				classList={{
	// 					"w-[60px] shrink-0 bg-red-500": isCollapsed(),
	// 					"w-[20%] max-w-[300px] min-w-[200px] shrink-0 bg-blue-500":
	// 						!isCollapsed(),
	// 				}}
	// 			>
	// 				<Sidebar
	// 					isCollapsed={isCollapsed()}
	// 					setIsCollapsed={setIsCollapsed}
	// 					topicId={topicId()}
	// 					setTopicId={setTopicId}
	// 					topicActive={topicActive()}
	// 					setTopicActive={setTopicActive}
	// 				/>
	// 			</div>
	// 			<div class="flex-1 flex flex-col">
	// 				<div class="flex-grow overflow-y-auto">
	// 					<div class="space-y-4 max-w-full">
	// 						<For each={displayMessages()}>
	// 							{(message) => <ChatMessage message={message} />}
	// 						</For>
	// 						<Show when={currentStreamedResponse()}>
	// 							<div class="p-4 rounded mr-9 break-words bg-red-500">
	// 								<SolidMarkdown>{currentStreamedResponse()}</SolidMarkdown>
	// 							</div>
	// 						</Show>
	// 						<Show when={mutation.isPending && !currentStreamedResponse()}>
	// 							<div class="p-4 rounded w-full">
	// 								<div class="animate-pulse text-slate-500">Thinking...</div>
	// 							</div>
	// 						</Show>
	// 					</div>
	// 				</div>
	// 				<div class="flex-shrink-0 pb-2 space-y-1">
	// 					<div class="flex justify-end mr-3">
	// 						<SettingsPopover
	// 							model={model}
	// 							setModel={setModel}
	// 							promptSettings={promptSettings}
	// 							setPromptSettings={setPromptSettings}
	// 						/>
	// 					</div>
	// 					<PromptInput
	// 						onSubmit={handleSubmit}
	// 						mutation={mutation}
	// 						model={model}
	// 						setModel={setModel}
	// 						setPromptSettings={setPromptSettings}
	// 						promptSettings={promptSettings}
	// 						topicId={topicActive()}
	// 					/>
	// 				</div>
	// 			</div>
	// 		</div>
	// 	</main>
	// );
}

export default App;
