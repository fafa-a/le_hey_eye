/* @refresh reload */
import { render } from "solid-js/web";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";

import { TopicsProvider } from "./context/topicsContext";

const queryClient = new QueryClient();

render(
	() => (
		<TopicsProvider>
			<QueryClientProvider client={queryClient}>
				<App />
			</QueryClientProvider>
		</TopicsProvider>
	),
	document.getElementById("root") as HTMLElement,
);
