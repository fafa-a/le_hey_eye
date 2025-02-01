import { createSignal } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { createMutation } from "@tanstack/solid-query";
import { Switch, Match } from "solid-js";
import type { ChatInput, CloudflareResponse } from "../types/cloudflare";
import { SolidMarkdown } from "solid-markdown";

async function generateAIResponse(
	input: ChatInput,
): Promise<CloudflareResponse> {
	return await invoke("call_cloudflare_api", {
		model: "@cf/meta/llama-3-8b-instruct",
		input,
	});
}

function App() {
	const [prompt, setPrompt] = createSignal("");

	const mutation = createMutation(() => ({
		mutationFn: (input: any) => generateAIResponse(input),
		onSuccess: (data) => {
			if (data.success) {
				console.log("Result:", data);
			}
		},
		onError: (error) => {
			console.error("Erreur:", error);
		},
	}));

	return (
		<main class="flex flex-col h-screen">
			<div class="flex-1 overflow-y-auto p-4">
				<Switch>
					<Match when={mutation.isError}>
						<div class="p-4 bg-red-100 text-red-700 rounded">
							Une erreur est survenue: {mutation.error?.message}
						</div>
					</Match>
					<Match when={mutation.isSuccess && mutation.data?.success}>
						<div class="p-4 bg-green-100 rounded">
							<SolidMarkdown>{mutation.data?.result.response}</SolidMarkdown>
						</div>
					</Match>
				</Switch>
			</div>
			<div class="border-t border-gray-200 bg-white p-4">
				<form
					class="max-w-4xl mx-auto"
					onSubmit={(e) => {
						e.preventDefault();
						mutation.mutate({
							messages: [
								{
									role: "system",
									content: "You are a friendly assistant that helps coding",
								},
								{
									role: "user",
									content: prompt(),
								},
							],
						});
					}}
				>
					<div class="flex flex-col gap-4">
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
							disabled={mutation.isPending}
							class="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300 hover:bg-blue-600 transition-colors"
						>
							<Switch>
								<Match when={mutation.isPending}>
									<div class="flex items-center justify-center gap-2">
										<div class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
										Génération en cours...
									</div>
								</Match>
								<Match when={!mutation.isPending}>Run</Match>
							</Switch>
						</button>
					</div>
				</form>
			</div>{" "}
		</main>
	);
}

export default App;
