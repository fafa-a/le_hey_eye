import { createSignal, For, onCleanup, onMount } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { createMutation } from "@tanstack/solid-query";
import type { ChatInput, CloudflareResponse } from "../types/cloudflare";
import { SolidMarkdown } from "solid-markdown";
import { listen } from "@tauri-apps/api/event";
import { Navigation } from "./components/common/Navigation";
import { PromptInput } from "./components/common/PromptInput";

async function generateAIResponse(
	model: string,
	messages: ChatInput,
): Promise<CloudflareResponse> {
	return await invoke("call_cloudflare_api", {
		model,
		messages,
	});
}

const MAX_MESSAGES = 10;

function App() {
	const [model, setModel] = createSignal<string>(
		"@cf/mistral/mistral-7b-instruct-v0.1",
	);
	const [messages, setMessages] = createSignal<
		Array<{ role: string; content: string }>
	>([
		{
			role: "system",
			content: "You are a friendly assistant that helps coding",
		},
	]);
	const [currentStreamedResponse, setCurrentStreamedResponse] =
		createSignal("");

	onMount(() => {
		const unlisten = listen("stream-response", (event) => {
			setCurrentStreamedResponse((prev) => (prev + event.payload) as string);
		});

		onCleanup(() => {
			unlisten.then((fn) => fn());
		});
	});

	const mutation = createMutation(() => ({
		mutationFn: async (input: ChatInput) => {
			setCurrentStreamedResponse("");
			const response = await generateAIResponse(model(), input);
			return response;
		},
		onSuccess: (data) => {
			// setMessages((prev) => [
			// 	...prev,
			// 	{
			// 		role: "assistant",
			// 		content: currentStreamedResponse(),
			// 	},
			// ]);
			setMessages((prev) => {
				const newMessages = [
					...prev,
					{
						role: "assistant",
						content: currentStreamedResponse(),
					},
				];
				return [newMessages[0], ...newMessages.slice(-MAX_MESSAGES)];
			});
			setCurrentStreamedResponse("");
		},
	}));

	const handleSubmit = (prompt: string) => {
		const userMessage = {
			role: "user",
			content: prompt,
		};
		setMessages((prev) => [...prev, userMessage]);

		mutation.mutate({
			messages: messages(),
			stream: true,
		});
	};
	return (
		<main class="flex flex-col h-screen">
			<Navigation setModel={setModel} />
			<div class="flex-1 overflow-y-auto p-4">
				<div class="space-y-4">
					<For each={messages().slice(1)}>
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
			<PromptInput
				onSubmit={handleSubmit}
				mutation={mutation}
				// onSettingsClick={toggleSettings}
			/>
		</main>
	);
}

export default App;
