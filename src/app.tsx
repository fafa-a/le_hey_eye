import { onMount } from "solid-js";

import { Sidebar } from "@/features/sidebar/sidebar";

import { useGlobalContext } from "./context/global-context.tsx";
import ConversationView from "./features/chat/conversation-view.tsx";
import SettingsPanelOverlay from "./features/settings-panel/settings-panel-overlay.tsx";

function App() {
	const { loadTopics, currentTopicId } = useGlobalContext().topics;
	const { loadCurrentSettings } = useGlobalContext().modelSettings;

	onMount(() => {
		loadTopics();
		loadCurrentSettings(currentTopicId());
	});

	return (
		<div class="h-screen max-h-screen flex overflow-hidden ">
			<Sidebar />
			<ConversationView />
			<SettingsPanelOverlay />
		</div>
	);
}

export default App;
