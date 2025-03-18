import Markdown from "@/components/common/Markdown";
import {
	type Accessor,
	createEffect,
	createMemo,
	createSignal,
	For,
	onCleanup,
	onMount,
	Show,
} from "solid-js";
import ChatMessage from "./ChatMessage";
import { TopicMessage, useTopics } from "@/context/topicsContext";
import { listen } from "@tauri-apps/api/event";

interface MessageListProps {
	mutation: any;
}

const MessageList = (props: MessageListProps) => {
	const { currentTopicMessages, topics, currentTopicId } = useTopics();

	const [messagesContainer, setMessagesContainer] =
		createSignal<HTMLDivElement>();
	const [contentRef, setContentRef] = createSignal<HTMLDivElement>();
	const [markdownContainerRef, setMarkdownContainerRef] =
		createSignal<HTMLDivElement>();

	const [currentStreamedResponse, setCurrentStreamedResponse] =
		createSignal("");
	const [streamHeight, setStreamHeight] = createSignal(0);

	onMount(() => {
		let rawResponseText = "";

		const unlistenPromise = listen("stream-response", (event) => {
			rawResponseText = event.payload as string;

			queueMicrotask(() => {
				if (rawResponseText !== currentStreamedResponse()) {
					setCurrentStreamedResponse(rawResponseText);
				}
			});
		});
		const unlistenMessageAdded = listen("message-added", () => {
			setCurrentStreamedResponse("");
		});

		onCleanup(async () => {
			const unlisten = await unlistenPromise;
			unlisten();
			const unlistenMessage = await unlistenMessageAdded;
			unlistenMessage();
		});
	});

	const scrollToBottom = () => {
		const container = messagesContainer();
		if (container) {
			container.scrollTop = container.scrollHeight - container.offsetHeight;
			container.scrollTop = container.scrollHeight;
		}
	};

	createEffect(() => {
		currentTopicMessages();
		currentStreamedResponse();
		setTimeout(scrollToBottom, 20);
	});

	createEffect(() => {
		const response = currentStreamedResponse();
		const container = messagesContainer();
		const content = contentRef();

		if (response && container && content) {
			const containerRect = container.getBoundingClientRect();
			const viewportHeight = window.innerHeight;
			const spaceBelow = viewportHeight - containerRect.bottom;

			const contentHeight = content.scrollHeight;

			const minHeight = 150;
			const idealHeight = Math.max(
				minHeight,
				Math.min(500, contentHeight + 50),
			);

			const finalHeight = Math.min(idealHeight, viewportHeight * 0.7);

			setStreamHeight(finalHeight);

			setTimeout(() => {
				if (container) {
					container.scrollTop = container.scrollHeight;
				}
			}, 0);
		} else if (!response) {
			setStreamHeight(0);
		}
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
