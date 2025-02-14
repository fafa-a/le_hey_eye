import { createEffect } from "solid-js";
import { createStore, unwrap } from "solid-js/store";
import type { Message } from "types/cloudflare";
import { uid } from "uid";

export interface TopicMessage extends Message {
	id: string;
	timestamp: Date;
}

interface Topic {
	id: string;
	name: string;
	createdAt: Date;
	messages: TopicMessage[];
}

const [topicsStore, setTopicsStore] = createStore<Topic[]>([]);
const systemMessage: TopicMessage = {
	id: uid(16),
	role: "system",
	content:
		"You are a helpful assistant. If you send me some code, please format it with markdown.",
	timestamp: new Date(),
};

const addTopic = (topic: Omit<Topic, "createdAt" | "messages">) => {
	setTopicsStore((prev) => {
		console.log("Previous state:", prev);
		const newState = [
			...prev,
			{
				...topic,
				createdAt: new Date(),
				messages: [systemMessage],
			},
		];
		console.log("New state:", newState);
		return newState;
	});
};

const removeTopic = (id: string) => {
	console.log("removeTopic", id);
	setTopicsStore(topicsStore.filter((topic) => topic.id !== id));
};

const editTopicName = (id: string, name: string) => {
	console.log("editTopicName", id, name);
	setTopicsStore(
		topicsStore.map((topic) => {
			if (topic.id === id) {
				console.log("Topic found:", topic);
				return {
					...topic,
					name,
				};
			}
			console.log("Topic not found:", topic);
			return topic;
		}),
	);
};

const addMessage = (topicId: string, message: Omit<TopicMessage, "id">) => {
	const newMessage: TopicMessage = {
		id: uid(16),
		...message,
	};
	console.log(newMessage, topicId);
	setTopicsStore(
		topicsStore.map((topic) => {
			console.log("topic.id", topic.id);
			if (topic.id === topicId) {
				console.log("Topic found:", topic);
				return {
					...topic,
					messages: [...topic.messages, newMessage],
				};
			}
			console.log("Topic not found:", topic);
			return topic;
		}),
	);
};

const removeMessage = (topicId: string, messageId: string) => {
	setTopicsStore(
		topicsStore.map((topic) => {
			if (topic.id === topicId) {
				return {
					...topic,
					messages: topic.messages.filter(
						(message) => message.id !== messageId,
					),
				};
			}
			return topic;
		}),
	);
};

createEffect(() => {
	console.log("topicsStore", unwrap(topicsStore));
});

export {
	topicsStore,
	addTopic,
	removeTopic,
	editTopicName,
	addMessage,
	removeMessage,
};
