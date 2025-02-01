import { createSignal } from "solid-js";
import { invoke } from "@tauri-apps/api/core";

function App() {
	return (
		<main class="flex flex col items-center justify-center">
			<h1 class="text-4xl font-bold">Welcome to Tauri + Solid</h1>

			<form
				class="row"
				onSubmit={(e) => {
					e.preventDefault();
				}}
			>
				<input
					id="greet-input"
					onChange={(e) => {}}
					placeholder="Enter a name..."
				/>
				<button type="submit">Greet</button>
			</form>
		</main>
	);
}

export default App;
