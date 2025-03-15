import type { MessageRole } from "../../../../types/cloudflare";
import { Button } from "@components/ui/button";
import Edit from "@icons/Edit";
import Copy from "@icons/Copy";
import Delete from "@icons/Trash";
import Regenerate from "@icons/Reset";
import { createEffect } from "solid-js";
import Markdown from "@/components/common/Markdown";
import { useTopics } from "@/context/topicsContext";
import type { TopicMessage } from "../../../../types/core";

interface ChatMessageToolbarProps {
	role: MessageRole;
	onDelete: () => void;
}

const ChatMessageToolbar = ({ role, onDelete }: ChatMessageToolbarProps) => {
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
					<Button size="xs" variant="ghost" onClick={onDelete}>
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
					<Button size="xs" variant="ghost" onClick={onDelete}>
						<Delete />
					</Button>
				</div>
			);
	}
};

interface ChatMessageFooterProps {
	role: MessageRole;
	tokensUsed: number | undefined;
	messageId: string;
}

const ChatMessageFooter = ({
	role,
	tokensUsed,
	messageId,
}: ChatMessageFooterProps) => {
	const time = new Date();
	const options: Intl.DateTimeFormatOptions = {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	};

	const formattedTime = new Intl.DateTimeFormat(undefined, options).format(
		time,
	);
	const { removeMessage } = useTopics();

	return (
		<div class="flex items-center gap-2 mb-2">
			<ChatMessageToolbar
				role={role}
				onDelete={() => removeMessage(messageId)}
			/>
			<span class="text-xs text-gray-300">{formattedTime}</span>
			{role === "assistant" && tokensUsed && (
				<span class="text-xs text-gray-300">{tokensUsed} tokens used</span>
			)}
		</div>
	);
};

interface ChatMessageProps {
	message: TopicMessage;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
	createEffect(() => {
		console.log("message: ", message);
	});
	return (
		<div class="flex flex-col gap-1 w-full">
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
						"bg-neutral-100": message.role === "user",
						"min-w-[80%] flex-grow-0 flex-shrink-1":
							message.role === "assistant",
					}}
				>
					<div class="min-w-0">
						<Markdown>{message.content}</Markdown>
					</div>
					<ChatMessageFooter
						role={message.role}
						tokensUsed={message.tokensUsed || 0}
						messageId={message.id}
					/>
				</div>
			</div>
		</div>
	);
};

export default ChatMessage;
