import {
	type Accessor,
	createContext,
	createSignal,
	onMount,
	useContext,
	type JSX,
	type Setter,
	createMemo,
	batch,
} from "solid-js";
import { createStore, produce } from "solid-js/store";
import type {
	ChatRole,
	Topic as TopicType,
	TopicMessage as TopicMessageType,
	DbTopic,
	DbTopicMessage,
} from "types/core";
import { uid } from "uid";
import { invoke } from "@tauri-apps/api/core";
import { emit } from "@tauri-apps/api/event";

const generateRandomColor = () => {
	const colors = ["red", "blue", "green", "yellow", "purple", "pink", "indigo"];
	const shades = ["200", "300", "400", "500"];

	const randomColor = colors[Math.floor(Math.random() * colors.length)];
	const randomShade = shades[Math.floor(Math.random() * shades.length)];
	return `bg-${randomColor}-${randomShade}`;
};

export type TopicMessage = TopicMessageType & { pairId: string };
export type Topic = TopicType & { messages: TopicMessage[] };

interface TopicsContextValue {
	loading: Accessor<boolean>;
	topics: Topic[];
	addTopic: (
		topic: Omit<Topic, "createdAt" | "messages" | "bgColor" | "lastAccessedAt">,
	) => void;
	removeTopic: (id: string) => void;
	editTopicName: (id: string, name: string) => void;
	addMessage: (message: Omit<TopicMessage, "id">) => void;
	removeMessages: (messageId: string, pairId: string) => void;
	currentTopicId: Accessor<string | undefined>;
	setCurrentTopic: (id: string) => Promise<void>;
	highlightedMessagePair: Accessor<string | null>;
	setHighlightedMessagePair: Setter<string | null>;
	regenerateMessage: (messageId: string) => Promise<void>;
	currentTopicMessages: () => TopicMessage[];
}

const TopicsContext = createContext<TopicsContextValue>();

export function TopicsProvider(props: { children: JSX.Element }) {
	const [topics, setTopics] = createStore<Topic[]>([]);
	const [loading, setLoading] = createSignal(false);
	const [currentTopicId, setCurrentTopicId] = createSignal<string | undefined>(
		undefined,
	);
	const [highlightedMessagePair, setHighlightedMessagePair] = createSignal<
		number | null
	>(null);

	const [messagesByTopicId, setMessagesByTopicId] = createStore<
		Record<string, TopicMessage[]>
	>({});

	const loadTopics = async () => {
		setLoading(true);
		try {
			const topicsData = await invoke<DbTopic[]>("get_all_topics");
			console.log("topicsData: ", topicsData);
			const loadedTopics: Topic[] = [];
			const loadedMessagesByTopicId: Record<string, TopicMessage[]> = {};

			await Promise.all(
				topicsData.map(async (topic) => {
					const messagesData = await invoke<DbTopicMessage[]>(
						"get_messages_by_topic",
						{
							topicId: topic.id,
						},
					);

					const messages: TopicMessage[] = (() => {
						let currentPairId = "";
						let lastUserMessageId: string | null = null;

						return messagesData.map((msg, index) => {
							if (msg.role === "user") {
								lastUserMessageId = msg.id;
								currentPairId = `pair-${msg.id}`;
							} else if (msg.role === "assistant") {
								if (
									lastUserMessageId &&
									index > 0 &&
									messagesData[index - 1].role === "user"
								) {
								} else {
									currentPairId = `single-${msg.id}`;
								}
								lastUserMessageId = null;
							} else {
								currentPairId = `other-${msg.id}`;
							}

							return {
								id: msg.id,
								topicId: topic.id,
								role: msg.role as ChatRole,
								content: String(msg.content).startsWith("{")
									? JSON.parse(String(msg.content))
									: msg.content,
								timestamp: new Date(msg.timestamp),
								tokensUsed: msg.tokens_used,
								pairId: currentPairId,
							};
						});
					})();

					loadedMessagesByTopicId[topic.id] = messages;
					loadedTopics.push({
						id: topic.id,
						name: topic.name,
						createdAt: new Date(topic.created_at),
						messages,
						bgColor: topic.bg_color,
						lastAccessedAt: new Date(topic.last_accessed_at),
					});
				}),
			);

			batch(() => {
				setTopics(loadedTopics);
				setMessagesByTopicId(loadedMessagesByTopicId);
			});

			try {
				const lastAccessedId = await invoke<string | null>(
					"get_last_accessed_topic",
				);
				setCurrentTopicId(lastAccessedId as string);
			} catch (error) {
				console.error("Failed to get last topic active at:", error);
			}

			if (loadedTopics.length === 0) {
				const dateToISOString = new Date().toISOString();

				const defaultTopic: Omit<Topic, "createdAt" | "lastAccessedAt"> = {
					name: "New Conversation",
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

			batch(() => {
				setTopics(
					(topic) => topic.id === newMessage.topicId,
					produce((topic: Topic) => {
						topic.messages.push(newMessage);
					}),
				);
				setMessagesByTopicId(message.topicId, (prev = []) => [
					...prev,
					newMessage,
				]);
			});

			emit("message-added");
		} catch (error) {
			console.error("Failed to add message:", error);
			throw error;
		}
	};

	const removeMessages = async (messageIds: string[], pairId: string) => {
		try {
			await invoke("remove_messages", { messageIds });

			const topicMessages = await invoke<TopicMessage[]>(
				"get_messages_by_topic",
				{
					topicId: currentTopicId(),
				},
			);

			batch(() => {
				setTopics(
					(topic) => topic.id === currentTopicId(),
					"messages",
					() => topicMessages,
				);
				setMessagesByTopicId(currentTopicId() as string, (prev = []) =>
					prev.filter((msg) => msg.pairId !== pairId),
				);
			});
		} catch (error) {
			console.error("Failed to remove message:", error);
			throw error;
		}
	};

	const regenerateMessage = async (messageId: string) => {
		// try {
		// 	removeMessage(messageId);
		// 	const response = await invoke("send_message", {
		// 		provider,
		// 		model,
		// 		request,
		// 	});
		// } catch (error) {
		// 	console.error("Failed to regenerate message:", error);
		// 	throw error;
		// }
	};

	// const currentTopicMessages = () => {
	// 	const id = currentTopicId();
	// 	if (!id) return [];
	// 	return messagesStore[id] || [];
	// };

	const currentTopicMessages = createMemo(() => {
		const topicId = currentTopicId();
		if (!topicId) return [];

		return messagesByTopicId[topicId] || [];
	});

	const value: TopicsContextValue = {
		topics,
		loading,
		addTopic,
		currentTopicId,
		setCurrentTopic,
		removeTopic,
		editTopicName,
		addMessage,
		removeMessages,
		highlightedMessagePair,
		setHighlightedMessagePair,
		currentTopicMessages,
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
