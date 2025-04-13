import { Slider } from "@kobalte/core/slider";

interface SliderProps {
	label?: string;
	onChange: (value: number[]) => void;
	value: number;
	minValue?: number;
	maxValue?: number;
	step?: number;
}

function SliderComponent({
	label,
	onChange,
	value,
	minValue = 0,
	maxValue = 100,
	step = 1,
}: SliderProps) {
	return (
		<Slider
			class="relative flex flex-col items-center select-none touch-none w-full"
			defaultValue={[value]}
			onChange={onChange}
			minValue={minValue}
			maxValue={maxValue}
			step={step}
		>
			<div
				class="w-full flex"
				classList={{
					"justify-between": !!label,
					"justify-end": !label,
				}}
			>
				{label && <Slider.Label>{label}</Slider.Label>}
				<Slider.ValueLabel class="text-xs pb-0.5" />
			</div>
			<Slider.Track class="relative w-full h-2 bg-gray-300 rounded-full">
				<Slider.Fill class="absolute h-full bg-slate-600 rounded-full" />
				<Slider.Thumb class="block w-4 h-4 bg-slate-600 rounded-full -top-1 hover:shadow-[0_0_0_5px_#cad5e2] focus:outline-none focus:shadow-[0_0_0_5px_#cad5e2]">
					<Slider.Input />
				</Slider.Thumb>
			</Slider.Track>
		</Slider>
	);
}

export default SliderComponent;
