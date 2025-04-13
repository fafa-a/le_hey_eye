import { PROVIDER_CONFIGURATION } from "@/features/credentials/constants/provider.configuration";
import SliderComponent from "@/components/common/slider";
import CustomSwitch from "@/components/common/switch";
import { TextField, TextFieldLabel } from "@/components/ui/text-field";
import { useGlobalContext } from "@/context/global-context";

interface ProviderFormProps {
	provider: string;
}

const ProviderModelSettings = (props: ProviderFormProps) => {
	const { currentModelSettings, setStream, setMaxTokens, setTemperature } =
		useGlobalContext().modelSettings;

	const providerModelSettings = PROVIDER_CONFIGURATION.filter(
		(config) => config.id === props.provider.toLowerCase(),
	).map((config) => config.settings)[0];

	return (
		<div class="flex flex-col gap-1 p-2">
			<TextField class="grid grid-cols-3 items-center gap-4">
				<TextFieldLabel class="text-right">Stream</TextFieldLabel>
				<CustomSwitch
					onChange={(value) => {
						setStream(!!value);
					}}
					value={currentModelSettings.stream || providerModelSettings.stream}
				/>
			</TextField>
			<TextField class="grid grid-cols-3 items-center gap-4">
				<TextFieldLabel class="text-right">Max. tokens</TextFieldLabel>
				<div class="col-span-2 h-8">
					<SliderComponent
						value={
							currentModelSettings.maxTokens || providerModelSettings.maxTokens
						}
						onChange={(value: number[]) => {
							setMaxTokens(value[0] as number);
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
						value={
							currentModelSettings.temperature ||
							providerModelSettings.temperature
						}
						onChange={(value: number[]) => {
							setTemperature(value[0] as number);
						}}
						minValue={0.0}
						maxValue={1}
						step={0.1}
					/>
				</div>
			</TextField>
		</div>
	);
};

export default ProviderModelSettings;
