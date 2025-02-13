import { createEffect, createSignal, For, Show } from "solid-js";
import SidePanelClose from "@icons/SidePanelClose";
import SidePanelOpen from "@icons/SidePanelOpen";
import { Button } from "@/components/ui/button";
import {
	addMessage,
	addTopic,
	topicsStore,
} from "@/features/chat/store/messageStore";
import { uid } from "uid";
import { unwrap } from "solid-js/store";
import TopicListEntry from "./TopicListEntry";

export function Sidebar() {
	const [isCollapsed, setIsCollapsed] = createSignal(false);
	const [topicId, setTopicId] = createSignal("");
	const [topicActive, setTopicActive] = createSignal("");

	createEffect(() => {
		console.log("topicsStore: ", unwrap(topicsStore));
		console.log("Topics number: ", topicsStore.length);
	});
	const handleNewTopic = () => {
		const newTopicId = uid(16);
		setTopicId(newTopicId);
		addTopic({
			id: newTopicId,
			name: "New Conversation",
		});
		setTopicActive(newTopicId);
	};
	createEffect(() => {
		for (const topic of topicsStore) {
			console.log("-".repeat(100));
			console.log("topicID: ", topic.id);
			for (const message of topic.messages) {
				console.log("message: ", message);
			}
		}
	});

	createEffect(() => {
		console.log({ topicId: topicId() });
	});

	createEffect(() => {
		console.log({ topicActive: topicActive() });
	});
	createEffect(() => {
		console.log("topicId === topicActive: ", topicId() === topicActive());
	});

	return (
		<aside
			class={`
        flex
        flex-col
        h-screen
        transition-all
        duration-300
        ease-in-out
        shadow-md
        ${isCollapsed() ? "w-[60px]" : "w-[20%] max-w-[300px] min-w-[200px]"}
      `}
		>
			<div class="flex-1 p-4">
				<Show
					when={!isCollapsed()}
					fallback={
						<div class="flex flex-col items-center space-y-4">
							<div class="w-8 h-8 bg-gray-200 rounded-full" />
							<div class="w-8 h-8 bg-gray-200 rounded-full" />
						</div>
					}
				>
					<For each={topicsStore}>
						{(topic) => (
							<TopicListEntry
								topicId={topic.id}
								topicName={topic.name}
								isActive={topic.id === topicActive()}
								onClick={() => setTopicActive(topic.id)}
							/>
						)}
					</For>
				</Show>
				<Button
					variant="outline"
					class="p-2 hover:bg-gray-100 rounded transition-colors hover:cursor-pointer"
					onClick={handleNewTopic}
				>
					<span> + New Chat</span>
				</Button>
				<Button
					variant="outline"
					class="p-2 hover:bg-gray-100 rounded transition-colors hover:cursor-pointer"
					onClick={() => {
						addMessage(topicId(), {
							content: "Hello world",
							timestamp: new Date(),
						});
					}}
				>
					<span> + New Message</span>
				</Button>
			</div>
			<div
				class={`flex-shrink-0 flex items-center pb-2 ${!isCollapsed() ? "justify-end pr-2" : "justify-center"}`}
			>
				<Button
					onClick={() => setIsCollapsed(!isCollapsed())}
					size="sm"
					variant="ghost"
					class="p-2 hover:bg-gray-100 rounded transition-colors hover:cursor-pointer"
				>
					<Show
						when={isCollapsed()}
						fallback={<SidePanelClose height={20} width={20} />}
					>
						<SidePanelOpen height={20} width={20} />
					</Show>
				</Button>
			</div>
		</aside>
	);
}
