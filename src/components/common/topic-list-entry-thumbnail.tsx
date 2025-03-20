import type { Setter } from "solid-js";
import ComponentTooltip from "./component-tooltip";

interface TopicListEntryThumbnailProps {
	topicId: string;
	topicName: string;
	isActive: boolean;
	onClick: () => void;
	bgColor: string;
	setIsCollapsed: Setter<boolean>;
	isCollapsed: boolean;
}

function TopicListEntryThumbnail(props: TopicListEntryThumbnailProps) {
	const { onClick, setIsCollapsed } = props;
	const isActive = () => props.isActive;
	const topicName = () => props.topicName;

	return (
		<ComponentTooltip content={topicName()} placement="right-start">
			<div
				class={`w-8 h-8 ${props.bgColor} rounded-full hover:opacity-100`}
				classList={{
					"opacity-100": isActive(),
					"opacity-20": !isActive(),
				}}
				onClick={(e) => {
					e.stopPropagation();
					onClick?.();
				}}
				onKeyDown={(e: KeyboardEvent) => {
					e.stopPropagation();
					onClick?.();
				}}
				ondblclick={(e) => {
					e.stopPropagation();
					setIsCollapsed(!props.isCollapsed);
				}}
			/>
		</ComponentTooltip>
	);
}

export default TopicListEntryThumbnail;
