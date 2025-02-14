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
	createEffect,
	createSignal,
} from "solid-js";
import type {
	ChatRequest,
	Message,
	StreamResponse,
} from "../../../../types/cloudflare";
import { addMessage, type TopicMessage } from "../store/messageStore";

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
	topicId: string;
}

export function PromptInput(props: PromptInputProps) {
	const { onSubmit, mutation } = props;
	const topicId = () => props.topicId;

	createEffect(() => {
		console.log("topicId: ", topicId());
	});

	const [prompt, setPrompt] = createSignal("");

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
		}
	};

	return (
		<form class="w-full flex" onSubmit={handleSubmit}>
			<div class="flex gap-1 w-full p-0.5 border-t border-slate-50 hover:border-slate-200 transition-colors duration-2000 ease-in-out">
				<TextFieldRoot class="w-full border-none ">
					<TextArea
						placeholder="Write here..."
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
			</div>
		</form>
	);
}
