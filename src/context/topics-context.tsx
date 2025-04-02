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
import { emit } from "@tauri-apps/api/event";
import { dbApi } from "../../shared/api.ts";
import type {
	Topic as TopicType,
	Message as TopicMessageType,
	Role as ChatRole,
} from "../../shared/types";

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
		topic: Omit<Topic, "createdAt" | "messages" | "lastAccessedAt">,
	) => void;
	removeTopic: (id: number) => void;
	editTopicName: (id: number, name: string) => void;
	addMessage: (message: Omit<TopicMessage, "id">) => void;
	removeMessages: (messageId: number[], pairId: string) => void;
	currentTopicId: Accessor<number>;
	setCurrentTopic: (id: number) => Promise<void>;
	highlightedMessagePair: Accessor<string | null>;
	setHighlightedMessagePair: Setter<string | null>;
	regenerateMessage: (messageId: number) => Promise<void>;
	currentTopicMessages: () => TopicMessage[];
}

const TopicsContext = createContext<TopicsContextValue>();

export function TopicsProvider(props: { children: JSX.Element }) {
	const [topics, setTopics] = createStore<Topic[]>([]);
	const [loading, setLoading] = createSignal(false);
	const [currentTopicId, setCurrentTopicId] = createSignal<number>(1);
	const [highlightedMessagePair, setHighlightedMessagePair] = createSignal<
		string | null
	>(null);

	const [messagesByTopicId, setMessagesByTopicId] = createStore<
		Record<number, TopicMessage[]>
	>({});

	const loadTopics = async () => {
		setLoading(true);
		try {
			const topicsData = await dbApi.getAllTopics();
			console.log("topicsData: ", topicsData);
			const loadedTopics: Topic[] = [];
			const loadedMessagesByTopicId: Record<string, TopicMessage[]> = {};

			await Promise.all(
				topicsData.map(async (topic) => {
					const messagesData = await dbApi.getMessagesByTopic(topic.id);

					const messages: TopicMessage[] = (() => {
						let currentPairId = "";
						let lastUserMessageId: string | null = null;

						return messagesData.map((msg, index) => {
							if (msg.role === "user") {
								lastUserMessageId = msg.id.toString();
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
								createdAt: new Date(msg.createdAt).toISOString(),
								updatedAt: new Date(
									msg.updatedAt || msg.createdAt,
								).toISOString(),
								tokensUsed: msg.tokensUsed,
								pairId: currentPairId,
							};
						});
					})();

					loadedMessagesByTopicId[topic.id] = messages;
					loadedTopics.push({
						id: topic.id,
						name: topic.name,
						createdAt: new Date(topic.createdAt).toISOString(),
						messages,
						lastAccessedAt: new Date(topic.lastAccessedAt).toISOString(),
					});
				}),
			);

			batch(() => {
				setTopics(loadedTopics);
				setMessagesByTopicId(loadedMessagesByTopicId);
			});

			try {
				const lastAccessedId = await dbApi.getLastAccessedTopic();
				if (lastAccessedId) {
					setCurrentTopicId(lastAccessedId);
				}
			} catch (error) {
				console.error("Failed to get last topic active at:", error);
			}

			if (loadedTopics.length === 0) {
				try {
					const topic = await dbApi.addTopic("New Conversation");

					setTopics(topic);
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

	const setCurrentTopic = async (id: number) => {
		if (!id || +id === currentTopicId()) return;

		try {
			updateTopicAccess(id);
			const now = new Date().toISOString();
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

		try {
			const newTopic = await dbApi.addTopic(topic.name);

			setTopics((prev) => [
				{
					...newTopic,
					messages: [],
					bgColor,
				},
				...prev,
			]);
			setCurrentTopicId(newTopic.id);
		} catch (error) {
			console.error("Failed to add topic:", error);
		}
	};

	const removeTopic = async (id: number) => {
		try {
			await dbApi.removeTopic(id);

			setTopics((prev) => prev.filter((topic) => topic.id !== id));
		} catch (error) {
			console.error("Failed to remove topic:", error);
			throw error;
		}
	};

	const updateTopicAccess = async (topicId: number) => {
		try {
			await dbApi.updateTopicAccess(topicId);
		} catch (error) {
			console.error("Failed to update topic access:", error);
			throw error;
		}
	};

	const editTopicName = async (id: number, name: string) => {
		try {
			await dbApi.editTopicName(id, name);

			setTopics((topic) => topic.id === id, "name", name);
		} catch (error) {
			console.error("Failed to edit topic name:", error);
			throw error;
		}
	};

	const addMessage = async (message: Omit<TopicMessage, "id">) => {
		const newMessage = {
			...message,
		};

		const contentStr =
			typeof newMessage.content === "string"
				? newMessage.content
				: JSON.stringify(newMessage.content);

		try {
			const result = await dbApi.addMessage(
				+newMessage.topicId,
				newMessage.role,
				contentStr,
			);
			const pairId =
				newMessage.role === "user" ? `pair-${result.id}` : `pair-${result.id}`;

			const message = {
				...result,
				pairId,
			};

			batch(() => {
				setTopics(
					(topic) => topic.id === message.topicId,
					produce((topic: Topic) => {
						topic.messages.push(message);
					}),
				);
				setMessagesByTopicId(message.topicId, (prev = []) => [
					...prev,
					message,
				]);
			});

			emit("message-added");
		} catch (error) {
			console.error("Failed to add message:", error);
			throw error;
		}
	};

	const removeMessages = async (messageIds: number[]) => {
		try {
			await dbApi.removeMessages(messageIds);
			if (currentTopicId() !== undefined) {
				const topicMessages = await dbApi.getMessagesByTopic(currentTopicId());
				const topicMessagesWithPairId = topicMessages.map((msg) => {
					const pairId =
						msg.role === "user" ? `pair-${msg.id}` : `pair-${msg.id}`;
					return {
						...msg,
						pairId,
					};
				});

				//TODO maybe you can simplify this 2 times same thing
				batch(() => {
					setTopics(
						(topic) => topic.id === currentTopicId(),
						"messages",
						() => topicMessagesWithPairId,
					);
					setMessagesByTopicId(currentTopicId(), () => topicMessagesWithPairId);
				});
			}
		} catch (error) {
			console.error("Failed to remove message:", error);
			throw error;
		}
	};

	const regenerateMessage = async (messageId: number) => {
		console.log("regenerateMessage", messageId);
		// try {
		// 	removeMessage(messageId);
		// } catch (error) {
		// 	console.error("Failed to regenerate message:", error);
		// 	throw error;
		// }
	};

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
		regenerateMessage,
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
