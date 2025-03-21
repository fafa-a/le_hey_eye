import { PROVIDER_CONFIGURATION } from "@/features/credentials/constants/provider.configuration";
import {
	type Accessor,
	createEffect,
	createResource,
	createSignal,
	For,
	Match,
	onMount,
	type Setter,
	Show,
	Switch,
} from "solid-js";
import NavItem from "./nav-item";
import ProviderForm from "@/features/credentials/components/provider-credential-form";
import { invoke } from "@tauri-apps/api/core";
import { Skeleton } from "@/components/ui/skeleton";

interface ProviderListProps {
	setProvider: Setter<string>;
	provider: Accessor<string>;
}
const ProviderList = (props: ProviderListProps) => {
	const providerName = () => props.provider();
	return (
		<For each={PROVIDER_CONFIGURATION}>
			{(provider) => (
				<NavItem
					onClick={() => props.setProvider(provider.name)}
					onKeyDown={(e: KeyboardEvent) => {
						if (e.key === "Enter") {
							props.setProvider(provider.name);
						}
					}}
					isActive={providerName() === provider.name}
					icon={provider.icon}
					label={provider.name}
				/>
			)}
		</For>
	);
};

async function fetchModels(provider: string) {
	return await invoke("list_models", { provider });
}

const Providers = () => {
	const [provider, setProvider] = createSignal<string>("Anthropic");
	const [modelsList, setModelsList] = createSignal<string[]>([]);
	const [model, setModel] = createSignal<string>();

	// onMount(() => {
	// 	invoke<string[]>("list_models", {
	// 		provider: provider(),
	// 	}).then((data) => {
	// 		setModelsList(data);
	// 		setModel(data[0]);
	// 	});
	// });

	const [modelsData, { mutate, refetch }] = createResource<string[]>(
		() => provider(),
		fetchModels,
	);

	createEffect(() => {
		if (modelsData.loading) {
			console.log("Chargement des modèles...");
		} else if (modelsData.error) {
			console.error(
				"Erreur lors du chargement des modèles :",
				modelsData.error,
			);
		} else if (modelsData.state === "ready") {
			console.log("Modèles chargés:", modelsData());
			setModelsList(modelsData());
			setModel(modelsData()[0]);
		}
	});

	// createEffect(() => {
	// 	console.log(modelsList());
	// });
	//
	// createEffect(() => {
	// 	console.log(model());
	// });
	//
	return (
		<div class="w-full h-full flex">
			<div class="w-2/5 p-2">
				<h2 class="text-2xl font-bold mb-6">Providers</h2>
				<ProviderList setProvider={setProvider} provider={provider} />
				<h2 class="text-2xl font-bold mt-6 mb-2">Models</h2>
				<Switch>
					<Match when={modelsData.loading}>
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
					<Match when={modelsData.error}>
						<div class="rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500">
							An error occurred: {modelsData.error}
						</div>
					</Match>
					<Match when={modelsList().length > 0}>
						<For each={modelsList()}>
							{(modelName) => (
								<NavItem
									label={modelName}
									isActive={modelName === model()}
									onClick={() => setModel(modelName)}
								/>
							)}
						</For>
					</Match>
				</Switch>
			</div>
			<div class="w-3/5 p-2">
				<h2 class="text-2xl font-bold mb-6">Model Settings</h2>
				<ProviderForm provider={provider()} />
			</div>
		</div>
	);
};

export default Providers;
