import { invoke } from "@tauri-apps/api/core";
import { createStore } from "solid-js/store";

const [currentModelSettings, setCurrentModelSettings] = createStore({
	provider: "anthropic",
	model: "claude-3-7-sonnet-20250219",
	temperature: 0.1,
	maxTokens: 2048,
});

const loadCurrentSettings = async (profileId) => {
	try {
		const settings = await invoke("get_current_model_settings", {
			profileId,
		});
		setCurrentModelSettings({
			provider: settings.provider,
			model: settings.model,
			temperature: settings.temperature,
			maxTokens: settings.maxTokens,
		});
	} catch (error) {
		console.error("Failed to load model settings:", error);
	}
};

// Définir le fournisseur et modèle actuel
const setCurrentModel = (provider, model) => {
	setCurrentModelSettings({
		currentProvider: provider,
		currentModel: model,
		// Récupérer les paramètres par défaut pour ce modèle
		temperature: modelSettings.providers[provider]?.temperature || 0.7,
	});
};

// Mettre à jour la température
const setTemperature = (value) => {
	setCurrentModelSettings("temperature", value);
};

export const modelSettingsStore = {
	currentModelSettings,
	loadCurrentSettings,
	setCurrentModel,
	setTemperature,
};
