import { createSignal, Show } from "solid-js";
import { Button } from "@components/ui/button";
import { TextField, TextFieldRoot } from "@components/ui/textfield";
import PopoverConfirmAction from "./PopoverConfirmAction";
import Edit from "@icons/Edit";
import Delete from "@icons/Trash";
import { useTopics } from "@/context/topicsContext";

interface TopicListEntryProps {
	topicId: string;
	topicName: string;
	isActive: boolean;
	onClick: () => void;
}
function TopicListEntry(props: TopicListEntryProps) {
	const { topicId, onClick } = props;
	const isActive = () => props.isActive;
	const topicName = () => props.topicName;
	const { editTopicName, removeTopic } = useTopics();

	const [isEditing, setIsEditing] = createSignal(false);

	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		editTopicName(topicId, form.topicName.value);
		setIsEditing(false);
	};

	return (
		<div>
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
					class="flex items-center space-x-3 hover:bg-gray-400 hover:cursor-pointer"
					classList={{ "bg-red-100": isActive() }}
					onClick={(e) => {
						e.stopPropagation();
						onClick?.();
					}}
					onKeyDown={(e: KeyboardEvent) => {
						e.stopPropagation();
						onClick?.();
					}}
				>
					<div class="w-8 h-8 bg-gray-200 rounded-full" />
					<p class="text-sm">{topicName()}</p>
				</div>
			</Show>

			<div class="flex">
				<Button
					size="xs"
					variant="ghost"
					onClick={(e: MouseEvent) => {
						e.stopPropagation();
						setIsEditing(true);
					}}
				>
					<Edit />
				</Button>

				<PopoverConfirmAction
					triggerComponent={
						<Button size="xs" variant="ghost">
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
		</div>
	);
}

export default TopicListEntry;
