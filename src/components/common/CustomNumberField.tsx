import {
	NumberField,
	NumberFieldDecrementTrigger,
	NumberFieldGroup,
	NumberFieldIncrementTrigger,
	NumberFieldInput,
	NumberFieldLabel,
} from "@components/ui/number-field";
import type { Setter } from "solid-js";
interface CustomNumberFieldProps {
	value: number;
	onChange: Setter<number>;
	minValue?: number;
	maxValue?: number;
	label?: string;
}
const CustomNumberField = ({
	value,
	onChange,
	minValue,
	maxValue,
	label,
}: CustomNumberFieldProps) => {
	return (
		<NumberField
			defaultValue={value}
			minValue={minValue}
			maxValue={maxValue}
			onChange={onChange}
			class="w-full"
		>
			{label && <NumberFieldLabel>{label}</NumberFieldLabel>}
			<NumberFieldGroup>
				<NumberFieldDecrementTrigger aria-label="Decrement" />
				<NumberFieldInput />
				<NumberFieldIncrementTrigger aria-label="Increment" />
			</NumberFieldGroup>
		</NumberField>
	);
};

export default CustomNumberField;
