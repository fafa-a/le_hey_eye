import { Button } from "@components/ui/button";
import type { JSX } from "solid-js";
import ComponentTooltip from "./component-tooltip";

interface ButtonTooltipProps {
	tooltipContent: string | JSX.Element;
	variant?:
		| "outline"
		| "ghost"
		| "link"
		| "default"
		| "destructive"
		| "secondary";
	size?: "default" | "xs" | "sm" | "lg" | "icon" | "2xs";
	class?: string;
	onClick?: () => void;
	disabled?: boolean;
	placement?: "top" | "bottom" | "left" | "right";
	children: JSX.Element;
}

const ButtonTooltip = (props: ButtonTooltipProps) => {
	return (
		<ComponentTooltip
			content={props.tooltipContent}
			placement={props.placement}
		>
			<Button
				variant={props.variant}
				size={props.size}
				class={props.class}
				onClick={props.onClick}
				disabled={props.disabled}
			/>
		</ComponentTooltip>
	);
};

export default ButtonTooltip;
