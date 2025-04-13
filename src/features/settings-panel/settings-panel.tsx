import { type Component, createSignal, For } from "solid-js";
import NavItem from "./components/nav-item";
import Providers from "./components/providers";
import CarbonClose from "@/components/icons/close";
import { Button } from "@/components/ui/button";

interface SettingsPanelProps {
	setIsOpen: (isOpen: boolean) => void;
}

const items = [
	{ id: "providers", label: "Providers" },
	// { id: "preference", label: "Preference" },
	// { id: "profile", label: "Profile" },
	// { id: "prompt", label: "Default Prompt" },
];

const SettingsPanel: Component<SettingsPanelProps> = (props) => {
	const [activeSection, setActiveSection] = createSignal("providers");

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
		<div class="grid grid-cols-[200px_1fr] h-full">
			<div class="bg-neutral-50 border-r p-4">
				<div class="flex items-center justify-between border-b p-2">
					<h2 class="text-xl font-bold">Settings</h2>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => props.setIsOpen(false)}
					>
						<CarbonClose width={16} height={16} />
					</Button>
				</div>
				<nav class="mt-4">
					<NavItem label="Providers" isActive={true} />
				</nav>
			</div>

			<div class="grid grid-rows-[30%_auto] grid-cols-[2fr_3fr] gap-1 p-1">
				<Providers />
			</div>
		</div>
	);
};

export default SettingsPanel;
