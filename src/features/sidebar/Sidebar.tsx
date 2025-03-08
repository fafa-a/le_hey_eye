import { For, type Setter, Show } from "solid-js";
import SidePanelClose from "@icons/SidePanelClose";
import SidePanelOpen from "@icons/SidePanelOpen";
import { Button } from "@/components/ui/button";
import { uid } from "uid";
import TopicListEntry from "@components/common/TopicListEntry";
import { useTopics } from "@/context/topicsContext";
import Add from "@icons/Add";
import TopicListEntryThumbnail from "@components/common/TopicListEntryThumbnail";
import GeneralSettings from "./components/GeneralSettings";
import type { Provider } from "types/core";

interface SidebarProps {
	isCollapsed: boolean;
	setIsCollapsed: Setter<boolean>;
	topicId: string;
	setTopicId: Setter<string>;
	topicActive: string;
	setTopicActive: Setter<string>;
	setCurrentProvider: Setter<Provider>;
	currentProvider: Provider;
}

export function Sidebar(props: SidebarProps) {
	const {
		setTopicId,
		setTopicActive,
		setIsCollapsed,
		setCurrentProvider,
		currentProvider,
	} = props;
	const topicActive = () => props.topicActive;
	const isCollapsed = () => props.isCollapsed;
	const { topics, addTopic } = useTopics();

	const handleNewTopic = () => {
		const newTopicId = uid(16);
		setTopicId(newTopicId);
		addTopic({
			id: newTopicId,
			name: "New Conversation long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long long",
		});
		setTopicActive(newTopicId);
	};

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
				<GeneralSettings
					setCurrentProvider={setCurrentProvider}
					currentProvider={currentProvider}
				/>
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
