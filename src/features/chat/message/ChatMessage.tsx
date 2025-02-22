import { SolidMarkdown } from "solid-markdown";
import type { Message, MessageRole } from "../../../../types/cloudflare";
import { Button } from "@components/ui/button";
import Edit from "@icons/Edit";
import Copy from "@icons/Copy";
import Delete from "@icons/Trash";
import Regenerate from "@icons/Reset";
import { createEffect } from "solid-js";
import Markdown from "@/components/common/Markdown";

interface ChatMessageToolbarProps {
	role: MessageRole;
}

const ChatMessageToolbar = ({ role }: ChatMessageToolbarProps) => {
	switch (role) {
		case "user":
			return (
				<div class="flex">
					<Button size="xs" variant="ghost">
						<Edit />
					</Button>
					<Button size="xs" variant="ghost">
						<Copy />
					</Button>
					<Button size="xs" variant="ghost">
						<Delete />
					</Button>
				</div>
			);
		case "assistant":
			return (
				<div class="flex">
					<Button size="xs" variant="ghost">
						<Regenerate />
					</Button>
					<Button size="xs" variant="ghost">
						<Copy />
					</Button>
				</div>
			);
	}
};

interface ChatMessageFooterProps {
	role: MessageRole;
	tokens_used: number | undefined;
}

const ChatMessageFooter = ({ role, tokens_used }: ChatMessageFooterProps) => {
	const time = new Date();
	const options: Intl.DateTimeFormatOptions = {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	};

	const formattedTime = new Intl.DateTimeFormat(undefined, options).format(
		time,
	);

	return (
		<div class="flex items-center gap-2 mb-2">
			<ChatMessageToolbar role={role} />
			<span class="text-xs text-gray-300">{formattedTime}</span>
			{role === "assistant" && tokens_used && (
				<span class="text-xs text-gray-300">{tokens_used} tokens used</span>
			)}
		</div>
	);
};

interface ChatMessageProps {
	message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
	createEffect(() => {
		console.log("message: ", message);
	});
	return (
		<div class="flex flex-col gap-1 w-full overflow-scroll">
			<div
				class="flex w-full"
				classList={{
					"justify-end": message.role === "user",
					"justify-start": message.role === "assistant",
				}}
			>
				<div
					class="p-1 rounded flex flex-col"
					classList={{
						"bg-slate-50": message.role === "user",
					}}
				>
					<div class="w-full min-w-0 overflow-hidden">
						<Markdown>{message.content}</Markdown>
					</div>
					<ChatMessageFooter
						role={message.role}
						tokens_used={message.tokens_used}
					/>
				</div>
			</div>
		</div>
	);
};

export default ChatMessage;
