import { PROVIDER_CONFIGURATION } from "@/features/credentials/constants/provider.configuration";
import { createEffect, createSignal, Match, Switch } from "solid-js";
import type { ModelSettings } from "../../credentials/types/provider.types";
import SliderComponent from "@/components/common/slider";
import CustomSwitch from "@/components/common/switch";
import { TextField, TextFieldLabel } from "@/components/ui/text-field";

interface ProviderFormProps {
	provider: string;
}

const ProviderModelSettings = (props: ProviderFormProps) => {
	const [providerModelSettings, setProviderModelSettings] =
		createSignal<ModelSettings | null>(null);

	createEffect(() => {
		const settings = PROVIDER_CONFIGURATION.find(
			(config) => config.id === props.provider?.toLowerCase(),
		)?.settings;
		setProviderModelSettings(settings || null);
	});

	return (
		<Switch>
			<Match when={providerModelSettings() === null}>
				<div>No model settings</div>
			</Match>
			<Match when={providerModelSettings() !== null}>
				<div class="flex flex-col gap-1 p-2">
					<TextField class="grid grid-cols-3 items-center gap-4">
						<TextFieldLabel class="text-right">Stream</TextFieldLabel>
						<CustomSwitch
							onChange={(value) => {
								setProviderModelSettings((prev) => ({
									...prev,
									stream: !!value,
								}));
							}}
							value={providerModelSettings()?.stream}
						/>
					</TextField>
					<TextField class="grid grid-cols-3 items-center gap-4">
						<TextFieldLabel class="text-right">Max. tokens</TextFieldLabel>
						<div class="col-span-2 h-8">
							<SliderComponent
								value={providerModelSettings()?.max_tokens}
								onChange={(value) => {
									setProviderModelSettings((prev) => ({
										...prev,
										max_tokens: +value,
									}));
								}}
								minValue={256}
								maxValue={8192}
							/>
						</div>
					</TextField>
					<TextField class="grid grid-cols-3 items-center gap-4">
						<TextFieldLabel class="text-right">Temperature</TextFieldLabel>
						<div class="col-span-2 h-8">
							<SliderComponent
								value={providerModelSettings()?.temperature ?? 0.6}
								onChange={(value) => {
									setProviderModelSettings((prev) => ({
										...prev,
										temperature: +value,
									}));
								}}
								minValue={0.0}
								maxValue={1}
								step={0.1}
							/>
						</div>
					</TextField>
					<TextField class="grid grid-cols-3 items-center gap-4">
						<TextFieldLabel class="text-right">Top p</TextFieldLabel>
						<div class="col-span-2 h-8">
							<SliderComponent
								value={providerModelSettings()?.top_p ?? 0.1}
								onChange={(value) => {
									setProviderModelSettings((prev) => ({
										...prev,
										top_p: +value,
									}));
								}}
								minValue={0}
								maxValue={2}
								step={0.1}
							/>
						</div>
					</TextField>
					<TextField class="grid grid-cols-3 items-center gap-4">
						<TextFieldLabel class="text-right">Top k</TextFieldLabel>
						<div class="col-span-2 h-8">
							<SliderComponent
								value={providerModelSettings()?.top_k ?? 1}
								onChange={(value) => {
									setProviderModelSettings((prev) => ({
										...prev,
										top_k: +value,
									}));
								}}
								minValue={1}
								maxValue={50}
							/>
						</div>
					</TextField>
				</div>
			</Match>
		</Switch>
	);
};

export default ProviderModelSettings;
