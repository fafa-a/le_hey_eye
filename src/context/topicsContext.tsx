import {
	type Accessor,
	createContext,
	createSignal,
	onMount,
	useContext,
	type JSX,
} from "solid-js";
import { createStore, produce } from "solid-js/store";
import type {
	ChatRole,
	Topic as TopicType,
	TopicMessage,
	DbTopic,
	DbTopicMessage,
} from "types/core";
import { uid } from "uid";
import { invoke } from "@tauri-apps/api/core";

const generateRandomColor = () => {
	const colors = ["red", "blue", "green", "yellow", "purple", "pink", "indigo"];
	const shades = ["200", "300", "400", "500"];

	const randomColor = colors[Math.floor(Math.random() * colors.length)];
	const randomShade = shades[Math.floor(Math.random() * shades.length)];
	return `bg-${randomColor}-${randomShade}`;
};

// interface Topic {
// 	id: string;
// 	name: string;
// 	createdAt: Date;
// 	messages: TopicMessage[];
// 	bgColor: string;
// 	lastAccessedAt: Date;
// }
type Topic = TopicType & { messages: TopicMessage[] };

interface TopicsContextValue {
	loading: Accessor<boolean>;
	topics: Topic[];
	addTopic: (
		topic: Omit<Topic, "createdAt" | "messages" | "bgColor" | "lastAccessedAt">,
	) => void;
	removeTopic: (id: string) => void;
	editTopicName: (id: string, name: string) => void;
	addMessage: (message: Omit<TopicMessage, "id">) => void;
	removeMessage: (messageId: string) => void;
	currentTopicId: Accessor<string | undefined>;
	setCurrentTopic: (id: string) => Promise<void>;
}

const TopicsContext = createContext<TopicsContextValue>();

