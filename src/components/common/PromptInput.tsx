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
import type { Message, StreamResponse } from "../../../types/cloudflare";
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

interface PromptInputProps {
	onSubmit: (prompt: string) => void;
	mutation: CreateMutationResult<StreamResponse, Error, Message[], unknown>;
	model: Accessor<string>;
	setModel: Setter<string>;
}

export function PromptInput({
	onSubmit,
	mutation,
	model,
	setModel,
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
				<PopoverContent class="w-80 bg-white">
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
								<TextFieldLabel class="text-right">Width</TextFieldLabel>
								<TextField value="100%" class="col-span-2 h-8" />
							</TextFieldRoot>
							<TextFieldRoot class="grid grid-cols-3 items-center gap-4">
								<TextFieldLabel class="text-right">Max. width</TextFieldLabel>
								<TextField value="300px" class="col-span-2 h-8" />
							</TextFieldRoot>
							<TextFieldRoot class="grid grid-cols-3 items-center gap-4">
								<TextFieldLabel class="text-right">Height</TextFieldLabel>
								<TextField value="25px" class="col-span-2 h-8" />
							</TextFieldRoot>
							<TextFieldRoot class="grid grid-cols-3 items-center gap-4">
								<TextFieldLabel class="text-right">Max. height</TextFieldLabel>
								<TextField value="none" class="col-span-2 h-8" />
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
