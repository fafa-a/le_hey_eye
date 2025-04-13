import { dbApi } from "@shared/api";
import type { ModelSettings, ProviderType } from "shared/types";
import { createStore } from "solid-js/store";

export interface ModelSettingsStore {
	currentModelSettings: ModelSettings;
	loadCurrentSettings: (topicId: number) => Promise<void>;
	setProvider: (provider: ProviderType) => void;
	setSystem: (system: string) => void;
	setModelName: (modelName: string) => void;
	setTemperature: (value: number) => void;
	setMaxTokens: (value: number) => void;
	setStream: (value: boolean) => void;
	addSettings: (settings: ModelSettings) => Promise<void>;
}

const [currentModelSettings, setCurrentModelSettings] =
	createStore<ModelSettings>({
		id: 0,
		topicId: 0,
		provider: "Anthropic",
		system: "You are a helpful assistant.",
		modelName: "claude-3-7-sonnet-20250219",
		temperature: 0.1,
		maxTokens: 2048,
		stream: true,
	});

const loadCurrentSettings = async (lastAccessedTopic: number) => {
	try {
		const settings = await dbApi.getSettings(lastAccessedTopic);
		setCurrentModelSettings(settings);
	} catch (error) {
		console.error("Failed to load model settings:", error);
	}
};
const addSettings = async (settings: ModelSettings) => {
	try {
		await dbApi.addSettings(settings.id, settings);
	} catch (error) {
		console.error("Failed to add model settings:", error);
	}
};

const setProvider = (provider: ProviderType) => {
	setCurrentModelSettings("provider", provider);
};

const setSystem = (system: string) => {
	setCurrentModelSettings("system", system);
};

const setModelName = (modelName: string) => {
	setCurrentModelSettings("modelName", modelName);
};

const setTemperature = (value: number) => {
	setCurrentModelSettings("temperature", value);
};

const setMaxTokens = (value: number) => {
	setCurrentModelSettings("maxTokens", value);
};

const setStream = (value: boolean) => {
	setCurrentModelSettings("stream", value);
};

export {
	currentModelSettings,
	loadCurrentSettings,
	setProvider,
	setSystem,
	setModelName,
	setTemperature,
	setMaxTokens,
	setStream,
	addSettings,
};