export function TopicsProvider(props: { children: JSX.Element }) {
	const [topics, setTopics] = createStore<Topic[]>([]);
	const [loading, setLoading] = createSignal(false);
	const [currentTopicId, setCurrentTopicId] = createSignal<string | undefined>(
		undefined,
	);

	const loadTopics = async () => {
		setLoading(true);
		try {
			const topicsData = await invoke<DbTopic[]>("get_all_topics");
			console.log("topicsData: ", topicsData);
			const loadedTopics: Topic[] = [];

			for (const topic of topicsData) {
				const messagesData = await invoke<DbTopicMessage[]>(
					"get_messages_for_topic",
					{
						topicId: topic.id,
					},
				);

				const messages: TopicMessage[] = messagesData.map((msg) => ({
					id: msg.id,
					topicId: topic.id,
					role: msg.role as ChatRole,
					content: String(msg.content).startsWith("{")
						? JSON.parse(String(msg.content))
						: msg.content,
					timestamp: new Date(msg.timestamp),
					tokensUsed: msg.tokens_used,
				}));

				loadedTopics.push({
					id: topic.id,
					name: topic.name,
					createdAt: new Date(topic.created_at),
					messages,
					bgColor: topic.bg_color,
					lastAccessedAt: new Date(topic.last_accessed_at),
				});
			}

			setTopics(loadedTopics);

			try {
				const lastAccessedId = await invoke<string | null>(
					"get_last_accessed_topic",
				);
				setCurrentTopicId(lastAccessedId as string);
			} catch (error) {
				console.error("Failed to get last topic active at:", error);
			}

			if (loadedTopics.length === 0) {
				const initialTopicId = uid(16);
				const dateToISOString = new Date().toISOString();

				const defaultTopic: Omit<Topic, "createdAt" | "lastAccessedAt"> = {
					id: initialTopicId,
					name: "New Conversation",
					bgColor: generateRandomColor(),
					messages: [],
				};
				try {
					await invoke("add_topic", {
						...defaultTopic,
						createdAt: dateToISOString,
						lastAccessedAt: dateToISOString,
					});

					setTopics([
						{
							...defaultTopic,
							createdAt: new Date(),
							lastAccessedAt: new Date(),
						},
					]);
				} catch (error) {
					console.error("Failed to create initial topic:", error);
				}
			}
		} catch (error) {
			console.error("Failed to load topics:", error);
		} finally {
			setLoading(false);
		}
	};

	onMount(() => {
		loadTopics();
	});

	const setCurrentTopic = async (id: string) => {
		if (!id || id === currentTopicId()) return;

		try {
			updateTopicAccess(id);
			const now = new Date();
			setTopics((topic) => topic.id === id, "lastAccessedAt", now);

			setCurrentTopicId(id);
		} catch (error) {
			console.error("Failed to set current topic:", error);
		}
	};

	const addTopic = async (
		topic: Omit<Topic, "createdAt" | "messages" | "bgColor" | "lastAccessedAt">,
	) => {
		const bgColor = generateRandomColor();
		const now = new Date();

		try {
			await invoke("add_topic", {
				id: topic.id,
				name: topic.name,
				bgColor,
			});

			setTopics((prev) => [
				{
					...topic,
					createdAt: new Date(),
					messages: [],
					bgColor,
					lastAccessedAt: now,
				},
				...prev,
			]);
			setCurrentTopicId(topic.id);
		} catch (error) {
			console.error("Failed to add topic:", error);
		}
	};

	const removeTopic = async (id: string) => {
		try {
			await invoke("remove_topic", { topicId: id });

			setTopics((prev) => prev.filter((topic) => topic.id !== id));
		} catch (error) {
			console.error("Failed to remove topic:", error);
			throw error;
		}
	};

	const updateTopicAccess = async (topicId: string) => {
		try {
			await invoke("update_topic_access", { topicId });
		} catch (error) {
			console.error("Failed to update topic access:", error);
			throw error;
		}
	};

	const editTopicName = async (id: string, name: string) => {
		try {
			await invoke("edit_topic_name", { topicId: id, name });

			setTopics((topic) => topic.id === id, "name", name);
		} catch (error) {
			console.error("Failed to edit topic name:", error);
			throw error;
		}
	};

	const addMessage = async (message: Omit<TopicMessage, "id">) => {
		const newMessageId = uid(16);
		const newMessage: TopicMessage = {
			id: newMessageId,
			...message,
		};

		const contentStr =
			typeof newMessage.content === "string"
				? newMessage.content
				: JSON.stringify(newMessage.content);

		try {
			await invoke("add_message", {
				id: newMessageId,
				topicId: newMessage.topicId,
				role: newMessage.role,
				content: contentStr,
				tokensUsed: newMessage.tokensUsed,
			});

			setTopics(
				(topic) => topic.id === newMessage.topicId,
				produce((topic: Topic) => {
					topic.messages.push(newMessage);
				}),
			);
		} catch (error) {
			console.error("Failed to add message:", error);
			throw error;
		}
	};

	const removeMessage = async (messageId: string) => {
		try {
			await invoke("remove_message", { messageId });
			const topicMessages = await invoke<TopicMessage[]>(
				"get_messages_for_topic",
				{
					topicId: currentTopicId(),
				},
			);
			setTopics(
				(topic) => topic.id === currentTopicId(),
				"messages",
				() => topicMessages,
			);
		} catch (error) {
			console.error("Failed to remove message:", error);
			throw error;
		}
	};

	const value: TopicsContextValue = {
		topics,
		loading,
		addTopic,
		currentTopicId,
		setCurrentTopic,
		removeTopic,
		editTopicName,
		addMessage,
		removeMessage,
	};

	return (
		<TopicsContext.Provider value={value}>
			{props.children}
		</TopicsContext.Provider>
	);
}

export function useTopics() {
	const context = useContext(TopicsContext);
	if (!context) {
		throw new Error("useTopics must be used within a TopicsProvider");
	}
	return context;
}
