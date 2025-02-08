import type { PopoverTriggerProps } from "@kobalte/core/popover";
import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverTitle,
	PopoverTrigger,
} from "../ui/popover";
import { Button } from "../ui/button";
import SettingsAdjust from "../icons/SettingsAdjust";
import type { ChatRequest } from "types/cloudflare";
import type { Accessor, Setter } from "solid-js";
import { ComboboxModels } from "./ComboboxModels";
import { TextField, TextFieldLabel, TextFieldRoot } from "../ui/textfield";
import CustomSwitch from "./Switch";
import SliderComponent from "./Slider";

interface SettingsPopoverProps {
	model: Accessor<string>;
	setModel: Setter<string>;
	promptSettings: Accessor<
		Omit<ChatRequest, "messages" | "functions" | "tools">
	>;
	setPromptSettings: Setter<
		Omit<ChatRequest, "messages" | "functions" | "tools">
	>;
}

const SettingsPopover = ({
	model,
	setModel,
	promptSettings,
	setPromptSettings,
}: SettingsPopoverProps) => {
	return (
		<Popover placement="left">
			<PopoverTrigger
				as={(props: PopoverTriggerProps) => (
					<Button
						{...props}
						type="button"
						class="p-2 hover:bg-gray-100 rounded transition-colors hover:cursor-pointer"
					>
						<SettingsAdjust class="text-slate-500" width="20" height="20" />
					</Button>
				)}
			/>
			<PopoverContent class="w-[450px] bg-white">
				<div class="grid gap-4">
					<PopoverTitle class="space-y-2">
						<h4 class="font-medium leading-none">Chat Settings</h4>
						<p class="text-sm text-muted-foreground">
							Settings for the model you are using.
						</p>
						<p class="text-sm text-muted-foreground">Actual model: {model()}</p>
					</PopoverTitle>
					<PopoverDescription class="grid gap-2">
						<ComboboxModels setModel={setModel} />
						<TextFieldRoot class="grid grid-cols-3 items-center gap-4">
							<TextFieldLabel class="text-right">Stream</TextFieldLabel>
							<CustomSwitch
								onChange={(value) => {
									setPromptSettings((prev) => ({
										...prev,
										stream: !!value,
									}));
								}}
								value={promptSettings().stream ?? false}
							/>
						</TextFieldRoot>
						<TextFieldRoot class="grid grid-cols-3 items-center gap-4">
							<TextFieldLabel class="text-right">Max. tokens</TextFieldLabel>
							<div class="col-span-2 h-8">
								<SliderComponent
									value={promptSettings().max_tokens ?? 256}
									onChange={(value) => {
										setPromptSettings((prev) => ({
											...prev,
											max_tokens: +value,
										}));
									}}
									minValue={256}
									maxValue={8192}
								/>
							</div>
						</TextFieldRoot>
						<TextFieldRoot class="grid grid-cols-3 items-center gap-4">
							<TextFieldLabel class="text-right">Temperature</TextFieldLabel>
							<div class="col-span-2 h-8">
								<SliderComponent
									value={promptSettings().temperature ?? 0.6}
									onChange={(value) => {
										setPromptSettings((prev) => ({
											...prev,
											temperature: +value,
										}));
									}}
									minValue={0.6}
									maxValue={5}
									step={0.1}
								/>
							</div>
						</TextFieldRoot>
						<TextFieldRoot class="grid grid-cols-3 items-center gap-4">
							<TextFieldLabel class="text-right">Top p</TextFieldLabel>
							<div class="col-span-2 h-8">
								<SliderComponent
									value={promptSettings().top_p ?? 0.1}
									onChange={(value) => {
										setPromptSettings((prev) => ({
											...prev,
											top_p: +value,
										}));
									}}
									minValue={0}
									maxValue={2}
									step={0.1}
								/>
							</div>
						</TextFieldRoot>
						<TextFieldRoot class="grid grid-cols-3 items-center gap-4">
							<TextFieldLabel class="text-right">Top k</TextFieldLabel>
							<div class="col-span-2 h-8">
								<SliderComponent
									value={promptSettings().top_k ?? 1}
									onChange={(value) => {
										setPromptSettings((prev) => ({
											...prev,
											top_k: +value,
										}));
									}}
									minValue={1}
									maxValue={50}
								/>
							</div>
						</TextFieldRoot>
						<TextFieldRoot class="grid grid-cols-3 items-center gap-4">
							<TextFieldLabel class="text-right">Seed</TextFieldLabel>
							<div class="col-span-2 h-8">
								<SliderComponent
									value={promptSettings().seed ?? 1}
									onChange={(value) => {
										setPromptSettings((prev) => ({
											...prev,
											seed: +value,
										}));
									}}
									minValue={1}
									maxValue={9999999999}
									step={10}
								/>
							</div>
						</TextFieldRoot>
						<TextFieldRoot class="grid grid-cols-3 items-center gap-4">
							<TextFieldLabel class="text-right">
								Repetition penalty
							</TextFieldLabel>
							<div class="col-span-2 h-8">
								<SliderComponent
									value={promptSettings().repetition_penalty ?? 0}
									onChange={(value) => {
										setPromptSettings((prev) => ({
											...prev,
											repetition_penalty: +value,
										}));
									}}
									minValue={0}
									maxValue={2}
									step={0.1}
								/>
							</div>
						</TextFieldRoot>
						<TextFieldRoot class="grid grid-cols-3 items-center gap-4">
							<TextFieldLabel class="text-right">
								Frequency penalty
							</TextFieldLabel>
							<div class="col-span-2 h-8">
								<SliderComponent
									value={promptSettings().frequency_penalty ?? 0}
									onChange={(value) => {
										setPromptSettings((prev) => ({
											...prev,
											frequency_penalty: +value,
										}));
									}}
									minValue={0}
									maxValue={2}
									step={0.1}
								/>
							</div>{" "}
						</TextFieldRoot>
						<TextFieldRoot class="grid grid-cols-3 items-center gap-4">
							<TextFieldLabel class="text-right">
								Presence penalty
							</TextFieldLabel>
							<div class="col-span-2 h-8">
								<SliderComponent
									value={promptSettings().presence_penalty ?? 0}
									onChange={(value) => {
										setPromptSettings((prev) => ({
											...prev,
											presence_penalty: +value,
										}));
									}}
									minValue={0}
									maxValue={2}
									step={0.1}
								/>
							</div>
						</TextFieldRoot>
						<TextFieldRoot class="grid grid-cols-3 items-center gap-4">
							<TextFieldLabel class="text-right">Lora</TextFieldLabel>
							<TextField
								value={promptSettings().lora ?? ""}
								class="col-span-2 h-8"
								onInput={(e) =>
									setPromptSettings((prev) => ({
										...prev,
										lora: e.currentTarget.value,
									}))
								}
							/>
						</TextFieldRoot>
					</PopoverDescription>
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default SettingsPopover;
