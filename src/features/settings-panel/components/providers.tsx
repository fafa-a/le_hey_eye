import { PROVIDER_CONFIGURATION } from "@/features/credentials/constants/provider.configuration";
import {
	type Accessor,
	createEffect,
	createResource,
	createSignal,
	For,
	Match,
	type Resource,
	type Setter,
	Switch,
} from "solid-js";
import NavItem from "./nav-item";
import ProviderCredentialForm from "@/features/credentials/components/provider-credential-form";
import { invoke } from "@tauri-apps/api/core";
import ProviderModelSettings from "./model-settings";
import { useGlobalContext } from "@/context/global-context";
import { dbApi, llmApi } from "@shared/api";
import { ProviderType } from "@shared/types";

interface ProviderModelsListProps {
	modelsData: Resource<string[]>;
	modelsList: Accessor<string[]>;
	setModel: (model: string) => void;
	model: string;
}

const ProviderModelsList = (props: ProviderModelsListProps) => {
	console.log("props", props);

	return (
		<div class="h-full overflow-auto">
			<Switch>
				<Match when={props.modelsData.loading}>
					<div class="flex flex-col gap-2">
						<div class="shadow rounded-md p-3 max-w-sm w-full mx-auto">
							<div class="animate-pulse flex">
								<div class="flex-1 space-y-3 py-1">
									<div class="h-2 bg-slate-200 rounded" />
								</div>
							</div>
						</div>
						<div class="shadow rounded-md p-3 max-w-sm w-full mx-auto">
							<div class="animate-pulse flex">
								<div class="flex-1 space-y-3 py-1">
									<div class="h-2 bg-slate-200 rounded" />
								</div>
							</div>
						</div>
						<div class="shadow rounded-md p-3 max-w-sm w-full mx-auto">
							<div class="animate-pulse flex ">
								<div class="flex-1 space-y-3 py-1">
									<div class="h-2 bg-slate-200 rounded" />
								</div>
							</div>
						</div>
					</div>
				</Match>
				<Match when={props.modelsData.error}>
					<div class="rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500">
						An error occurred: {props.modelsData.error}
					</div>
				</Match>
				<Match when={props.modelsList().length > 0}>
					<For each={props.modelsList()}>
						{(modelName) => (
							<NavItem
								label={modelName}
								isActive={modelName === props.model}
								onClick={() => props.setModel(modelName)}
							/>
						)}
					</For>
				</Match>
			</Switch>
		</div>
	);
};

interface ProviderListProps {
	setProvider: (provider: ProviderType) => void;
	provider: string;
}

const ProviderList = (props: ProviderListProps) => {
	return (
		<For each={PROVIDER_CONFIGURATION}>
			{(provider) => (
				<NavItem
					onClick={() => props.setProvider(provider.name as ProviderType)}
					onKeyDown={(e: KeyboardEvent) => {
						if (e.key === "Enter") {
							props.setProvider(provider.name as ProviderType);
						}
					}}
					isActive={props.provider === provider.name}
					icon={provider.icon}
					label={provider.name}
				/>
			)}
		</For>
	);
};

async function fetchModels(provider: ProviderType) {
	return llmApi.listModels(provider);
}

const Providers = () => {
	const [modelsList, setModelsList] = createSignal<string[]>([]);
	const { setProvider, setModelName, currentModelSettings } =
		useGlobalContext().modelSettings;

	const [modelsData] = createResource(
		() => currentModelSettings.provider,
		fetchModels,
	);

	createEffect(() => {
		if (modelsData.loading) {
			console.log("Models loading...");
		} else if (modelsData.error) {
			console.error("Error while loading models:", modelsData.error);
		} else if (modelsData.state === "ready") {
			console.log("Models loaded:", modelsData());
			setModelsList(modelsData());
		}
	});

	return (
		<>
			<div class="p-2">
				<h2 class="text-2xl font-bold mb-4">Providers</h2>
				<ProviderList
					setProvider={setProvider}
					provider={currentModelSettings.provider}
				/>
			</div>

			<div class="p-2">
				<h2 class="text-2xl font-bold mb-4">Credentials</h2>
				<ProviderCredentialForm provider={currentModelSettings.provider} />
			</div>

			<div class="p-2">
				<h2 class="text-2xl font-bold mb-4">Models List</h2>
				<ProviderModelsList
					modelsData={modelsData}
					modelsList={modelsList}
					setModel={setModelName}
					model={currentModelSettings.modelName}
				/>
			</div>

			<div class="p-2">
				<h2 class="text-2xl font-bold mb-4">Settings</h2>
				<ProviderModelSettings provider={currentModelSettings.provider} />
			</div>
		</>
	);
};

export default Providers;
