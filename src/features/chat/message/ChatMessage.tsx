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
const DeleteButton = ({
	onDelete,
	pairId,
}: { onDelete: () => void; pairId: string }) => {
	const { setHighlightedMessagePair } = useTopics();
	return (
		<Button
			size="xs"
			variant="ghost"
			onClick={onDelete}
			class="hover:bg-red-100"
			onMouseEnter={() => setHighlightedMessagePair(pairId)}
			onMouseLeave={() => setHighlightedMessagePair(null)}
		>
			<Delete />
		</Button>
	);
};

interface ChatMessageToolbarProps {
	role: MessageRole;
	onDelete: () => void;
	pairId: string;
}

const ChatMessageToolbar = ({
	role,
	onDelete,
	pairId,
}: ChatMessageToolbarProps) => {
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
					<DeleteButton onDelete={onDelete} pairId={pairId} />
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
					<DeleteButton onDelete={onDelete} pairId={pairId} />
				</div>
			);
	}
};

interface ChatMessageFooterProps {
	role: MessageRole;
	tokensUsed: number | undefined;
	messageId: string;
	pairId: string;
}

const ChatMessageFooter = ({
	role,
	tokensUsed,
	messageId,
	pairId,
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
				pairId={pairId}
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
	const { highlightedMessagePair } = useTopics();

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
					class="p-1 rounded flex flex-col transition-all duration-300 ease-in-out"
					classList={{
						"bg-neutral-100": message.role === "user",
						"min-w-[80%] flex-grow-0 flex-shrink-1":
							message.role === "assistant",
						"bg-red-50 shadow-md shadow-red-300 ":
							message.pairId === highlightedMessagePair(),
					}}
				>
					<div class="min-w-0">
						<Markdown>{message.content}</Markdown>
					</div>
					<ChatMessageFooter
						role={message.role}
						tokensUsed={message.tokensUsed || 0}
						messageId={message.id}
						pairId={message.pairId}
					/>
				</div>
			</div>
		</div>
	);
};

export default ChatMessage;
