import { Button, buttonVariants } from "@/components/ui/button";
import { createMemo, type JSX, Show } from "solid-js";
interface NavItemProps {
	label: string;
	icon?: string | JSX.Element;
	onClick?: () => void;
	onKeyDown?: (e: KeyboardEvent) => void;
	isActive?: boolean;
}
const NavItem = (props: NavItemProps) => {
	const buttonClass = createMemo(() =>
		buttonVariants({
			variant: "nav",
			active: props.isActive,
		}),
	);
	// const iconContent = createMemo(() => {
	// 	if (typeof props.icon === "string") {
	// 		return (
	// 			<img
	// 				src={props.icon}
	// 				width={20}
	// 				height={20}
	// 				alt={props.label}
	// 				loading="eager" // Pour charger l'image immédiatement
	// 			/>
	// 		);
	// 	}
	// 	return props.icon;
	// });

	return (
		<Button
			variant="nav"
			class={buttonClass()}
			onClick={props.onClick}
			onKeyDown={props.onKeyDown}
		>
			<Show when={typeof props.icon === "string"} fallback={props.icon}>
				<img
					src={String(props.icon)}
					width={20}
					height={20}
					alt={props.label}
				/>
			</Show>
			<span>{props.label}</span>
		</Button>
	);
};

export default NavItem;
