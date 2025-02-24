import { createContext, useContext, type JSX } from "solid-js";
import { createStore } from "solid-js/store";
import type { MessageRole } from "types/cloudflare";
import { uid } from "uid";

const generateRandomColor = () => {
	const colors = ["red", "blue", "green", "yellow", "purple", "pink", "indigo"];
	const shades = ["200", "300", "400", "500"];

	const randomColor = colors[Math.floor(Math.random() * colors.length)];
	const randomShade = shades[Math.floor(Math.random() * shades.length)];
	return `bg-${randomColor}-${randomShade}`;
};

export interface TopicMessage {
	id: string;
	role: MessageRole;
	content: string;
	timestamp: Date;
	tokens_used?: number;
}

interface Topic {
	id: string;
	name: string;
	createdAt: Date;
	messages: TopicMessage[];
	bgColor: string;
}

interface TopicsContextValue {
	topics: Topic[];
	addTopic: (topic: Omit<Topic, "createdAt" | "messages" | "bgColor">) => void;
	removeTopic: (id: string) => void;
	editTopicName: (id: string, name: string) => void;
	addMessage: (topicId: string, message: Omit<TopicMessage, "id">) => void;
	removeMessage: (topicId: string, messageId: string) => void;
}

const TopicsContext = createContext<TopicsContextValue>();

const systemMessage: TopicMessage = {
	id: uid(16),
	role: "system",
	content: "You are a helpful assistant.",
	timestamp: new Date(),
};

const initialTopic: Topic = {
	id: uid(16),
	name: "New Topic",
	createdAt: new Date(),
	messages: [systemMessage],
	bgColor: generateRandomColor(),
};

export function TopicsProvider(props: { children: JSX.Element }) {
	const [topics, setTopics] = createStore<Topic[]>([initialTopic]);

	const addTopic = (
		topic: Omit<Topic, "createdAt" | "messages" | "bgColor">,
	) => {
		setTopics((prev) => [
			...prev,
			{
				...topic,
				createdAt: new Date(),
				messages: [systemMessage],
				bgColor: generateRandomColor(),
			},
		]);
	};

	const removeTopic = (id: string) => {
		setTopics((prev) => prev.filter((topic) => topic.id !== id));
	};

	const editTopicName = (id: string, name: string) => {
		setTopics((topic) => topic.id === id, "name", name);
	};

	const addMessage = (topicId: string, message: Omit<TopicMessage, "id">) => {
		const newMessage: TopicMessage = {
			id: uid(16),
			...message,
		};

		setTopics(
			(topic) => topic.id === topicId,
			"messages",
			(messages) => [...messages, newMessage],
		);
	};

	const removeMessage = (topicId: string, messageId: string) => {
		setTopics(
			(topic) => topic.id === topicId,
			"messages",
			(messages) => messages.filter((message) => message.id !== messageId),
		);
	};

	const value: TopicsContextValue = {
		topics,
		addTopic,
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
