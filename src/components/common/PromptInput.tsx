import { Button } from "@/components/ui/button";
import { TextArea } from "@components/ui/textarea";
import { TextFieldRoot } from "@components/ui/textfield";
import { createSignal, Switch, Match } from "solid-js";
import Send from "@components/icons/Send";
import SettingsAdjust from "@components/icons/SettingsAdjust";
import { ChatInput, CloudflareResponse } from "../../../types/cloudflare";
import { CreateMutationResult } from "@tanstack/solid-query";

interface PromptInputProps {
	onSubmit: (prompt: string) => void;
	mutation: CreateMutationResult<CloudflareResponse, Error, ChatInput, unknown>;
	onSettingsClick?: () => void;
}

export function PromptInput({
	onSubmit,
	onSettingsClick,
	mutation,
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
		<form class="w-4xl max-w-5xl  mx-auto" onSubmit={handleSubmit}>
			<div class="flex items-center gap-2 p-2 border rounded resize-none">
				<TextFieldRoot class="w-full">
					<TextArea
						rows={2}
						placeholder="Enter a prompt..."
						value={prompt()}
						class="w-full border-none shadow-none resize-none"
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
				<div class="flex flex-col gap-2">
					<Button
						type="submit"
						variant="outline"
						disabled={mutation.isPending || !prompt().trim()}
						class="px-4 py-2 bg-purple-400 text-white rounded disabled:bg-purple-300 hover:bg-purple-500 transition-colors"
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

					<Button
						type="button"
						variant="outline"
						onClick={onSettingsClick}
						class="p-2 hover:bg-gray-100 rounded transition-colors hover:cursor-pointer"
					>
						<SettingsAdjust color="black" width="20" height="20" />
					</Button>
				</div>
			</div>
		</form>
	);
}
