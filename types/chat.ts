export type TextContent = {
	type: "text";
	text: string;
};

export type ImageSource = {
	type: "base64";
	media_type: string;
	data: string;
};

export type ImageContent = {
	type: "image";
	source: ImageSource;
};

export type ContentItem = TextContent | ImageContent;

export type ChatMessage = {
	role: ChatRole; // Je suppose que ChatRole est défini ailleurs
	content: string | Array<ContentItem>;
};
