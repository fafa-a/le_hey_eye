import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Placement } from "@kobalte/core/src/popper/utils.js";
import type { JSX } from "solid-js";

interface ComponentTooltipProps {
	content: string | JSX.Element;
	children: JSX.Element;
	placement?: Placement;
}

function ComponentTooltip(props: ComponentTooltipProps) {
	return (
		<Tooltip placement={props.placement}>
			<TooltipTrigger>{props.children}</TooltipTrigger>
			<TooltipContent>
				<p>{props.content}</p>
			</TooltipContent>
		</Tooltip>
	);
}

export default ComponentTooltip;
