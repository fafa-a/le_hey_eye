import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Placement } from "@kobalte/core/src/popper/utils.js";
import type { JSX } from "solid-js";

interface CustomTooltipProps {
	content: string;
	children: JSX.Element;
	placement?: Placement;
}

function CustomTooltip(props: CustomTooltipProps) {
	return (
		<Tooltip placement={props.placement}>
			<TooltipTrigger>{props.children}</TooltipTrigger>
			<TooltipContent>
				<p>{props.content}</p>
			</TooltipContent>
		</Tooltip>
	);
}

export default CustomTooltip;
