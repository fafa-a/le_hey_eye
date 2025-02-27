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
import { listen } from "@tauri-apps/api/event";
import { PromptInput } from "@features/chat/prompt/PromptInput";
import { Sidebar } from "./components/common/Sidebar";
import SettingsPopover from "@features/chat/settings/SettingsPopover";
import ChatMessage from "@/features/chat/message/ChatMessage";
import { unwrap } from "solid-js/store";
import type { TopicMessage } from "@/context/topicsContext";
import { useTopics } from "@/context/topicsContext";
import Markdown from "./components/common/Markdown";

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
	const [topicActive, setTopicActive] = createSignal(topics.at(0)?.id || "");

	const [isCollapsed, setIsCollapsed] = createSignal(false);
	const [messageHistory, setMessageHistory] = createSignal<
		Omit<TopicMessage, "id">[]
	>([]);
	const [messagesContainer, setMessagesContainer] =
		createSignal<HTMLDivElement>();
	const [contentRef, setContentRef] = createSignal<HTMLDivElement>();
	const [markdownContainerRef, setMarkdownContainerRef] =
		createSignal<HTMLDivElement>();

	const [streamHeight, setStreamHeight] = createSignal(0);

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
		onSuccess: (response) => {
			console.log("response: ", response);
			const newAssistantMessage: Omit<TopicMessage, "id"> = {
				role: "assistant",
				content: currentStreamedResponse(),
				timestamp: new Date(),
				tokens_used: response.usage?.total_tokens,
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

	const currentTopicMessages = createMemo(() => {
		const currentTopic = topics.find((topic) => topic.id === topicActive());
		return currentTopic?.messages || [];
	});

	const displayMessages = createMemo(() => {
		const messages = currentTopicMessages().slice(1);
		return messages;
	});

	createEffect(() => {
		displayMessages();
		// currentStreamedResponse();

		setTimeout(() => {
			const container = messagesContainer();
			if (container) {
				container.scrollTop = container.scrollHeight - container.offsetHeight;
				container.scrollTop = container.scrollHeight;
			}
		}, 0);
	});

	createEffect(() => {
		const response = currentStreamedResponse();
		const container = messagesContainer();
		const content = contentRef();

		if (response && container && content) {
			const containerRect = container.getBoundingClientRect();
			const viewportHeight = window.innerHeight;
			const spaceBelow = viewportHeight - containerRect.bottom;

			const contentHeight = content.scrollHeight;

			const minHeight = 150;
			const idealHeight = Math.max(
				minHeight,
				Math.min(500, contentHeight + 50),
			);

			const finalHeight = Math.min(idealHeight, viewportHeight * 0.7);

			setStreamHeight(finalHeight);

			setTimeout(() => {
				if (container) {
					container.scrollTop = container.scrollHeight;
				}
			}, 0);
		} else if (!response) {
			setStreamHeight(0);
		}
	});
	//

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

			<div class="flex flex-col flex-1 w-full min-w-0 h-full xl:max-w-[1200px] 2xl:max-w-[1400px] mx-auto">
				<div
					class="min-h-[85%] flex-1 overflow-y-auto w-full"
					ref={setMessagesContainer}
				>
					<div class="space-y-4 w-full p-3">
						<For each={displayMessages()}>
							{(message) => <ChatMessage message={message} />}
						</For>
						<Show when={currentStreamedResponse()}>
							<div
								class="w-full min-w-full overflow-hidden"
								style={{
									height: currentStreamedResponse()
										? `${streamHeight()}px`
										: "auto",
								}}
								ref={setMarkdownContainerRef}
							>
								<div ref={setContentRef}>
									<Markdown>{currentStreamedResponse()}</Markdown>
								</div>
							</div>
						</Show>
						<Show when={mutation.isPending && !currentStreamedResponse()}>
							<div class="p-4 rounded w-full">
								<div class="animate-pulse text-slate-500">Thinking...</div>
							</div>
						</Show>
					</div>
				</div>
				<div class="h-[15%] min-h-[110px] max-h-[55%] mr-3 overflow-scroll xl:border xl:border-gray-300 xl:border-opacity-50 xl:rounded-lg">
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
}

export default App;
