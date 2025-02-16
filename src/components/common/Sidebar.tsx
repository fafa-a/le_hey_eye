import {
	createEffect,
	createMemo,
	createSignal,
	For,
	type Setter,
	Show,
} from "solid-js";
import SidePanelClose from "@icons/SidePanelClose";
import SidePanelOpen from "@icons/SidePanelOpen";
import { Button } from "@/components/ui/button";
import { uid } from "uid";
import TopicListEntry from "./TopicListEntry";
import { useTopics } from "@/context/topicsContext";
import Add from "../icons/Add";
import TopicListEntryThumbnail from "./TopicListEntryThumbnail";

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
			name: "New Conversation long long long long long long long long long long long long long long long long long long long long long long long long long long long",
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
						<div class="flex flex-col gap-1 w-full">
							<For each={topics}>
								{(topic) => (
									<TopicListEntryThumbnail
										topicId={topic.id}
										topicName={topic.name}
										isActive={topic.id === topicActive()}
										onClick={() => setTopicActive(topic.id)}
										bgColor={topic.bgColor}
										setIsCollapsed={setIsCollapsed}
										isCollapsed={isCollapsed()}
									/>
								)}
							</For>
						</div>
					}
				>
					<div class="flex flex-col gap-1 w-full">
						<For each={topics}>
							{(topic) => (
								<TopicListEntry
									topicId={topic.id}
									topicName={topic.name}
									isActive={topic.id === topicActive()}
									onClick={() => setTopicActive(topic.id)}
									bgColor={topic.bgColor}
									setIsCollapsed={setIsCollapsed}
									isCollapsed={isCollapsed()}
								/>
							)}
						</For>
					</div>
				</Show>
			</div>
			<div
				class="flex-shrink-0 flex items-center pb-2"
				classList={{
					"justify-center": !isCollapsed(),
					"flex-col justify-end pr-2": isCollapsed(),
				}}
			>
				<Button
					variant="ghost"
					size="sm"
					onClick={handleNewTopic}
					title="New Chat"
				>
					<Show
						when={isCollapsed()}
						fallback={
							<div class="flex items-center gap-0.5">
								<Add height={20} width={20} />
								<span class="text-sm">New Chat</span>
							</div>
						}
					>
						<Add height={20} width={20} />
					</Show>
				</Button>

				<Button
					variant="ghost"
					size="sm"
					onClick={() => setIsCollapsed(!isCollapsed())}
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
