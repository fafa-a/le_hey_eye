import { useGlobalContext } from "@/context/global-context";
import { type Accessor, type Setter, Show } from "solid-js";
import SettingsPanel from "./settings-panel";

const SettingsPanelOverlay = () => {
	const { settingsPanelOpen, setSettingsPanelOpen } = useGlobalContext().ui;
	const { currentModelSettings, addSettings } =
		useGlobalContext().modelSettings;

	const handleClose = () => {
		setSettingsPanelOpen(false);
		console.log("currentModelSettings", currentModelSettings);
		addSettings(currentModelSettings);
	};

	return (
		<Show when={settingsPanelOpen()}>
			<div
				class="fixed inset-0 blur-lg will-change-transform "
				onClick={handleClose}
				onKeyDown={(e) => {
					if (e.key === "Escape") {
						handleClose();
					}
				}}
			/>
			<div class="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
				<div class="w-4/5 h-4/5 bg-white rounded-lg shadow-xl flex overflow-hidden pointer-events-auto">
					<SettingsPanel setIsOpen={setSettingsPanelOpen} />
				</div>
			</div>
		</Show>
	);
};

export default SettingsPanelOverlay;
