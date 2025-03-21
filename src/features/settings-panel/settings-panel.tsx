import { type Component, createSignal, For } from "solid-js";
import NavItem from "./components/nav-item";
import CarbonSettings from "@/components/icons/settings";
import Providers from "./components/providers";

interface SettingsPanelProps {
	setIsOpen: (isOpen: boolean) => void;
	model: string;
	setModel: (model: string) => void;
	promptSettings: any;
	setPromptSettings: (settings: any) => void;
}

const SettingsPanel: Component<SettingsPanelProps> = (props) => {
	const [activeSection, setActiveSection] = createSignal("models");

	const items = [
		{ id: "providers", label: "Providers" },
		{ id: "preference", label: "Preference" },
		{ id: "profile", label: "Profile" },
		{ id: "prompt", label: "Default Prompt" },
	];

	const renderContent = () => {
		switch (activeSection()) {
			case "providers":
				return <Providers />;

			case "models":
				return (
					<div class="p-6">
						<h2 class="text-2xl font-bold mb-6">Paramètres des modèles</h2>

						<div class="space-y-6">
							<div>
								<label class="block text-sm font-medium mb-2">
									Modèle par défaut
								</label>
								<select
									class="w-full p-3 border rounded-lg bg-white"
									value={props.model}
									onChange={(e) => props.setModel(e.currentTarget.value)}
								>
									<option value="gpt-3.5">GPT-3.5</option>
									<option value="gpt-4">GPT-4</option>
									<option value="claude">Claude</option>
									<option value="llama">Llama</option>
								</select>
							</div>

							<div>
								<label class="block text-sm font-medium mb-2">Clé API</label>
								<input
									type="password"
									class="w-full p-3 border rounded-lg"
									placeholder="sk-..."
								/>
							</div>

							<div>
								<label class="flex items-center space-x-2">
									<input type="checkbox" class="form-checkbox h-5 w-5" />
									<span>Utiliser le modèle local quand disponible</span>
								</label>
							</div>
						</div>
					</div>
				);

			case "prompt":
				return (
					<div class="p-6">
						<h2 class="text-2xl font-bold mb-6">Paramètres de prompt</h2>

						<div class="space-y-6">
							<div>
								<label class="block text-sm font-medium mb-2">
									Température: {props.promptSettings.temperature || 0.7}
								</label>
								<input
									type="range"
									min="0"
									max="1"
									step="0.1"
									class="w-full"
									value={props.promptSettings.temperature || 0.7}
									onChange={(e) =>
										props.setPromptSettings({
											...props.promptSettings,
											temperature: parseFloat(e.currentTarget.value),
										})
									}
								/>
								<div class="flex justify-between text-xs text-gray-500 mt-1">
									<span>Précis</span>
									<span>Équilibré</span>
									<span>Créatif</span>
								</div>
							</div>

							<div>
								<label class="block text-sm font-medium mb-2">
									Longueur maximale: {props.promptSettings.maxTokens || 2048}
								</label>
								<input
									type="range"
									min="256"
									max="4096"
									step="256"
									class="w-full"
									value={props.promptSettings.maxTokens || 2048}
									onChange={(e) =>
										props.setPromptSettings({
											...props.promptSettings,
											maxTokens: parseInt(e.currentTarget.value),
										})
									}
								/>
							</div>

							<div>
								<label class="block text-sm font-medium mb-2">
									Instructions système
								</label>
								<textarea
									class="w-full p-3 border rounded-lg h-32"
									placeholder="Instructions personnalisées pour le modèle..."
									value={props.promptSettings.systemPrompt || ""}
									onChange={(e) =>
										props.setPromptSettings({
											...props.promptSettings,
											systemPrompt: e.currentTarget.value,
										})
									}
								></textarea>
							</div>
						</div>
					</div>
				);

			case "appearance":
				return (
					<div class="p-6">
						<h2 class="text-2xl font-bold mb-6">Apparence</h2>

						<div class="space-y-6">
							<div>
								<label class="block text-sm font-medium mb-2">Thème</label>
								<div class="flex space-x-4 mt-2">
									<button class="p-4 bg-white border rounded-lg shadow">
										Clair
									</button>
									<button class="p-4 bg-gray-800 text-white border rounded-lg shadow">
										Sombre
									</button>
									<button class="p-4 bg-gradient-to-r from-blue-100 to-gray-800 border rounded-lg shadow">
										Système
									</button>
								</div>
							</div>

							<div>
								<label class="block text-sm font-medium mb-2">
									Taille de texte
								</label>
								<div class="flex items-center space-x-2">
									<span>A</span>
									<input type="range" min="1" max="5" step="1" class="w-full" />
									<span class="text-xl">A</span>
								</div>
							</div>

							<div>
								<label class="flex items-center space-x-2">
									<input type="checkbox" class="form-checkbox h-5 w-5" />
									<span>Afficher les horodatages</span>
								</label>
							</div>
						</div>
					</div>
				);

			default:
				return (
					<div class="p-6">
						<h2 class="text-2xl font-bold mb-6">Section en construction</h2>
						<p>Cette section n'est pas encore implémentée.</p>
					</div>
				);
		}
	};

	return (
		<>
			<div class="w-64 bg-gray-50 border-r overflow-y-auto">
				<div class="flex items-center justify-between p-4 border-b">
					<h2 class="text-xl font-bold">Paramètres</h2>
					<button
						onClick={() => props.setIsOpen(false)}
						class="p-1 rounded-full hover:bg-gray-200"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M18 6 6 18"></path>
							<path d="m6 6 12 12"></path>
						</svg>
					</button>
				</div>

				<nav class="p-2">
					<For each={items}>
						{(item) => (
							<NavItem
								label={item.label}
								icon={item.icon}
								onClick={() => setActiveSection(item.id)}
								isActive={activeSection() === item.id}
							/>
						)}
					</For>
				</nav>
			</div>

			<div class="w-full overflow-y-auto">{renderContent()}</div>
		</>
	);
};

export default SettingsPanel;
