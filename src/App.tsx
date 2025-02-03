import { createEffect, createSignal, For, onCleanup, onMount } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { createMutation } from "@tanstack/solid-query";
import { Switch, Match } from "solid-js";
import type { ChatInput, CloudflareResponse } from "../types/cloudflare";
import { SolidMarkdown } from "solid-markdown";
import { listen } from "@tauri-apps/api/event";
import { Navigation } from "./components/common/Navigation";

async function generateAIResponse(
	model: string,
	messages: ChatInput,
): Promise<CloudflareResponse> {
	console.log({ model });
	return await invoke("call_cloudflare_api", {
		model,
		messages,
	});
}

const MAX_MESSAGES = 10;

function App() {
	const [prompt, setPrompt] = createSignal("");
	const [model, setModel] = createSignal<string>(
		"@cf/meta/llama-4-8b-instruct",
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

	createEffect(() => {
		console.log(model());
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
	const handleSubmit = (e: Event) => {
		e.preventDefault();

		const userMessage = {
			role: "user",
			content: prompt(),
		};
		setMessages((prev) => [...prev, userMessage]);

		mutation.mutate({
			messages: messages(),
			stream: true,
		});

		setPrompt("");
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
			<div class="border-t border-gray-200 bg-white p-2">
				<form class="max-w-4xl mx-auto" onSubmit={handleSubmit}>
					<div class="flex gap-2">
						<textarea
							rows={4}
							placeholder="Enter a prompt..."
							value={prompt()}
							class="w-full p-2 border rounded resize-none"
							onInput={(e) => setPrompt(e.currentTarget.value)}
							onKeyDown={(e) => {
								if (e.ctrlKey && e.key === "Enter") {
									e.preventDefault();
									e.currentTarget.form?.requestSubmit();
								}
							}}
						/>
						<button
							type="submit"
							disabled={mutation.isPending || !prompt().trim()}
							class="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300 hover:bg-blue-600 transition-colors"
						>
							<Switch>
								<Match when={mutation.isPending}>
									<div class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
								</Match>
								<Match when={!mutation.isPending}>Send</Match>
							</Switch>
						</button>
					</div>
				</form>
			</div>
		</main>
	);
}

export default App;
