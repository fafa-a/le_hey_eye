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
import TestProviderForm from "@/features/credentials/components/TestProviderForm";

const GeneralSettings = () => {
	const [provider, setProvider] = createSignal<Provider>("Cloudflare");

	createEffect(() => {
		console.log("provider", provider());
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
					<TestProviderForm provider={provider()} />
				</div>
			</SheetContent>
		</Sheet>
	);
};

export default GeneralSettings;
