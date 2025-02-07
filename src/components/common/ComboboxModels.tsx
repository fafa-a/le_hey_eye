import {
	Combobox,
	ComboboxItem,
	ComboboxTrigger,
	ComboboxContent,
	ComboboxInput,
} from "@/components/ui/combobox";
import { createFilter } from "@kobalte/core";

import { createEffect, createSignal, type Setter } from "solid-js";
import { invoke } from "@tauri-apps/api/core";

import { createQuery } from "@tanstack/solid-query";
import type { CloudflareModelResponse } from "../../../types/cloudflare";

async function getAllCloudflareAIModels(): Promise<CloudflareModelResponse> {
	return await invoke("get_all_cloudflare_ai_models");
}

interface ComboboxModelsProps {
	setModel: Setter<string>;
}

export function ComboboxModels({ setModel }: ComboboxModelsProps) {
	const filter = createFilter({ sensitivity: "base" });
	const [options, setOptions] = createSignal<string[]>([]);
	const [cloudFlareModels, setCloudFlareModels] = createSignal<string[]>([]);

	const models = createQuery<CloudflareModelResponse>(() => ({
		queryKey: ["models"],
		queryFn: async () => {
			return await getAllCloudflareAIModels();
		},
	}));

	createEffect(() => {
		if (models.isSuccess) {
			const modelsNames = models.data.result
				.filter((model) => model.task.name.toLowerCase() === "text generation")
				.map((model) => model.name);

			setOptions(modelsNames);
			setCloudFlareModels(modelsNames);
		}
	});

	const onInputChange = (value: string) => {
		if (!cloudFlareModels().length || !models.isSuccess) return;
		setOptions(
			cloudFlareModels().filter((option) => filter.contains(option, value)),
		);
	};

	return (
		<Combobox
			options={options()}
			onInputChange={onInputChange}
			placeholder="Search models…"
			itemComponent={(props) => (
				<ComboboxItem
					item={props.item}
					class="bg-white hover:bg-gray-100 hover:cursor-pointer"
				>
					{props.item.rawValue}
				</ComboboxItem>
			)}
			onSelect={(e: Event) => {
				if ((e.target as HTMLSelectElement).value.trim() !== "") {
					setModel((e.target as HTMLSelectElement).value);
				}
			}}
			class="w-full bg-white"
		>
			<ComboboxTrigger>
				<ComboboxInput />
			</ComboboxTrigger>
			<ComboboxContent class="max-h-56 bg-white overflow-y-auto" />
		</Combobox>
	);
}
