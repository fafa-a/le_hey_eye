/* @refresh reload */
import { render } from "solid-js/web";
import App from "./app";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";

import { TopicsProvider } from "./context/topics-context";

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
