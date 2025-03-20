import Settings from "@icons/settings";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import ProviderSelector from "@/features/credentials/components/provider-selector";
import { type Accessor, createSignal, type Setter } from "solid-js";
import type { Provider } from "types/core";
import ProviderForm from "@/features/credentials/components/provider-form";

interface GeneralSettingsProps {
	setCurrentProvider: Setter<Provider>;
	currentProvider: Accessor<Provider>;
}
const GeneralSettings = (props: GeneralSettingsProps) => {
	const [providerCredentials, setProviderCredentials] =
		createSignal<Provider>("Cloudflare");

	// createEffect(() => {
	// 	console.log("provider", providerCredentials());
	// 	invoke("has_credentials", {
	// 		provider: providerCredentials(),
	// 	}).then(console.log);
	// });

	// createEffect(async () => {
	// 	const store = await load("credentials.json");
	// 	const cloudflare = await store.get("CLOUDFLARE_CREDENTIALS");
	// 	const anthropic = await store.get("ANTHROPIC_CREDENTIALS");
	// 	console.log({ cloudflare, anthropic });
	// });

	return (
		<Sheet>
			<SheetTrigger>
				<Settings width={20} height={20} />
			</SheetTrigger>
			<SheetContent side="left">
				<SheetHeader>
					<SheetTitle>General Settings</SheetTitle>
					<SheetDescription>Configure settings</SheetDescription>
				</SheetHeader>
				<h3 class="text-xl font-semibold">Current Provider</h3>
				<ProviderSelector
					setProvider={props.setCurrentProvider}
					provider={props.currentProvider}
				/>

				<h3 class="text-xl font-semibold">Credentials Provider</h3>
				<div class="flex flex-col gap-2">
					<ProviderSelector
						setProvider={setProviderCredentials}
						provider={providerCredentials()}
					/>
					<ProviderForm provider={providerCredentials()} />
				</div>
			</SheetContent>
		</Sheet>
	);
};

export default GeneralSettings;
