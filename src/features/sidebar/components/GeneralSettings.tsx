import Settings from "@icons/Settings";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import ProviderSelector from "@features/credentials/components/ProviderSelector";
import { createEffect, createSignal } from "solid-js";
import type { Provider } from "types/core";
import ProviderForm from "@/features/credentials/components/ProviderForm";
import { load } from "@tauri-apps/plugin-store";
import { invoke } from "@tauri-apps/api/core";

const GeneralSettings = () => {
	const [provider, setProvider] = createSignal<Provider>("Cloudflare");

	createEffect(() => {
		console.log("provider", provider());
		invoke("has_credentials", {
			provider: provider(),
		}).then(console.log);
	});

	createEffect(async () => {
		const store = await load("credentials.json");
		const cloudflare = await store.get("CLOUDFLARE_CREDENTIALS");
		const anthropic = await store.get("ANTHROPIC_CREDENTIALS");
		console.log({ cloudflare, anthropic });
	});
	return (
		<Sheet>
			<SheetTrigger>
				<Settings width={20} height={20} />
			</SheetTrigger>
			<SheetContent side="left">
				<SheetHeader>
					<SheetTitle>General Settings</SheetTitle>
					<SheetDescription>Configure your chat provider</SheetDescription>
				</SheetHeader>
				<div class="flex flex-col gap-2">
					<ProviderSelector setProvider={setProvider} provider={provider()} />
					<ProviderForm provider={provider()} />
				</div>
			</SheetContent>
		</Sheet>
	);
};

export default GeneralSettings;
