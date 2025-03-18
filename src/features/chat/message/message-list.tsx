import Markdown from "@/components/common/Markdown";
import {
	createEffect,
	createSignal,
	For,
	onCleanup,
	onMount,
	Show,
} from "solid-js";
import ChatMessage from "./ChatMessage";
import { useTopics } from "@/context/topicsContext";
import { listen } from "@tauri-apps/api/event";

interface MessageListProps {
	mutation: any;
}

const MessageList = (props: MessageListProps) => {
	const { currentTopicMessages } = useTopics();

	const [currentStreamedResponse, setCurrentStreamedResponse] =
		createSignal("");
	const [streamHeight, setStreamHeight] = createSignal(0);

	let messagesContainerRef: HTMLDivElement | undefined;
	const setMessagesContainer = (el: HTMLDivElement) => {
		messagesContainerRef = el;
	};

	let contentRef: HTMLDivElement | undefined;
	const setContentRef = (el: HTMLDivElement) => {
		contentRef = el;
	};

	let markdownContainerRef: HTMLDivElement | undefined;
	const setMarkdownContainerRef = (el: HTMLDivElement) => {
		markdownContainerRef = el;
	};

	const scrollToBottom = () => {
		if (messagesContainerRef) {
			messagesContainerRef.scrollTop = messagesContainerRef.scrollHeight;
		}
	};

	onMount(() => {
		let rawResponseText = "";

		const streamHandler = (event: any) => {
			rawResponseText = event.payload as string;

			if (rawResponseText !== currentStreamedResponse()) {
				queueMicrotask(() => setCurrentStreamedResponse(rawResponseText));
			}
		};

		const resetHandler = () => setCurrentStreamedResponse("");

		const unlistenPromise = listen("stream-response", streamHandler);
		const unlistenMessageAdded = listen("message-added", resetHandler);

		onCleanup(async () => {
			(await unlistenPromise)();
			(await unlistenMessageAdded)();
		});
	});

	createEffect(() => {
		currentTopicMessages();
		currentStreamedResponse();

		requestAnimationFrame(scrollToBottom);
	});

	createEffect(() => {
		const response = currentStreamedResponse();

		if (!response) {
			setStreamHeight(0);
			return;
		}

		if (!messagesContainerRef || !contentRef) return;

		requestAnimationFrame(() => {
			if (!contentRef) return;

			// const containerRect = messagesContainerRef!.getBoundingClientRect();
			const viewportHeight = window.innerHeight;
			const contentHeight = contentRef.scrollHeight;

			const minHeight = 150;
			const idealHeight = Math.max(
				minHeight,
				Math.min(500, contentHeight + 50),
			);
			const finalHeight = Math.min(idealHeight, viewportHeight * 0.7);

			setStreamHeight(finalHeight);

			requestAnimationFrame(scrollToBottom);
		});
	});

	return (
		<Show when={currentTopicMessages().length > 0}>
			<div
				class="flex-1 overflow-y-auto w-full min-h-0 min-w-full"
				ref={setMessagesContainer}
			>
				<div class="space-y-4 w-full p-3 min-w-full">
					<For each={currentTopicMessages()}>
						{(message) => (
							<ChatMessage message={message} pairId={message.pairId} />
						)}
					</For>

					<Show when={currentStreamedResponse().length > 0}>
						<div
							class="w-full min-w-full overflow-hidden bg-red-500"
							style={{
								height: currentStreamedResponse()
									? `${streamHeight()}px`
									: "auto",
							}}
							ref={setMarkdownContainerRef}
						>
							<div ref={setContentRef}>
								<Markdown>{currentStreamedResponse()}</Markdown>
							</div>
						</div>
					</Show>

					<Show when={props.mutation.isPending && !currentStreamedResponse()}>
						<div class="p-4 rounded w-full">
							<div class="animate-pulse text-slate-500">Thinking...</div>
						</div>
					</Show>
				</div>
			</div>
		</Show>
	);
};

export default MessageList;
