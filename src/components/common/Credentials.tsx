import { createSignal } from "solid-js";

interface CredentialsProps {
	onClose: () => void;
}

export const Credentials = (props: CredentialsProps) => {
	const [apiToken, setApiToken] = createSignal("");
	const [accountId, setAccountId] = createSignal("");

	const handleSubmit = () => {
		// Envoyez les informations d'identification au serveur
		console.log("API Token:", apiToken());
		console.log("Account ID:", accountId());
		props.onClose();
	};

	//TODO
	//call save_credentials function

	return (
		<div class="fixed top-0 left-0 w-full h-full bg-gray-100 bg-opacity-75 flex justify-center items-center">
			<div class="bg-white p-8 rounded-md shadow-lg max-w-md w-full">
				<h2 class="text-2xl font-bold mb-4 text-black">Credentials</h2>
				<div class="mb-4">
					<label class="block font-bold mb-2 text-black" for="apiToken">
						API Token
					</label>
					<input
						class="border rounded-md border-slate-500 px-4 py-2 w-full text-black bg-gray-100 focus:bg-white focus:border-blue-500 transition-colors"
						type="password"
						id="apiToken"
						value={apiToken()}
						onInput={(e) => setApiToken(e.currentTarget.value)}
					/>
				</div>
				<div class="mb-4">
					<label class="block font-bold mb-2 text-black" for="accountId">
						Account ID
					</label>
					<input
						class="border rounded-md border-slate-500 px-4 py-2 w-full text-black bg-gray-100 focus:bg-white focus:border-blue-500 transition-colors"
						type="password"
						id="accountId"
						value={accountId()}
						onInput={(e) => setAccountId(e.currentTarget.value)}
					/>
				</div>
				<div class="flex justify-end">
					<button
						type="button"
						class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
						onClick={handleSubmit}
					>
						Submit
					</button>
					<button
						type="button"
						class="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded ml-4 transition-colors"
						onClick={props.onClose}
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
};
