import type { UIStore } from "@/store/ui";
import * as UI from "@/store/ui";
import * as Topics from "@store/topics";
import type { TopicsStore } from "@store/topics";
import { type JSX, createContext, useContext } from "solid-js";

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
