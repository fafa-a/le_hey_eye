import { Button } from "@/components/ui/button";
import { TextField, TextFieldRoot } from "@/components/ui/textfield";
import { invoke } from "@tauri-apps/api/core";
import { createEffect, createSignal } from "solid-js";

interface ProviderFormProps {
	provider: string;
}

export default function ProviderForm(props: ProviderFormProps) {
	const [accountId, setAccountId] = createSignal("");
	const [apiToken, setApiToken] = createSignal("");

	createEffect(() => {
		console.log("accountId", accountId());
		console.log("apiToken", apiToken());
	});

	return (
		<div class="flex flex-col gap-2">
			{/* <TextFieldRoot> */}
			{/* <TextField placeholder="API Key" type="password" /> */}
			{/* </TextFieldRoot> */}
			<form
				class="flex flex-col gap-2"
				onSubmit={(e) => {
					e.preventDefault();
					console.log("submit");
					invoke("save_credentials", {
						creds: {
							type: props.provider,
							account_id: accountId(),
							api_token: apiToken(),
						},
					});
				}}
			>
				<TextFieldRoot>
					<TextField
						placeholder="Account ID"
						onChange={(e) => setAccountId(e.target.value)}
					/>
				</TextFieldRoot>
				<TextFieldRoot>
					<TextField
						placeholder="API Token"
						type="password"
						onChange={(e) => setApiToken(e.target.value)}
					/>
				</TextFieldRoot>
				<Button type="submit" variant="outline">
					Submit
				</Button>
			</form>
		</div>
	);
}
