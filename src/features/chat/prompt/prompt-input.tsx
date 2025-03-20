import { Button } from "@/components/ui/button";
import Send from "@components/icons/send";
import { TextArea } from "@components/ui/textarea";
import { TextFieldRoot } from "@components/ui/text-field";
import type { CreateMutationResult } from "@tanstack/solid-query";
import {
	type Accessor,
	Match,
	type Setter,
	Switch,
	createEffect,
	createSignal,
} from "solid-js";
import type { StreamResponse } from "../../../../types/cloudflare";
import type { ChatRequest } from "../../../../types/core";
import type { TopicMessage } from "@/context/topics-context";
import { useTopics } from "@/context/topics-context";
import ModelSettingsPopover from "@features/chat/settings/settings-popover";
import { unwrap } from "solid-js/store";

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
	const pending = () => unwrap(mutation).isPending;
	console.log({ pending });
	const topicId = () => props.topicId;
	const { addMessage } = useTopics();

	const [prompt, setPrompt] = createSignal("");
	let textareaRef: HTMLTextAreaElement | undefined;

	const resetTextareaHeight = () => {
		if (textareaRef) {
			textareaRef.style.height = "auto";
		}
	};

	const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
		textarea.style.height = "auto";
		textarea.style.height = `${textarea.scrollHeight}px`;
	};

	const handleSubmit = (e: Event) => {
		e.preventDefault();
		if (prompt().trim()) {
			onSubmit(prompt());
			const message: Omit<TopicMessage, "id" | "tokensUsed" | "pairId"> = {
				role: "user",
				topicId: topicId(),
				content: prompt(),
				timestamp: new Date(),
			};
			addMessage(message);

			setPrompt("");
			resetTextareaHeight();
		}
	};

	createEffect(() => {
		console.log("PromptInput pending: ", pending());
	});

	return (
		<form class="w-full flex h-full p-3" onSubmit={handleSubmit}>
			<div class="flex gap-1 w-full h-full p-0.5 rounded-lg border border-slate-100 hover:border-slate-300 shadow-md">
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
								<div class="animate-pulse h-4 w-4  rounded-full bg-neutral-500" />
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
