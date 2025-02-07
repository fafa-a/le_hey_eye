import { createSignal, For, onCleanup, onMount, createEffect } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { createMutation } from "@tanstack/solid-query";
import type { Message, ChatRequest, StreamResponse } from "../types/cloudflare";
import { SolidMarkdown } from "solid-markdown";
import { listen } from "@tauri-apps/api/event";
import { Navigation } from "./components/common/Navigation";
import { PromptInput } from "./components/common/PromptInput";
import { Sidebar } from "./components/common/Sidebar";

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
const MAX_MESSAGES = 4;

function App() {
	const [model, setModel] = createSignal<string>(
		"@cf/mistral/mistral-7b-instruct-v0.1",
	);
	const [messageHistory, setMessageHistory] = createSignal<Message[]>([
		{
			role: "system",
			content: "You are a helpful assistant.",
		},
	]);
	const [promptSettings, setPromptSettings] = createSignal<
		Omit<ChatRequest, "messages" | "functions" | "tools" | "lora">
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
		onSuccess: (data) => {
			const newAssistantMessage: Message = {
				role: "assistant",
				content: currentStreamedResponse(),
			};

			setMessageHistory((prev) => [...prev, newAssistantMessage]);
			setRequest((prevReq: ChatRequest) => {
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
		const userMessage: Message = {
			role: "user",
			content: prompt,
		};

		const updatedHistory = [...messageHistory(), userMessage];
		setMessageHistory(updatedHistory);

		mutation.mutate(updatedHistory);
	};

	return (
		<main class="flex flex-col h-screen">
			<Navigation setModel={setModel} />
			<div class="flex-1 flex">
				<Sidebar />
				<div class="flex flex-col flex-1">
					<div class="flex-1 overflow-y-auto p-4">
						<div class="space-y-4">
							<For each={messageHistory().slice(1)}>
								{(message) => (
									<div
										class={`p-4 rounded ${
											message.role === "user"
												? "bg-blue-100 ml-auto max-w-[80%]"
												: "bg-gray-100 mr-auto max-w-[80%]"
										}`}
									>
										<SolidMarkdown>{message.content}</SolidMarkdown>
									</div>
								)}
							</For>
							{currentStreamedResponse() && (
								<div class="p-4 bg-gray-100 rounded mr-auto max-w-[80%]">
									<SolidMarkdown>{currentStreamedResponse()}</SolidMarkdown>
								</div>
							)}
							{mutation.isPending && !currentStreamedResponse() && (
								<div class="p-4 bg-gray-100 rounded mr-auto max-w-[80%]">
									<div class="animate-pulse">Thinking...</div>
								</div>
							)}
						</div>
					</div>
					<div class="flex-shrink-0 pb-2">
						<PromptInput
							onSubmit={handleSubmit}
							mutation={mutation}
							model={model}
							setModel={setModel}
						/>
					</div>
				</div>
			</div>
		</main>
	);
}

export default App;
