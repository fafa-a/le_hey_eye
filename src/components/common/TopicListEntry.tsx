import { createEffect, createSignal, Show } from "solid-js";
import { Button } from "@components/ui/button";
import { TextField, TextFieldRoot } from "@components/ui/textfield";
import PopoverConfirmAction from "./PopoverConfirmAction";
import Edit from "@icons/Edit";
import Delete from "@icons/Trash";
import { useTopics } from "@/context/topicsContext";
import ThreeDots from "@icons/ThreeDots";

interface TopicListEntryProps {
	topicId: string;
	topicName: string;
	isActive: boolean;
	onClick: () => void;
	bgColor: string;
}

function TopicListEntry(props: TopicListEntryProps) {
	const { topicId, onClick } = props;
	const isActive = () => props.isActive;
	const topicName = () => props.topicName;
	const { editTopicName, removeTopic } = useTopics();

	const [isEditing, setIsEditing] = createSignal(false);
	const [settingsOpen, setSettingsOpen] = createSignal(false);

	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		editTopicName(topicId, form.topicName.value);
		setIsEditing(false);
	};

	return (
		<div class={`flex max-h-8 rounded-l-full`}>
			<Show
				when={!isEditing()}
				fallback={
					<form class="flex flex-col space-y-2" onSubmit={handleSubmit}>
						<TextFieldRoot>
							<TextField
								type="text"
								placeholder="New Topic"
								id="topicName"
								value={topicName()}
								autofocus
							/>
							<Button
								variant="outline"
								type="submit"
								class="p-2 hover:bg-gray-100 rounded transition-colors hover:cursor-pointer"
							>
								<span>Save</span>
							</Button>
						</TextFieldRoot>
					</form>
				}
			>
				<div
					class={`flex ${props.bgColor}/10 rounded-l-full items-center space-x-3 hover:${props.bgColor}/50 hover:cursor-pointer`}
					classList={{ "opacity-100": isActive(), "opacity-60": !isActive() }}
					onClick={(e) => {
						e.stopPropagation();
						onClick?.();
					}}
					onKeyDown={(e: KeyboardEvent) => {
						e.stopPropagation();
						onClick?.();
					}}
				>
					<div class={`w-8 h-8 ${props.bgColor} rounded-full`} />
					<div class="overflow-hidden whitespace-nowrap">
						<p class="text-sm overflow-hidden text-ellipsis">{topicName()}</p>
					</div>
				</div>
			</Show>
			<Show
				when={!settingsOpen()}
				fallback={
					<div class={`flex flex-col h-full ${props.bgColor}/10 z-10`}>
						<Button
							size="xs"
							variant="ghost"
							onClick={(e: MouseEvent) => {
								e.stopPropagation();
								setIsEditing(true);
							}}
							class={`hover:${props.bgColor}/50`}
						>
							<Edit />
						</Button>
						<PopoverConfirmAction
							triggerComponent={
								<Button
									size="xs"
									variant="ghost"
									class={`hover:${props.bgColor}/50`}
								>
									<Delete />
								</Button>
							}
							triggerComponentSize="xs"
							triggerComponentVariant="ghost"
							onConfirm={() => {
								removeTopic(topicId);
							}}
							actionType="delete"
							sourceName={topicName()}
						/>
					</div>
				}
			>
				<div class={`grid place-items-center ${props.bgColor}/10`}>
					<Button
						size="xs"
						variant="ghost"
						onClick={(e: MouseEvent) => {
							e.stopPropagation();
							setSettingsOpen(true);
						}}
					>
						<ThreeDots />
					</Button>
				</div>
			</Show>
		</div>
	);
}

export default TopicListEntry;
