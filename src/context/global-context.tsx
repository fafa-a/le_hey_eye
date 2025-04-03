import { createContext, type JSX, useContext } from "solid-js";
import type { TopicsStore } from "./topics-context";
import type { UIStore } from "@/store/ui";
import * as UI from "@/store/ui";
import * as Topics from "@/store/topics";

interface GlobalStore {
	topics: TopicsStore;
	ui: UIStore;
}

const GlobalContext = createContext<GlobalStore>();

export function GlobalProvider(props: { children: JSX.Element }) {
	const value: GlobalStore = {
		topics: Topics,
		ui: UI,
	};
	return (
		<GlobalContext.Provider value={value}>
			{props.children}
		</GlobalContext.Provider>
	);
}

export function useGlobalContext() {
	const context = useContext(GlobalContext);
	if (!context) {
		throw new Error("useGlobalContext must be used within a GlobalContext");
	}
	return context;
}
