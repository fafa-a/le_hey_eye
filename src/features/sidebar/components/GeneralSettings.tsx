import { Button } from "@components/ui/button";
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
					<SheetTitle>Are you sure absolutely sure?</SheetTitle>
					<SheetDescription>
						This action cannot be undone. This will permanently delete your
						account and remove your data from our servers.
					</SheetDescription>
				</SheetHeader>
				<ProviderSelector setProvider={setProvider} provider={provider()} />
				<ProviderForm provider={provider()} />
			</SheetContent>
		</Sheet>
	);
};

export default GeneralSettings;
