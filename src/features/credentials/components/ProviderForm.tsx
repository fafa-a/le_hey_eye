import { Button } from "@/components/ui/button";
import { TextField, TextFieldRoot } from "@/components/ui/textfield";
import { invoke } from "@tauri-apps/api/core";
import { createForm } from "@tanstack/solid-form";
import { createEffect, createSignal, For } from "solid-js";
import { PROVIDER_CONFIGURATION } from "@/features/credentials/constants/provider.configuration";
import type { ProviderFormConfig } from "../types/provider.types";

interface ProviderFormProps {
	provider: string;
}

export default function ProviderForm(props: ProviderFormProps) {
	// Stocke la configuration complète du provider sélectionné
	const [providerConfig, setProviderConfig] =
		createSignal<ProviderFormConfig | null>(null);

	// Map pour stocker l'état de validation de chaque champ
	const [fieldsValidity, setFieldsValidity] = createSignal<
		Record<string, boolean>
	>({});

	// Prépare les valeurs par défaut pour le formulaire
	const getDefaultValues = () => {
		const config = PROVIDER_CONFIGURATION.find(
			(config) => config.id === props.provider?.toLowerCase(),
		);

		if (!config) return {};

		// Initialise l'état de validation
		const initialValidity: Record<string, boolean> = {};

		// Crée un objet avec tous les champs initialisés à des valeurs vides
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

	// Initialise la configuration du provider
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
					...value, // Envoie tous les champs configurés
				},
			});
		},
	}));

	const validateField = (value: string, fieldName: string): boolean => {
		const isFieldValid = value.length > 0;
		setFieldsValidity((prev) => ({ ...prev, [fieldName]: isFieldValid }));
		return isFieldValid;
	};

	// Vérifie si tous les champs requis sont valides
	const isFormValid = () => {
		const validity = fieldsValidity();
		const config = providerConfig();
		if (!config) return false;

		// Vérifie que tous les champs requis sont valides
		return config.fields
			.filter((field) => field.required)
			.every((field) => validity[field.key]);
	};

	return (
		<div class="flex flex-col gap-1">
			<h2 class="text-xl font-semibold">
				Configure {providerConfig()?.name || props.provider} Provider
			</h2>

			<form
				class="flex flex-col gap-1"
				onSubmit={(e) => {
					e.preventDefault();
					if (isFormValid()) {
						form.handleSubmit();
					}
				}}
			>
				{/* Génère dynamiquement les champs à partir de la configuration */}
				<For each={providerConfig()?.fields || []}>
					{(fieldConfig) => (
						<div>
							<form.Field name={fieldConfig.key}>
								{(field) => {
									// Crée un mémo pour la configuration du champ actuel
									const currentFieldConfig = () => fieldConfig;

									return (
										<TextFieldRoot>
											<TextField
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
										</TextFieldRoot>
									);
								}}
							</form.Field>
						</div>
					)}
				</For>

				<form.Subscribe
					selector={(state) => ({
						isSubmitting: state.isSubmitting,
						isDirty: state.isDirty,
					})}
				>
					{(state) => (
						<Button
							type="submit"
							variant="outline"
							disabled={
								!state().isDirty || state().isSubmitting || !isFormValid()
							}
							class="mt-2"
						>
							{state().isSubmitting ? "Submitting..." : "Save"}
						</Button>
					)}
				</form.Subscribe>
			</form>
		</div>
	);
}
// export default function ProviderForm(props: ProviderFormProps) {
// 	const [isValid, setIsValid] = createSignal({
// 		accountId: false,
// 		apiToken: false,
// 	});
// 	const [providerConfig, setProviderConfig] = createSignal<
// 		{
// 			key: string;
// 			label: string;
// 			type: "text" | "password" | "select" | "number";
// 			required: boolean;
// 			placeholder: string;
// 		}[]
// 	>([]);
//
// 	createEffect(() => {
// 		setProviderConfig(
// 			PROVIDER_CONFIGURATION.find(
// 				(config) => config.id === props.provider?.toLocaleLowerCase(),
// 			)?.fields?.map((field) => ({
// 				key: field.key,
// 				label: field.label,
// 				type: field.type,
// 				required: field.required,
// 				placeholder: field.placeholder || "",
// 			})) || [],
// 		);
// 	});
//
// 	createEffect(() => {
// 		console.log("providerConfig", providerConfig());
// 	});
//
// 	const form = createForm(() => ({
// 		defaultValues: {
// 			accountId: "",
// 			apiToken: "",
// 		},
// 		onSubmit: async ({ value }) => {
// 			console.log("submit", value);
// 			await invoke("save_credentials", {
// 				creds: {
// 					type: props.provider,
// 					account_id: value.accountId,
// 					api_token: value.apiToken,
// 				},
// 			});
// 		},
// 	}));
//
// 	const validateField = (
// 		value: string,
// 		fieldName: "accountId" | "apiToken",
// 	): boolean => {
// 		const isFieldValid = value.length > 0;
// 		setIsValid((prev) => ({ ...prev, [fieldName]: isFieldValid }));
// 		return isFieldValid;
// 	};
// 	createEffect(() => {
// 		console.log("form", form.getFieldValue("accountId"));
// 		validateField(form.getFieldValue("accountId"), "accountId");
// 		validateField(form.getFieldValue("apiToken"), "apiToken");
// 	});
//
// 	const isFormValid = () => isValid().accountId && isValid().apiToken;
//
// 	return (
// 		<div class="flex flex-col gap-1">
// 			<h2 class="text-xl font-semibold">Configure {props.provider} Provider</h2>
//
// 			<form
// 				class="flex flex-col gap-1"
// 				onSubmit={(e) => {
// 					e.preventDefault();
// 					if (isFormValid()) {
// 						form.handleSubmit();
// 					}
// 				}}
// 			>
// 				<div>
// 					<form.Field name="accountId">
// 						{(field) => (
// 							<TextFieldRoot>
// 								<TextField
// 									id={field().name}
// 									name={field().name}
// 									type={
// 										providerConfig().find((f) => f.key === field().name)?.type
// 									}
// 									placeholder={
// 										providerConfig().find((f) => f.key === field().name)
// 											?.placeholder
// 									}
// 									value={field().state.value}
// 									onBlur={() => validateField(field().state.value, "accountId")}
// 									onInput={(e) => {
// 										validateField(e.currentTarget.value, "accountId");
// 									}}
// 									onKeyDown={(e) => {
// 										if (e.key === " " || e.code === "Space") {
// 											e.preventDefault();
// 										}
// 									}}
// 									onChange={(e) => {
// 										field().handleChange(e.target.value);
// 									}}
// 									required={
// 										providerConfig().find((f) => f.key === field().name)
// 											?.required
// 									}
// 								/>
// 							</TextFieldRoot>
// 						)}
// 					</form.Field>
// 				</div>
//
// 				<div>
// 					<form.Field name="apiToken">
// 						{(field) => (
// 							<TextFieldRoot>
// 								<TextField
// 									id={field().name}
// 									name={field().name}
// 									type={
// 										providerConfig().find((f) => f.key === field().name)?.type
// 									}
// 									placeholder={
// 										providerConfig().find((f) => f.key === field().name)
// 											?.placeholder
// 									}
// 									value={field().state.value}
// 									onBlur={() => validateField(field().state.value, "apiToken")}
// 									onInput={(e) => {
// 										validateField(e.currentTarget.value, "apiToken");
// 									}}
// 									onKeyDown={(e) => {
// 										if (e.key === " " || e.code === "Space") {
// 											e.preventDefault();
// 										}
// 									}}
// 									onChange={(e) => {
// 										field().handleChange(e.target.value);
// 									}}
// 									required={
// 										providerConfig().find((f) => f.key === field().name)
// 											?.required
// 									}
// 								/>
// 							</TextFieldRoot>
// 						)}
// 					</form.Field>
// 				</div>
//
// 				<form.Subscribe
// 					selector={(state) => ({
// 						isSubmitting: state.isSubmitting,
// 						isDirty: state.isDirty,
// 					})}
// 				>
// 					{(state) => (
// 						<Button
// 							type="submit"
// 							variant="outline"
// 							disabled={
// 								!state().isDirty || state().isSubmitting || !isFormValid()
// 							}
// 							class="mt-2"
// 						>
// 							{state().isSubmitting ? "Submitting..." : "Save"}
// 						</Button>
// 					)}
// 				</form.Subscribe>
// 			</form>
// 		</div>
// 	);
// }
