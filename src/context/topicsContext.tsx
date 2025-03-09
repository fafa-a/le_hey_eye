import {
	type Accessor,
	createContext,
	createSignal,
	onMount,
	useContext,
	type JSX,
} from "solid-js";
import { createStore } from "solid-js/store";
import type { ChatRole, ContentType } from "types/core";
import { uid } from "uid";
import { invoke } from "@tauri-apps/api/core";

const generateRandomColor = () => {
	const colors = ["red", "blue", "green", "yellow", "purple", "pink", "indigo"];
	const shades = ["200", "300", "400", "500"];

	const randomColor = colors[Math.floor(Math.random() * colors.length)];
	const randomShade = shades[Math.floor(Math.random() * shades.length)];
	return `bg-${randomColor}-${randomShade}`;
};

export interface TopicMessage {
	id: string;
	role: ChatRole;
	content: ContentType;
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
	loading: Accessor<boolean>;
	topics: Topic[];
	addTopic: (topic: Omit<Topic, "createdAt" | "messages" | "bgColor">) => void;
	removeTopic: (id: string) => void;
	editTopicName: (id: string, name: string) => void;
	addMessage: (topicId: string, message: Omit<TopicMessage, "id">) => void;
	removeMessage: (topicId: string, messageId: string) => void;
}

const TopicsContext = createContext<TopicsContextValue>();

// const systemMessage: TopicMessage = {
// 	id: uid(16),
// 	role: "system",
// 	content: "You are a helpful assistant.",
// 	timestamp: new Date(),
// };

const initialTopic: Topic = {
	id: uid(16),
	name: "New Topic",
	createdAt: new Date(),
	messages: [],
	bgColor: generateRandomColor(),
};

export function TopicsProvider(props: { children: JSX.Element }) {
	const [topics, setTopics] = createStore<Topic[]>([initialTopic]);
	const [loading, setLoading] = createSignal(false);
	// Fonction pour charger les sujets depuis la base de données
	const loadTopics = async () => {
		setLoading(true);
		try {
			// Appel à la fonction Rust pour obtenir tous les sujets
			const topicsData = await invoke<any[]>("get_all_topics");

			// Traitement des données pour les adapter à votre format
			const loadedTopics: Topic[] = [];

			for (const topic of topicsData) {
				// Appel à la fonction Rust pour obtenir les messages d'un sujet
				const messagesData = await invoke<any[]>("get_messages_for_topic", {
					topicId: topic.id,
				});

				// Conversion des messages
				const messages: TopicMessage[] = messagesData.map((msg) => ({
					id: msg.id,
					role: msg.role as ChatRole,
					content: msg.content.startsWith("{")
						? JSON.parse(msg.content)
						: msg.content,
					timestamp: new Date(msg.timestamp),
					tokens_used: msg.tokens_used,
				}));

				// Ajout du sujet avec ses messages
				loadedTopics.push({
					id: topic.id,
					name: topic.name,
					createdAt: new Date(topic.created_at),
					messages,
					bgColor: topic.bg_color,
				});
			}

			// Mise à jour du store avec les données chargées
			setTopics(loadedTopics);
		} catch (error) {
			console.error("Failed to load topics:", error);

			// Si aucun sujet n'est chargé, créer un sujet initial
			if (topics.length === 0) {
				const initialTopicId = uid(16);
				try {
					await invoke("add_topic", {
						id: initialTopicId,
						name: "New Topic",
						bgColor: generateRandomColor(),
					});

					setTopics([
						{
							id: initialTopicId,
							name: "New Topic",
							createdAt: new Date(),
							messages: [],
							bgColor: generateRandomColor(),
						},
					]);
				} catch (addError) {
					console.error("Failed to create initial topic:", addError);
				}
			}
		} finally {
			setLoading(false);
		}
	};

	// Chargement des données au montage du composant
	onMount(() => {
		loadTopics();
	});

	const addTopic = async (
		topic: Omit<Topic, "createdAt" | "messages" | "bgColor">,
	) => {
		const bgColor = generateRandomColor();

		try {
			// Appel à la fonction Rust pour ajouter un sujet
			await invoke("add_topic", {
				id: topic.id,
				name: topic.name,
				bgColor,
			});
			console.log("addtopic", topic);
			// Mise à jour du store après l'ajout dans la BD
			setTopics((prev) => [
				...prev,
				{
					...topic,
					createdAt: new Date(),
					messages: [],
					bgColor,
				},
			]);
		} catch (error) {
			console.error("Failed to add topic:", error);
			throw error; // Propager l'erreur pour la gestion en amont
		}
	};

	const removeTopic = async (id: string) => {
		try {
			// Appel à la fonction Rust pour supprimer un sujet
			await invoke("remove_topic", { topicId: id });

			// Mise à jour du store après la suppression dans la BD
			setTopics((prev) => prev.filter((topic) => topic.id !== id));
		} catch (error) {
			console.error("Failed to remove topic:", error);
			throw error;
		}
	};

	const editTopicName = async (id: string, name: string) => {
		try {
			// Appel à la fonction Rust pour modifier le nom d'un sujet
			await invoke("edit_topic_name", { topicId: id, name });

			// Mise à jour du store après la modification dans la BD
			setTopics((topic) => topic.id === id, "name", name);
		} catch (error) {
			console.error("Failed to edit topic name:", error);
			throw error;
		}
	};

	const addMessage = async (
		topicId: string,
		message: Omit<TopicMessage, "id">,
	) => {
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
			// Appel à la fonction Rust pour ajouter un message
			await invoke("add_message", {
				id: newMessageId,
				topicId,
				role: newMessage.role,
				content: contentStr,
				tokensUsed: newMessage.tokens_used,
			});

			// Mise à jour du store après l'ajout dans la BD
			setTopics(
				(topic) => topic.id === topicId,
				"messages",
				(messages) => [...messages, newMessage],
			);
		} catch (error) {
			console.error("Failed to add message:", error);
			throw error;
		}
	};

	const removeMessage = async (topicId: string, messageId: string) => {
		try {
			// Appel à la fonction Rust pour supprimer un message
			await invoke("remove_message", { messageId });

			// Mise à jour du store après la suppression dans la BD
			setTopics(
				(topic) => topic.id === topicId,
				"messages",
				(messages) => messages.filter((message) => message.id !== messageId),
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
