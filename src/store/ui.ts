import { createStore } from "solid-js/store";

export interface UIStore {
	sidebarCollapsed(): boolean;
	toggleSidebar(): void;
	setSidebarCollapsed(isCollapsed: boolean): void;
	settingsPanelOpen(): boolean;
	toggleSettingsPanel(): void;
	setSettingsPanelOpen(isOpen: boolean): void;
}

const [uiStore, setUiStore] = createStore({
	sidebar: {
		isCollapsed: false,
		isSettingsPanelOpen: false,
	},
});

const sidebarCollapsed = () => uiStore.sidebar.isCollapsed;
const toggleSidebar = () => setUiStore("sidebar", "isCollapsed", (v) => !v);
const setSidebarCollapsed = (isCollapsed: boolean) =>
	setUiStore("sidebar", "isCollapsed", isCollapsed);

const settingsPanelOpen = () => uiStore.sidebar.isSettingsPanelOpen;
const toggleSettingsPanel = () =>
	setUiStore("sidebar", "isSettingsPanelOpen", (v) => !v);
const setSettingsPanelOpen = (isOpen: boolean) =>
	setUiStore("sidebar", "isSettingsPanelOpen", isOpen);

export {
	sidebarCollapsed,
	toggleSidebar,
	setSidebarCollapsed,
	settingsPanelOpen,
	toggleSettingsPanel,
	setSettingsPanelOpen,
};
