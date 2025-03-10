import { Button } from "@/components/ui/button";
import Send from "@components/icons/Send";
import { TextArea } from "@components/ui/textarea";
import { TextFieldRoot } from "@components/ui/textfield";
import type { CreateMutationResult } from "@tanstack/solid-query";
import {
	type Accessor,
	Match,
	type Setter,
	Switch,
	createSignal,
} from "solid-js";
import type { StreamResponse } from "../../../../types/cloudflare";
import type { ChatRequest } from "../../../../types/core";
import type { TopicMessage } from "@/context/topicsContext";
import { useTopics } from "@/context/topicsContext";
import ModelSettingsPopover from "@features/chat/settings/SettingsPopover";

interface PromptInputProps {
	onSubmit: (prompt: string) => void;
	mutation: CreateMutationResult<
		StreamResponse,
		Error,
		TopicMessage[],
		unknown
	>;
	model: Accessor<string>;
	setModel: Setter<string>;
	setPromptSettings: Setter<
		Omit<ChatRequest, "messages" | "functions" | "tools">
	>;
	promptSettings: Accessor<
		Omit<ChatRequest, "messages" | "functions" | "tools">
	>;
	topicId: string;
}

export function PromptInput(props: PromptInputProps) {
	const { onSubmit, mutation } = props;
	const topicId = () => props.topicId;
	const { addMessage } = useTopics();

	const [prompt, setPrompt] = createSignal("");
	let textareaRef: HTMLTextAreaElement | undefined;

	const resetTextareaHeight = () => {
		if (textareaRef) {
			textareaRef.style.height = "auto";
		}
	};

	// Fonction pour ajuster la hauteur dynamiquement
	const adjustTextareaHeight = (textarea) => {
		textarea.style.height = "auto";
		textarea.style.height = `${textarea.scrollHeight}px`;
	};

	const handleSubmit = (e: Event) => {
		e.preventDefault();
		if (prompt().trim()) {
			onSubmit(prompt());
			const message: Omit<TopicMessage, "id"> = {
				role: "user",
				content: prompt(),
				timestamp: new Date(),
			};
			addMessage(topicId(), message);

			setPrompt("");
			resetTextareaHeight();
		}
	};

	return (
		<form class="w-full flex h-full p-3" onSubmit={handleSubmit}>
			<div class="flex gap-1 w-full h-full p-0.5 rounded-lg border border-slate-100 hover:border-slate-300 shadow-md transition-colors duration-2000 ease-in-out">
				<TextFieldRoot class="w-full h-full border-none">
					<TextArea
						ref={(el) => {
							textareaRef = el;
						}}
						placeholder="Write here..."
						value={prompt()}
						class="w-full min-h-full flex-1 border-none shadow-none resize-none focus:border-none focus-visible:ring-0 py-0"
						onInput={(e) => {
							setPrompt(e.currentTarget.value);
							adjustTextareaHeight(e.currentTarget);
						}}
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
				<div class="flex flex-col">
					<Button
						type="submit"
						disabled={mutation.isPending || !prompt().trim()}
						class="w-[30px] text-white hover:bg-gray-100 hover:cursor-pointer grid place-items-center"
						variant="outline"
					>
						<Switch>
							<Match when={mutation.isPending}>
								<div class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
							</Match>
							<Match when={!mutation.isPending}>
								<Send width={20} height={20} class="text-slate-500" />
							</Match>
						</Switch>
					</Button>
					<ModelSettingsPopover
						model={props.model}
						setModel={props.setModel}
						promptSettings={props.promptSettings}
						setPromptSettings={props.setPromptSettings}
					/>
				</div>
			</div>
		</form>
	);
}
