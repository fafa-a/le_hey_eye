import { createSignal, onMount } from "solid-js";

import type { ChatRequest } from "../shared/types/llm/core.ts";

import { Sidebar } from "@/features/sidebar/sidebar";

import type { ProviderType } from "../shared/types/llm/core.js";
import { useGlobalContext } from "./context/global-context.tsx";
import ConversationView from "./features/chat/conversation-view.tsx";
import SettingsPanelOverlay from "./features/settings-panel/settings-panel-overlay.tsx";

function App() {
	const { loadTopics } = useGlobalContext().topics;

	const [model, setModel] = createSignal<string>("claude-3-7-sonnet-20250219");
	const [system, setSystem] = createSignal<string>(
		"You are a helpful assistant.",
	);
	const [currentProvider, setCurrentProvider] =
		createSignal<ProviderType>("Anthropic");

	onMount(() => {
		loadTopics();
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

	return (
		<div class="h-screen max-h-screen flex overflow-hidden ">
			<Sidebar
				setCurrentProvider={setCurrentProvider}
				currentProvider={currentProvider}
			/>
			<ConversationView
				model={model}
				setModel={setModel}
				setPromptSettings={setPromptSettings}
				promptSettings={promptSettings}
				currentProvider={currentProvider}
				system={system}
			/>

			<SettingsPanelOverlay
				model={model}
				setModel={setModel}
				setPromptSettings={setPromptSettings}
				promptSettings={promptSettings}
			/>
		</div>
	);
}

export default App;
