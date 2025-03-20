import { Switch, SwitchControl, SwitchThumb } from "@/components/ui/switch";
import { createSignal, type Setter } from "solid-js";

interface SwitchProps {
	onChange: Setter<boolean>;
	value: boolean;
}

function CustomSwitch({ onChange, value }: SwitchProps) {
	const [checked, setChecked] = createSignal(value);

	const handleChange = () => {
		setChecked(!checked());
		onChange(checked());
	};

	return (
		<Switch onChange={handleChange} checked={checked()}>
			<SwitchControl
				classList={{
					"bg-slate-600": checked(),
					"bg-slate-200": !checked(),
				}}
			>
				<SwitchThumb class="bg-white" />
			</SwitchControl>
		</Switch>
	);
}

export default CustomSwitch;
