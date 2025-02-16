import { createEffect } from "solid-js";
import CustomTooltip from "./CustomTooltip";

interface TopicListEntryThumbnailProps {
	topicId: string;
	topicName: string;
	isActive: boolean;
	onClick: () => void;
	bgColor: string;
}

function TopicListEntryThumbnail(props: TopicListEntryThumbnailProps) {
	const { onClick } = props;
	const isActive = () => props.isActive;
	const topicName = () => props.topicName;
	createEffect(() => {
		console.log("bgColor: ", props.bgColor);
	});

	return (
		<CustomTooltip content={topicName()} placement="right-start">
			<div
				class={`w-8 h-8 ${props.bgColor} rounded-full hover:opacity-100`}
				classList={{ "opacity-100": isActive(), "opacity-60": !isActive() }}
				onClick={(e) => {
					e.stopPropagation();
					onClick?.();
				}}
				onKeyDown={(e: KeyboardEvent) => {
					e.stopPropagation();
					onClick?.();
				}}
			/>
		</CustomTooltip>
	);
}

export default TopicListEntryThumbnail;
