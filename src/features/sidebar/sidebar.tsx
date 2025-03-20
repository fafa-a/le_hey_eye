import { Button } from "@/components/ui/button";
import { useTopics } from "@/context/topics-context";
import TopicListEntry from "@/components/common/topic-list-entry";
import TopicListEntryThumbnail from "@/components/common/topic-list-entry-thumbnail";
import Add from "@icons/add";
import SidePanelClose from "@icons/side-panel-close";
import SidePanelOpen from "@icons/side-panel-open";
import { type Accessor, createEffect, For, type Setter, Show } from "solid-js";
import type { Provider } from "types/core";
import { uid } from "uid";
import GeneralSettings from "./components/general-settings";
import { unwrap } from "solid-js/store";
import Settings from "@icons/settings";
import ComponentTooltip from "@/components/common/component-tooltip";

interface SidebarProps {
	isCollapsed: boolean;
	setIsCollapsed: Setter<boolean>;
	setCurrentProvider: Setter<Provider>;
	currentProvider: Accessor<Provider>;
	setIsSettingsPanelOpen: Setter<boolean>;
}

export function Sidebar(props: SidebarProps) {
	const {
		setIsCollapsed,
		setCurrentProvider,
		currentProvider,
		setIsSettingsPanelOpen,
	} = props;
	const isCollapsed = () => props.isCollapsed;

	const { topics, addTopic, setCurrentTopic, currentTopicId } = useTopics();

	const handleNewTopic = () => {
		console.warn("handleNewTopic");
		const newTopicId = uid(16);
		addTopic({
			id: newTopicId,
			name: "New Conversation",
		});
		setCurrentTopic(newTopicId);
	};

	createEffect(() => {
		console.log("Sidebar");
		console.log({
			topics: unwrap(topics),
		});
	});

	return (
		<aside
			class="
        flex
        flex-col
        flex-1
        h-full
        transition-all
        duration-300
        ease-in-out
        shadow-md
        "
		>
			<div class="flex-1 p-4">
				<Show
					when={!isCollapsed()}
					fallback={
						<div class="flex flex-col gap-1">
							<For each={topics}>
								{(topic) => (
									<TopicListEntryThumbnail
										topicId={topic.id}
										topicName={topic.name}
										isActive={topic.id === currentTopicId()}
										onClick={() => setCurrentTopic(topic.id)}
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
									isActive={topic.id === currentTopicId()}
									onClick={() => setCurrentTopic(topic.id)}
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
				<ComponentTooltip content="General Settings" placement="top">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setIsSettingsPanelOpen((prev) => !prev)}
					>
						<Settings height={20} width={20} />
					</Button>
				</ComponentTooltip>

				<ComponentTooltip content="Open a new chat" placement="top">
					<Button variant="ghost" size="sm" onClick={handleNewTopic}>
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
				</ComponentTooltip>

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
