import type { ContentType } from "src-tauri/bindings/ContentType";

export const helper = {
	message: {
		mapContent(msg: string): ContentType {
			return String(msg).startsWith("{") ? JSON.parse(String(msg)) : msg;
		},
	},
};
