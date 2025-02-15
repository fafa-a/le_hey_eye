import { createSignal, For, type Setter, Show } from "solid-js";
import SidePanelClose from "@icons/SidePanelClose";
import SidePanelOpen from "@icons/SidePanelOpen";
import { Button } from "@/components/ui/button";
import { uid } from "uid";
import TopicListEntry from "./TopicListEntry";
import { useTopics } from "@/context/topicsContext";
interface SidebarProps {
	topicId: string;
	setTopicId: Setter<string>;
	topicActive: string;
	setTopicActive: Setter<string>;
}

export function Sidebar(props: SidebarProps) {
	const [isCollapsed, setIsCollapsed] = createSignal(false);
	const { setTopicId, setTopicActive } = props;
	const topicActive = () => props.topicActive;
	const { topics, addTopic } = useTopics();

	const handleNewTopic = () => {
		const newTopicId = uid(16);
		setTopicId(newTopicId);
		addTopic({
			id: newTopicId,
			name: "New Conversation",
		});
		setTopicActive(newTopicId);
	};

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
					<For each={topics}>
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
