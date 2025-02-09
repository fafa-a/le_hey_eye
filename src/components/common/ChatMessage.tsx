import { SolidMarkdown } from "solid-markdown";
import type { Message } from "../../../types/cloudflare";
interface ChatMessageFooterProps {
	tokens_used: number;
}

const ChatMessageFooter = ({ tokens_used }: ChatMessageFooterProps) => {
	const time = new Date();
	const options: Intl.DateTimeFormatOptions = {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	};
	const formattedTime = new Intl.DateTimeFormat(undefined, options).format(
		time,
	);

	console.log(formattedTime);
	return (
		<div class="flex justify-end gap-2">
			<span class="text-xs text-gray-300">{formattedTime}</span>
			<span class="text-xs text-gray-300">{tokens_used} tokens used</span>
		</div>
	);
};

interface ChatMessageProps {
	message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
	return (
		<div class="flex flex-col gap-1">
			<div
				class="p-4 rounded "
				classList={{
					"bg-slate-50 ml-9": message.role === "user",
					"mr-9 border border-slate-100": message.role === "assistant",
				}}
			>
				<SolidMarkdown>{message.content}</SolidMarkdown>
				{message.tokens_used && (
					<ChatMessageFooter tokens_used={message.tokens_used} />
				)}
			</div>
		</div>
	);
};

export default ChatMessage;
