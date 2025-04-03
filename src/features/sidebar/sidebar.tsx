import { Button } from "@/components/ui/button";
import TopicListEntry from "@/components/common/topic-list-entry";
import TopicListEntryThumbnail from "@/components/common/topic-list-entry-thumbnail";
import Add from "@icons/add";
import SidePanelClose from "@icons/side-panel-close";
import SidePanelOpen from "@icons/side-panel-open";
import { type Accessor, For, type Setter, Show } from "solid-js";
import Settings from "@icons/settings";
import ComponentTooltip from "@/components/common/component-tooltip";
import { useGlobalContext } from "@/context/global-context";
import type { ProviderType } from "shared/types";

interface SidebarProps {
	setCurrentProvider: Setter<ProviderType>;
	currentProvider: Accessor<ProviderType>;
}

export function Sidebar(props: SidebarProps) {
	const {
		sidebarCollapsed,
		toggleSidebar,
		settingsPanelOpen,
		toggleSettingsPanel,
	} = useGlobalContext().ui;

	const { topics, addTopic, setCurrentTopic, currentTopicId } =
		useGlobalContext().topics;

	const handleNewTopic = () => {
		addTopic({
			name: "New Conversation",
		});
	};

	return (
		<aside
			class="h-full flex-shrink-0"
			classList={{
				"w-[60px] ": sidebarCollapsed(),
				"w-[20%] max-w-[300px] min-w-[200px]": !sidebarCollapsed(),
				"blur-sm will-change-transform": settingsPanelOpen(),
			}}
		>
			<div
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
						when={!sidebarCollapsed()}
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
									/>
								)}
							</For>
						</div>
					</Show>
				</div>
				<div
					class="flex-shrink-0 flex items-center pb-2"
					classList={{
						"justify-center": !sidebarCollapsed(),
						"flex-col justify-end pr-2": sidebarCollapsed(),
					}}
				>
					<ComponentTooltip content="General Settings" placement="top">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => toggleSettingsPanel()}
						>
							<Settings height={20} width={20} />
						</Button>
					</ComponentTooltip>

					<ComponentTooltip content="Open a new chat" placement="top">
						<Button variant="ghost" size="sm" onClick={handleNewTopic}>
							<Show
								when={sidebarCollapsed()}
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

					<Button variant="ghost" size="sm" onClick={() => toggleSidebar()}>
						<Show
							when={sidebarCollapsed()}
							fallback={<SidePanelClose height={20} width={20} />}
						>
							<SidePanelOpen height={20} width={20} />
						</Show>
					</Button>
				</div>
			</div>
		</aside>
	);
}
