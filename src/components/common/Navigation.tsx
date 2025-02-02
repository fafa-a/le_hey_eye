import { createSignal } from "solid-js";
import { Credentials } from "./Credentials";

export const Navigation = () => {
	const [showCredentials, setShowCredentials] = createSignal(false);

	const toggleCredentials = () => {
		setShowCredentials(!showCredentials());
	};

	return (
		<div class="bg-gray-800 text-white py-4 px-6 flex justify-between items-center">
			<div class="text-xl font-bold">Le Hey Eye</div>
			<button
				type="button"
				class="p-2 hover:bg-gray-700 rounded-md"
				onClick={toggleCredentials}
			>
				<svg
					class="h-6 w-6 fill-current"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<title>Settings</title>
					<path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14H7v-2h3v2zm0-4H7v-2h3v2zm0-4H7V7h3v2zm4 8h-3v-2h3v2zm0-4h-3v-2h3v2zm0-4h-3V7h3v2z" />
				</svg>
			</button>
			{showCredentials() && <Credentials onClose={toggleCredentials} />}
		</div>
	);
};
