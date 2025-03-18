import type { MessageRole } from "../../../../types/cloudflare";
import { Button } from "@components/ui/button";
import Edit from "@icons/Edit";
import Copy from "@icons/Copy";
import Delete from "@icons/Trash";
import Regenerate from "@icons/Reset";
import Markdown from "@/components/common/Markdown";
import { useTopics } from "@/context/topicsContext";
import type { TopicMessage } from "../../../../types/core";
import ComponentTooltip from "@/components/common/ComponentTooltip";
import { type Accessor, createSignal } from "solid-js";
import { writeClipboard } from "@solid-primitives/clipboard";
import Checkmark from "@/components/icons/Checkmark";

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

const CopyButton = ({ onCopy }: { onCopy: () => void }) => {
	return (
		<Button size="xs" variant="ghost" onClick={onCopy}>
			<Copy />
		</Button>
	);
};

const EditButton = ({ onEdit }: { onEdit: () => void }) => {
	return (
		<Button size="xs" variant="ghost" onClick={onEdit}>
			<Edit />
		</Button>
	);
};

const RegenerateButton = ({ onRegenerate }: { onRegenerate: () => void }) => {
	return (
		<Button size="xs" variant="ghost" onClick={onRegenerate}>
			<Regenerate />
		</Button>
	);
};

const CheckmarkButton = () => {
	return (
		<Button size="xs" variant="ghost">
			<Checkmark />
		</Button>
	);
};

interface ChatMessageToolbarProps {
	role: MessageRole;
	onDelete: () => void;
	onEdit: () => void;
	onCopy: () => void;
	onRegenerate: () => void;
	pairId: string;
	isCopied: Accessor<boolean>;
}

const ChatMessageToolbar = ({
	role,
	onDelete,
	pairId,
	onEdit,
	onCopy,
	onRegenerate,
	isCopied,
}: ChatMessageToolbarProps) => {
	switch (role) {
		case "user":
			return (
				<div class="flex">
					<ComponentTooltip content="Edit message" placement="bottom">
						<EditButton onEdit={onEdit} />
					</ComponentTooltip>
					<ComponentTooltip
						content={isCopied() ? "Copied!" : "Copy message"}
						placement="bottom"
					>
						{isCopied() ? <CheckmarkButton /> : <CopyButton onCopy={onCopy} />}
					</ComponentTooltip>
					<ComponentTooltip content="Delete message" placement="bottom">
						<DeleteButton onDelete={onDelete} pairId={pairId} />
					</ComponentTooltip>
				</div>
			);
		case "assistant":
			return (
				<div class="flex">
					<ComponentTooltip content="Regenerate message" placement="bottom">
						<RegenerateButton onRegenerate={onRegenerate} />
					</ComponentTooltip>
					<ComponentTooltip
						content={isCopied() ? "Copied!" : "Copy message"}
						placement="bottom"
					>
						{isCopied() ? <CheckmarkButton /> : <CopyButton onCopy={onCopy} />}
					</ComponentTooltip>
					<ComponentTooltip content="Delete message" placement="bottom">
						<DeleteButton onDelete={onDelete} pairId={pairId} />
					</ComponentTooltip>
				</div>
			);
	}
};

interface ChatMessageFooterProps {
	role: MessageRole;
	tokensUsed: number | undefined;
	messageId: string;
	pairId: string;
	content: string;
	onDelete: () => void;
	onEdit: () => void;
	onCopy: () => void;
	onRegenerate: () => void;
	isCopied: Accessor<boolean>;
}

const ChatMessageFooter = ({
	role,
	tokensUsed,
	messageId,
	pairId,
	content,
	onDelete,
	onEdit,
	onCopy,
	onRegenerate,
	isCopied,
}: ChatMessageFooterProps) => {
	const time = new Date();
	const options: Intl.DateTimeFormatOptions = {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	};
	// const [copied, setCopied] = createSignal(false);
	const formattedTime = new Intl.DateTimeFormat(undefined, options).format(
		time,
	);
	// const { removeMessage } = useTopics();

	// const copyMessageContent = async () => {
	// 	try {
	// 		await writeClipboard(content.replace(/\n$/, ""));
	// 		setCopied(true);
	// 		setTimeout(() => setCopied(false), 1500);
	// 	} catch (err) {
	// 		console.error("Error while copying message content:", err);
	// 	}
	// };

	return (
		<div class="flex items-center gap-2 mb-2">
			<ChatMessageToolbar
				role={role}
				onDelete={onDelete}
				pairId={pairId}
				onEdit={onEdit}
				onCopy={onCopy}
				isCopied={isCopied}
				onRegenerate={onRegenerate}
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

const MemoizedChatMessage = ({ message }: ChatMessageProps) => {
	const { highlightedMessagePair } = useTopics();
	const [copied, setCopied] = createSignal(false);
	const { removeMessage } = useTopics();

	const copyMessageContent = async () => {
		try {
			await writeClipboard(message.content.replace(/\n$/, ""));
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch (err) {
			console.error("Error while copying message content:", err);
		}
	};

	const handleDelete = () => {
		removeMessage(message.id, message.pairId);
	};

	const handleRegenerate = () => {
		console.log("Regenerate", message.id);
	};

	const handleEdit = () => {
		console.log("Edit", message.id);
	};

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
						content={message.content}
						onDelete={handleDelete}
						onEdit={handleEdit}
						onCopy={copyMessageContent}
						onRegenerate={handleRegenerate}
						isCopied={copied}
					/>
				</div>
			</div>
		</div>
	);
};

const ChatMessage = (props: ChatMessageProps) => {
	return <MemoizedChatMessage message={props.message} pairId={props.pairId} />;
};

export default ChatMessage;
