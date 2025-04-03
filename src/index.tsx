/* @refresh reload */
import { render } from "solid-js/web";
import App from "./app";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";

import { GlobalProvider } from "./context/global-context.tsx";

const queryClient = new QueryClient();

render(
	() => (
		<GlobalProvider>
			<QueryClientProvider client={queryClient}>
				<App />
			</QueryClientProvider>
		</GlobalProvider>
	),
	document.getElementById("root") as HTMLElement,
);
