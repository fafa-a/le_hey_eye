import { Select as SolidSelect, createOptions } from "@thisbeyond/solid-select";
import { createSignal, createEffect } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { createQuery } from "@tanstack/solid-query";
import type { CloudflareModelResponse } from "../../../types/cloudflare";
import "@thisbeyond/solid-select/style.css";

async function getAllCloudflareAIModels(): Promise<CloudflareModelResponse> {
	return await invoke("get_all_cloudflare_ai_models");
}
interface SelectProps {
	setModel: (model: string) => void;
}
export const Select = ({ setModel }: SelectProps) => {
	const [value, setValue] = createSignal(null);
	const [options, setOptions] = createSignal<{ name: string }[]>([]);

	const models = createQuery<CloudflareModelResponse>(() => ({
		queryKey: ["models"],
		queryFn: async () => {
			return await getAllCloudflareAIModels();
		},
	}));

	createEffect(() => {
		if (models.isSuccess) {
			setOptions(
				models.data.result
					.filter(
						(model) => model.task.name.toLowerCase() === "text generation",
					)
					.map((model) => ({
						name: model.name,
						label: model.name,
					})),
			);
		}
	});

	const format = (item, type) => {
		return type === "option" ? (
			<p class="text-red-500  hover:text-red-700">{item.name}</p>
		) : (
			<p class="text-green-500 hover:text-green-700">{item.name}</p>
		);
	};
	const handleChange = (value) => {
		console.log("value", value);
		setValue(value);
		setModel(value.name);
	};

	return (
		<div class="flex flex-1 flex-col max-w-100 gap-3">
			<SolidSelect
				{...createOptions(options(), {
					format,
					extractText: (value) => value.name,
					createable: (inputValue) => ({ name: inputValue, icon: "🍇" }),
				})}
				onChange={handleChange}
				placeholder=""
				autofocus={true}
			/>
			<div class="text-sm mt-2 bg-yellow-500/20 p-3">
				Value: {JSON.stringify(value())}
			</div>
		</div>
	);
};
