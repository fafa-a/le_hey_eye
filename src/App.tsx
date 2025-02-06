import { createSignal, For, onCleanup, onMount, createEffect } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { createMutation } from "@tanstack/solid-query";
import type {
	PromptSettings,
	ChatRequest,
	CloudflareResponse,
} from "../types/cloudflare";
import { SolidMarkdown } from "solid-markdown";
import { listen } from "@tauri-apps/api/event";
import { Navigation } from "./components/common/Navigation";
import { PromptInput } from "./components/common/PromptInput";
import { Sidebar } from "./components/common/Sidebar";

async function generateAIResponse(
	model: string,
	request: ChatRequest,
): Promise<CloudflareResponse> {
	console.log("generateAIResponse", model, request);
	return await invoke("call_cloudflare_api", {
		model,
		request,
	});
}
const MAX_MESSAGES = 10;

function App() {
	const [model, setModel] = createSignal<string>(
		"@cf/mistral/mistral-7b-instruct-v0.1",
	);
	const [promptSettings, setPromptSettings] = createSignal<PromptSettings>({
		stream: true,
		max_tokens: 256,
		temperature: 0.6,
		top_p: 0,
		top_k: 1,
		seed: BigInt(0),
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
		...promptSettings(),
	});
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
		mutationFn: async (request: ChatRequest) => {
			setCurrentStreamedResponse("");
			const response = await generateAIResponse(model(), request);
			return response;
		},
		onSuccess: (data) => {
			console.log("data", data);
			setRequest((prevReq) => {
				const newRequest = {
					messages: [
						...prevReq.messages,
						{
							role: "assistant",
							content: currentStreamedResponse(),
						},
					],
				};

				return {
					messages: [
						newRequest.messages[0],
						...newRequest.messages.slice(-MAX_MESSAGES),
					],
					...promptSettings(),
				};
			});
			setCurrentStreamedResponse("");
		},
	}));

	const handleSubmit = (prompt: string) => {
		const userMessage = {
			role: "user",
			content: prompt,
		};
		setRequest((prevReq) => ({
			messages: [...prevReq.messages, userMessage],
			...promptSettings(),
		}));

		mutation.mutate({
			messages: request().messages,
			...promptSettings(),
		});
	};
	createEffect(() => {
		console.log("app", model());
	});
	return (
		<main class="flex flex-col h-screen">
			<Navigation setModel={setModel} />
			<div class="flex-1 flex">
				<Sidebar />
				<div class="flex flex-col flex-1">
					<div class="flex-1 overflow-y-auto p-4">
						<div class="space-y-4">
							<For each={request().messages.slice(1)}>
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
