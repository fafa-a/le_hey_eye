import { useTopics } from "@/context/topicsContext";
import { TextField, TextFieldRoot } from "@components/ui/textfield";
import { type Setter, Show, createEffect, createSignal } from "solid-js";
import PopoverConfirmAction from "./PopoverConfirmAction";
import TopicListEntryTools from "./TopicListEntryTools";

interface TopicListEntryProps {
	topicId: string;
	topicName: string;
	isActive: boolean;
	onClick: () => void;
	bgColor: string;
	setIsCollapsed: Setter<boolean>;
	isCollapsed: boolean;
}

function TopicListEntry(props: TopicListEntryProps) {
	const { topicId, onClick, setIsCollapsed } = props;
	const isActive = () => props.isActive;
	const topicName = () => props.topicName;
	const isCollapsed = () => props.isCollapsed;
	const { editTopicName } = useTopics();
	const [isEditing, setIsEditing] = createSignal(false);
	const [settingsOpen, setSettingsOpen] = createSignal(false);
	let formRef: HTMLFormElement;

	const setFormRef = (el: HTMLFormElement) => {
		formRef = el;
	};

	const handleSubmit = (e: SubmitEvent) => {
		e.preventDefault();
		if (!formRef) return;
		editTopicName(topicId, formRef.topicName.value);
		setIsEditing(false);
		setSettingsOpen(false);
	};

	return (
		<div
			class={`flex w-full max-h-9 ${props.bgColor}/10 rounded-l-full hover:${props.bgColor}/50`}
			classList={{
				[`opacity-100 border ${props.bgColor.replace("bg-", "border-")}`]:
					isActive(),
				"opacity-50": !isActive(),
			}}
		>
			<Show
				when={!isEditing()}
				fallback={
					<form ref={setFormRef} onSubmit={handleSubmit}>
						<TextFieldRoot>
							<TextField
								type="text"
								placeholder="New Topic"
								id="topicName"
								value={topicName()}
								autofocus
								class="w-full rounded-l-full overflow-hidden text-ellipsis focus-visible:ring-0 focus-visible:outline-none"
							/>
						</TextFieldRoot>
					</form>
				}
			>
				<div
					class={`flex flex-1 overflow-hidden gap-0.5 ${props.bgColor}/10 rounded-l-full items-center hover:cursor-pointer`}
					onClick={(e) => {
						e.stopPropagation();
						onClick?.();
					}}
					onKeyDown={(e: KeyboardEvent) => {
						e.stopPropagation();
						onClick?.();
					}}
				>
					<div
						class={`flex-shrink-0 w-8 h-8 ${props.bgColor} rounded-full`}
						ondblclick={(e) => {
							e.stopPropagation();
							setIsCollapsed(!props.isCollapsed);
						}}
					/>
					<div class="flex-1 min-w-0">
						<p class="text-sm overflow-hidden text-ellipsis whitespace-nowrap">
							{topicName()}
						</p>
					</div>
				</div>
			</Show>
			<TopicListEntryTools
				topicId={topicId}
				topicName={topicName()}
				isActive={isActive()}
				bgColor={props.bgColor}
				setSettingsOpen={setSettingsOpen}
				onSubmit={handleSubmit}
				isEditing={isEditing()}
				setIsEditing={setIsEditing}
				settingsOpen={settingsOpen()}
			/>
		</div>
	);
}

export default TopicListEntry;
