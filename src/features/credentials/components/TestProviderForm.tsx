import { Button } from "@/components/ui/button";
import { TextField, TextFieldRoot } from "@/components/ui/textfield";
import { invoke } from "@tauri-apps/api/core";
import { createForm } from "@tanstack/solid-form";
import { createEffect, createSignal } from "solid-js";

interface ProviderFormProps {
	provider: string;
}

export default function ProviderForm(props: ProviderFormProps) {
	const [isValid, setIsValid] = createSignal({
		accountId: false,
		apiToken: false,
	});

	const form = createForm(() => ({
		defaultValues: {
			accountId: "",
			apiToken: "",
		},
		onSubmit: async ({ value }) => {
			console.log("submit", value);
			await invoke("save_credentials", {
				creds: {
					type: props.provider,
					account_id: value.accountId,
					api_token: value.apiToken,
				},
			});
		},
	}));

	const validateField = (
		value: string,
		fieldName: "accountId" | "apiToken",
	): boolean => {
		const isFieldValid = value.length > 0;
		setIsValid((prev) => ({ ...prev, [fieldName]: isFieldValid }));
		return isFieldValid;
	};
	createEffect(() => {
		console.log("form", form.getFieldValue("accountId"));
		validateField(form.getFieldValue("accountId"), "accountId");
		validateField(form.getFieldValue("apiToken"), "apiToken");
	});

	const isFormValid = () => isValid().accountId && isValid().apiToken;

	return (
		<div class="flex flex-col gap-1">
			<h2 class="text-xl font-semibold">Configure {props.provider} Provider</h2>

			<form
				class="flex flex-col gap-1"
				onSubmit={(e) => {
					e.preventDefault();
					if (isFormValid()) {
						form.handleSubmit();
					}
				}}
			>
				<div>
					<form.Field name="accountId">
						{(field) => (
							<TextFieldRoot>
								<TextField
									id={field().name}
									name={field().name}
									placeholder="Enter your account ID"
									value={field().state.value}
									onBlur={() => validateField(field().state.value, "accountId")}
									onInput={(e) => {
										validateField(e.currentTarget.value, "accountId");
									}}
									onKeyDown={(e) => {
										if (e.key === " " || e.code === "Space") {
											e.preventDefault();
										}
									}}
									onChange={(e) => {
										field().handleChange(e.target.value);
									}}
								/>
							</TextFieldRoot>
						)}
					</form.Field>
				</div>

				<div>
					<form.Field name="apiToken">
						{(field) => (
							<TextFieldRoot>
								<TextField
									id={field().name}
									name={field().name}
									type="password"
									placeholder="Enter your API token"
									value={field().state.value}
									onBlur={() => validateField(field().state.value, "apiToken")}
									onInput={(e) => {
										validateField(e.currentTarget.value, "apiToken");
									}}
									onKeyDown={(e) => {
										if (e.key === " " || e.code === "Space") {
											e.preventDefault();
										}
									}}
									onChange={(e) => {
										field().handleChange(e.target.value);
									}}
								/>
							</TextFieldRoot>
						)}
					</form.Field>
				</div>

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
