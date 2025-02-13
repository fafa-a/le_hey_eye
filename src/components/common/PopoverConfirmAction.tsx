import type { PopoverTriggerProps } from "@kobalte/core/popover";
import { Button } from "@components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverDescription,
	PopoverTitle,
	PopoverTrigger,
} from "@components/ui/popover";
import { createSignal, type JSX } from "solid-js";

interface PopoverDemoProps {
	triggerComponent: JSX.Element;
	triggerComponentSize:
		| "default"
		| "sm"
		| "lg"
		| "icon"
		| "xs"
		| null
		| undefined;
	triggerComponentVariant:
		| "link"
		| "default"
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| null
		| undefined;
	onConfirm: () => void;
	actionType: "delete" | "save";
	sourceName: string;
}
const PopoverConfirmAction = ({
	triggerComponent,
	triggerComponentSize,
	triggerComponentVariant,
	onConfirm,
	actionType,
	sourceName,
}: PopoverDemoProps) => {
	const [isOpen, setIsOpen] = createSignal(false);
	const actionTitle = actionType === "delete" && "deletion";
	const actionText = actionType === "delete" && "delete";

	return (
		<Popover open={isOpen()} onOpenChange={setIsOpen}>
			<PopoverTrigger
				as={(props: PopoverTriggerProps) => (
					<Button
						{...props}
						size={triggerComponentSize}
						variant={triggerComponentVariant}
					>
						{triggerComponent}
					</Button>
				)}
			/>
			<PopoverContent class="w-80">
				<div class="grid gap-4">
					<PopoverTitle class="space-y-2">
						<h4 class="font-medium leading-none">Confirm {actionTitle}</h4>
						<p class="text-sm text-muted-foreground">
							Are you sure you want to {actionText}{" "}
							<span class="font-semibold">{sourceName}</span> ?
						</p>
					</PopoverTitle>

					<PopoverDescription class="flex justify-end gap-2">
						<Button
							variant="outline"
							class="p-2 hover:bg-gray-100 rounded transition-colors hover:cursor-pointer"
							onClick={() => setIsOpen(false)}
						>
							<span>Cancel</span>
						</Button>
						<Button
							variant="outline"
							class="p-2 hover:bg-red-100 rounded transition-colors hover:cursor-pointer"
							onClick={() => {
								onConfirm();
							}}
						>
							<span>Yes</span>
						</Button>
					</PopoverDescription>
				</div>
			</PopoverContent>
		</Popover>
	);
};

export default PopoverConfirmAction;
