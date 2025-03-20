import { PROVIDER_CONFIGURATION } from "@features/credentials/constants/provider.configuration";
import { createSignal, createEffect, type Setter } from "solid-js";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import ProviderOptions from "./provider-options";
import type { Provider } from "types/core";

interface SelectProps {
	provider: Provider | (() => Provider);
	setProvider: Setter<Provider>;
}

const ProviderSelector = (props: SelectProps) => {
	const [options, setOptions] = createSignal<string[]>([]);

	const getCurrentProvider = () => {
		return typeof props.provider === "function"
			? props.provider()
			: props.provider;
	};

	createEffect(() => {
		setOptions(PROVIDER_CONFIGURATION.map((provider) => provider.name));
	});

	return (
		<Select
			options={options()}
			defaultValue={getCurrentProvider()}
			itemComponent={(props) => (
				<SelectItem item={props.item}>
					<ProviderOptions
						label={props.item.rawValue}
						iconSrc={
							PROVIDER_CONFIGURATION.find(
								(provider) => provider.name === props.item.rawValue,
							)?.icon ?? ""
						}
					/>
				</SelectItem>
			)}
		>
			<SelectTrigger>
				<SelectValue<string>>
					{(state) => {
						props.setProvider(state.selectedOption() as Provider);
						return state.selectedOption();
					}}
				</SelectValue>
			</SelectTrigger>
			<SelectContent />
		</Select>
	);
};

export default ProviderSelector;
