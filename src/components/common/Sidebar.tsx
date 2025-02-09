import { createSignal, Show } from "solid-js";
import SidePanelClose from "@icons/SidePanelClose";
import SidePanelOpen from "@icons/SidePanelOpen";
import { Button } from "@/components/ui/button";

export function Sidebar() {
	const [isCollapsed, setIsCollapsed] = createSignal(false);

	return (
		<aside
			class={`
        flex
        flex-col
        h-screen
        transition-all
        duration-300
        ease-in-out
        shadow-md
        ${isCollapsed() ? "w-[60px]" : "w-[20%] max-w-[300px] min-w-[200px]"}
      `}
		>
			<div class="flex-1 p-4">
				<Show
					when={!isCollapsed()}
					fallback={
						<div class="flex flex-col items-center space-y-4">
							<div class="w-8 h-8 bg-gray-200 rounded-full" />
							<div class="w-8 h-8 bg-gray-200 rounded-full" />
						</div>
					}
				>
					<div class="space-y-4">
						<div class="flex items-center space-x-3">
							<div class="w-8 h-8 bg-gray-200 rounded-full" />
							<span>Chat 1</span>
						</div>
						<div class="flex items-center space-x-3">
							<div class="w-8 h-8 bg-gray-200 rounded-full" />
							<span>Chat 2</span>
						</div>
					</div>
				</Show>
			</div>
			<div
				class={`flex-shrink-0 flex items-center pb-2 ${!isCollapsed() ? "justify-end pr-2" : "justify-center"}`}
			>
				<Button
					onClick={() => setIsCollapsed(!isCollapsed())}
					size="sm"
					variant="outline"
					class="p-2 hover:bg-gray-100 rounded transition-colors hover:cursor-pointer"
				>
					<Show
						when={isCollapsed()}
						fallback={<SidePanelClose height={20} width={20} />}
					>
						<SidePanelOpen height={20} width={20} />
					</Show>
				</Button>
			</div>
		</aside>
	);
}
