export const helper = {
	message: {
		mapContent(msg: string) {
			return String(msg).startsWith("{") ? JSON.parse(String(msg)) : msg;
		},
	},
};
