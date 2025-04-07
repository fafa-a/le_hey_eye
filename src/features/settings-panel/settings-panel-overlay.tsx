import { useGlobalContext } from "@/context/global-context";
import { type Accessor, type Setter, Show } from "solid-js";
import SettingsPanel from "./settings-panel";
import type { ChatRequest } from "shared/types";

interface SettingsPanelOverlayProps {
	model: Accessor<string>;
	setModel: Setter<string>;
	promptSettings: Accessor<
		Omit<ChatRequest, "messages" | "functions" | "tools">
	>;
	setPromptSettings: Setter<
		Omit<ChatRequest, "messages" | "functions" | "tools">
	>;
}

const SettingsPanelOverlay = (props: SettingsPanelOverlayProps) => {
	const { settingsPanelOpen, setSettingsPanelOpen } = useGlobalContext().ui;
	return (
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
						model={props.model()}
						setModel={props.setModel}
						promptSettings={props.promptSettings()}
						setPromptSettings={props.setPromptSettings}
					/>
				</div>
			</div>
		</Show>
	);
};

export default SettingsPanelOverlay;
