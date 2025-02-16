import { useTopics } from "@/context/topicsContext";
import {
	createEffect,
	type Setter,
	Match,
	Switch,
	createMemo,
	createSignal,
} from "solid-js";
import { Button } from "@components/ui/button";
import Edit from "@icons/Edit";
import PopoverConfirmAction from "./PopoverConfirmAction";
import Delete from "@icons/Trash";
import ThreeDots from "@icons/ThreeDots";
import Checkmark from "@icons/Checkmark";
import Close from "@icons/CloseLarge";
import { onClickOutside } from "solidjs-use";

interface TopicListEntryToolsProps {
	topicId: string;
	topicName: string;
	isActive: boolean;
	bgColor: string;
	settingsOpen: boolean;
	setSettingsOpen: Setter<boolean>;
	onSubmit: (e: MouseEvent) => void;
	isEditing: boolean;
	setIsEditing: Setter<boolean>;
}
const state = {
	DEFAULT: "default",
	SETTINGS: "settings",
	EDITING: "editing",
} as const;

function TopicListEntryTools(props: TopicListEntryToolsProps) {
	const { topicId, setSettingsOpen, setIsEditing, onSubmit } = props;
	const topicName = () => props.topicName;
	const settingsOpen = () => props.settingsOpen;
	const isEditing = () => props.isEditing;
	const { removeTopic } = useTopics();
	const [target, setTarget] = createSignal<HTMLElement>();

	onClickOutside(target, () => {
		if (isEditing()) setIsEditing(false);
		setSettingsOpen(false);
	});

	const currentState = createMemo(() => {
		if (props.isEditing) return state.EDITING;
		if (props.settingsOpen) return state.SETTINGS;
		return state.DEFAULT;
	});

	const DefaultView = () => (
		<div ref={setTarget} class={`grid place-items-center ${props.bgColor}/10 `}>
			<Button
				size="xs"
				variant="ghost"
				onClick={(e: MouseEvent) => {
					e.stopPropagation();
					setSettingsOpen(true);
				}}
				class={`hover:${props.bgColor}/50 text-slate-500 hover:text-slate-800`}
			>
				<ThreeDots />
			</Button>
		</div>
	);

	const SettingsView = () => (
		<div ref={setTarget} class={`flex flex-col h-full ${props.bgColor}/10`}>
			<Button
				size="2xs"
				variant="ghost"
				onClick={(e: MouseEvent) => {
					e.stopPropagation();
					setIsEditing(true);
				}}
				class={`hover:${props.bgColor}/50 text-slate-500 hover:text-slate-800`}
			>
				<Edit />
			</Button>
			<PopoverConfirmAction
				triggerComponent={
					<Button
						size="2xs"
						variant="ghost"
						class={`hover:${props.bgColor}/50 text-slate-500 hover:text-slate-800`}
					>
						<Delete />
					</Button>
				}
				triggerComponentSize="2xs"
				triggerComponentVariant="ghost"
				triggerComponentClass={`hover:${props.bgColor}/50 text-slate-500 hover:text-slate-800`}
				onConfirm={() => removeTopic(topicId)}
				actionType="delete"
				sourceName={topicName()}
			/>
		</div>
	);

	const EditingView = () => (
		<div ref={setTarget} class={` flex flex-col h-full ${props.bgColor}/10`}>
			<Button
				size="2xs"
				variant="ghost"
				onClick={(e: MouseEvent) => {
					onSubmit(e);
				}}
				class="hover:bg-green-500 rounded-none"
			>
				<Checkmark />
			</Button>
			<Button
				size="2xs"
				variant="ghost"
				class="hover:bg-red-500 rounded-none"
				onClick={(e: MouseEvent) => {
					e.stopPropagation();
					setIsEditing(false);
					setSettingsOpen(false);
				}}
			>
				<Close />
			</Button>
		</div>
	);

	return (
		<Switch fallback={<DefaultView />}>
			<Match when={currentState() === state.SETTINGS}>
				<SettingsView />
			</Match>
			<Match when={currentState() === state.EDITING}>
				<EditingView />
			</Match>
		</Switch>
	);
}

export default TopicListEntryTools;
