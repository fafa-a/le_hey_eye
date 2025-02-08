import { Button } from "@/components/ui/button";
import { TextArea } from "@components/ui/textarea";
import {
	TextField,
	TextFieldLabel,
	TextFieldRoot,
} from "@components/ui/textfield";
import { createSignal, Switch, Match, Accessor, Setter } from "solid-js";
import Send from "@components/icons/Send";
import SettingsAdjust from "@components/icons/SettingsAdjust";
import type {
	ChatRequest,
	Message,
	PromptSettings,
	StreamResponse,
} from "../../../types/cloudflare";
import type { CreateMutationResult } from "@tanstack/solid-query";
import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverTitle,
	PopoverTrigger,
} from "../ui/popover";
import type { PopoverTriggerProps } from "@kobalte/core/popover";
import { ComboboxModels } from "./ComboboxModels";
import CustomSwitch from "./Switch";
import SliderComponent from "./Slider";
import { NumberField } from "@components/ui/number-field";
import CustomNumberField from "./CustomNumberField";

interface PromptInputProps {
	onSubmit: (prompt: string) => void;
	mutation: CreateMutationResult<StreamResponse, Error, Message[], unknown>;
	model: Accessor<string>;
	setModel: Setter<string>;
	setPromptSettings: Setter<
		Omit<ChatRequest, "messages" | "functions" | "tools">
	>;
	promptSettings: Accessor<
		Omit<ChatRequest, "messages" | "functions" | "tools">
	>;
}

export function PromptInput({
	onSubmit,
	mutation,
	model,
	setModel,
	setPromptSettings,
	promptSettings,
}: PromptInputProps) {
	const [prompt, setPrompt] = createSignal("");

	const handleSubmit = (e: Event) => {
		e.preventDefault();
		if (prompt().trim()) {
			onSubmit(prompt());
			setPrompt("");
		}
	};

	return (
		<form class="w-[95%] mx-auto flex gap-1 p-2" onSubmit={handleSubmit}>
			<Popover placement="top-start">
				<PopoverTrigger
					as={(props: PopoverTriggerProps) => (
						<Button
							{...props}
							type="button"
							size="sm"
							class="p-2 hover:bg-gray-100 rounded transition-colors hover:cursor-pointer"
						>
							<SettingsAdjust color="black" width="20" height="20" />
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
							<p class="text-sm text-muted-foreground">
								Actual model: {model()}
							</p>
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

			<div class="flex gap-1 border rounded w-full p-0.5">
				<TextFieldRoot class="w-full border-none ">
					<TextArea
						placeholder="Enter a prompt..."
						value={prompt()}
						class="w-full border-none shadow-none resize-none focus:border-none focus-visible:ring-0 py-0"
						onInput={(e) => setPrompt(e.currentTarget.value)}
						onKeyDown={(
							e: KeyboardEvent & { currentTarget: HTMLTextAreaElement },
						) => {
							if (e.ctrlKey && e.key === "Enter") {
								e.preventDefault();
								e.currentTarget.form?.requestSubmit();
							}
						}}
					/>
				</TextFieldRoot>
				<Button
					type="submit"
					disabled={mutation.isPending || !prompt().trim()}
					size="sm"
					class="bg-purple-400 text-white rounded disabled:bg-purple-300 hover:bg-purple-500 transition-colors"
				>
					<Switch>
						<Match when={mutation.isPending}>
							<div class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
						</Match>
						<Match when={!mutation.isPending}>
							<Send
								color="black"
								width="20"
								height="20"
								class="hover:cursor-pointer"
							/>
						</Match>
					</Switch>
				</Button>
			</div>
		</form>
	);
}
