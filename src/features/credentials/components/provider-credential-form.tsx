import { Button } from "@/components/ui/button";
import { TextField, TextFieldInput } from "@/components/ui/text-field";
import { invoke } from "@tauri-apps/api/core";
import { createForm } from "@tanstack/solid-form";
import { createEffect, createSignal, For } from "solid-js";
import { PROVIDER_CONFIGURATION } from "@/features/credentials/constants/provider.configuration";
import type { ProviderFormConfig } from "../types/provider.types";
import ComponentTooltip from "@/components/common/component-tooltip";

interface ProviderFormProps {
	provider: string;
}

export default function ProviderForm(props: ProviderFormProps) {
	const [providerConfig, setProviderConfig] =
		createSignal<ProviderFormConfig | null>(null);

	const [fieldsValidity, setFieldsValidity] = createSignal<
		Record<string, boolean>
	>({});

	const getDefaultValues = () => {
		const config = PROVIDER_CONFIGURATION.find(
			(config) => config.id === props.provider?.toLowerCase(),
		);

		if (!config) return {};

		const initialValidity: Record<string, boolean> = {};
		const defaults = config.fields.reduce(
			(acc, field) => {
				acc[field.key] = "";
				initialValidity[field.key] = false;
				return acc;
			},
			{} as Record<string, string>,
		);

		setFieldsValidity(initialValidity);
		return defaults;
	};

	createEffect(() => {
		const config = PROVIDER_CONFIGURATION.find(
			(config) => config.id === props.provider?.toLowerCase(),
		);
		setProviderConfig(config || null);
	});

	const form = createForm(() => ({
		defaultValues: getDefaultValues(),
		onSubmit: async ({ value }) => {
			console.log("submit", value);
			await invoke("save_credentials", {
				creds: {
					type: props.provider,
					...value,
				},
			});
		},
	}));

	const validateField = (value: string, fieldName: string): boolean => {
		const isFieldValid = value.length > 0;
		setFieldsValidity((prev) => ({ ...prev, [fieldName]: isFieldValid }));
		return isFieldValid;
	};

	const isFormValid = () => {
		const validity = fieldsValidity();
		const config = providerConfig();
		if (!config) return false;

		return config.fields
			.filter((field) => field.required)
			.every((field) => validity[field.key]);
	};

	return (
		<form
			class="flex gap-1"
			onSubmit={(e) => {
				e.preventDefault();
				if (isFormValid()) {
					form.handleSubmit();
				}
			}}
		>
			<div class="flex flex-col gap-1">
				<For each={providerConfig()?.fields || []}>
					{(fieldConfig) => (
						<form.Field name={fieldConfig.key}>
							{(field) => {
								const currentFieldConfig = () => fieldConfig;

								return (
									<TextField>
										<TextFieldInput
											id={field().name}
											name={field().name}
											type={currentFieldConfig().type}
											placeholder={currentFieldConfig().placeholder || ""}
											value={field().state.value}
											onBlur={() =>
												validateField(
													field().state.value,
													currentFieldConfig().key,
												)
											}
											onInput={(e) => {
												validateField(
													e.currentTarget.value,
													currentFieldConfig().key,
												);
											}}
											onKeyDown={(e) => {
												if (e.key === " " || e.code === "Space") {
													e.preventDefault();
												}
											}}
											onChange={(e) => {
												field().handleChange(e.target.value);
											}}
											required={currentFieldConfig().required}
										/>
									</TextField>
								);
							}}
						</form.Field>
					)}
				</For>
			</div>

			<form.Subscribe
				selector={(state) => ({
					isSubmitting: state.isSubmitting,
					isDirty: state.isDirty,
				})}
			>
				{(state) => (
					<div class="flex flex-col justify-end">
						<ComponentTooltip
							content={!isFormValid() && "Please fill in all required fields"}
							placement="top"
						>
							<Button
								type="submit"
								variant="outline"
								disabled={
									!state().isDirty || state().isSubmitting || !isFormValid()
								}
							>
								{state().isSubmitting ? "Submitting..." : "Save"}
							</Button>
						</ComponentTooltip>
					</div>
				)}
			</form.Subscribe>
		</form>
	);
}
