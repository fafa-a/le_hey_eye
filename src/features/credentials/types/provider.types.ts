export type FieldValidation = {
	pattern?: RegExp;
	minLength?: number;
	maxLength?: number;
	message?: string;
};

export type ProviderFormField = {
	key: string;
	label: string;
	type: "text" | "password" | "select" | "number";
	required: boolean;
	placeholder?: string;
	validation?: FieldValidation;
	options?: Array<{ value: string; label: string }>; // Pour le type 'select'
};

export type ProviderFormConfig = {
	id: string;
	name: string;
	icon: string;
	fields: ProviderFormField[];
	settings: Record<string, string | number | boolean>;
};

export type ProviderCredential = {
	providerId: string;
	// biome-ignore lint/suspicious/noExplicitAny:
	[key: string]: any;
};
