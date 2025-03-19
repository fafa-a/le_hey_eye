import Markdown from "@/components/common/Markdown";
import {
	createEffect,
	createMemo,
	createSignal,
	For,
	onCleanup,
	onMount,
	Show,
} from "solid-js";
import ChatMessage from "./ChatMessage";
import { useTopics } from "@/context/topicsContext";
import { listen } from "@tauri-apps/api/event";
import { createScrollPosition } from "@solid-primitives/scroll";

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

	const [displayCount, setDisplayCount] = createSignal(10);
	const [isLoadingMore, setIsLoadingMore] = createSignal(false);

	const visibleMessages = createMemo(() => {
		const allMessages = currentTopicMessages();
		const count = Math.min(displayCount(), allMessages.length);
		return allMessages.slice(-count);
	});

	const handleScroll = (e: Event) => {
		const target = e.target as HTMLDivElement;

		if (
			!isLoadingMore() &&
			target.scrollTop < 100 &&
			target.scrollTop > 0 &&
			displayCount() < currentTopicMessages().length
		) {
			setIsLoadingMore(true);

			const oldHeight = target.scrollHeight;
			const oldTop = target.scrollTop;

			setDisplayCount((prev) =>
				Math.min(prev + 5, currentTopicMessages().length),
			);

			queueMicrotask(() => {
				if (target) {
					const newHeight = target.scrollHeight;
					target.scrollTop = oldTop + (newHeight - oldHeight);
				}

				setTimeout(() => {
					setIsLoadingMore(false);
				}, 500);
			});
		}
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

	createEffect(() => {
		console.log("DB Messages count:", currentTopicMessages().length);
		console.log("VISIBLE Messages count:", visibleMessages().length);
		console.log("Display count:", displayCount());
	});

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
	// createEffect(() => {
	// 	console.log(scrollY());
	// });
	//
	return (
		<Show when={currentTopicMessages().length > 0}>
			<div
				class="flex-1 overflow-y-auto w-full min-h-0 min-w-full"
				ref={setMessagesContainer}
				onScroll={handleScroll}
			>
				<div class="space-y-4 w-full p-3 min-w-full">
					<For each={visibleMessages()}>
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
