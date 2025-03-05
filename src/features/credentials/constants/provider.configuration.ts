import type { ProviderFormConfig } from "../types/provider.types";
import Cloudflare from "@icons/Cloudflare";

export const PROVIDER_CONFIGURATION: ProviderFormConfig[] = [
	// {
	// 	id: "openai",
	// 	name: "OpenAI",
	// 	icon: "assets/icons/openai.png",
	// 	fields: [
	// 		{
	// 			key: "api_key",
	// 			label: "API Key",
	// 			type: "password",
	// 			required: true,
	// 			placeholder: "sk-...",
	// 			validation: { pattern: /^sk-[a-zA-Z0-9]{32,}$/ },
	// 		},
	// 	],
	// },
	{
		id: "cloudflare",
		name: "Cloudflare",
		icon: "/icons/cloudflare.png",
		fields: [
			{
				key: "account_id",
				label: "Account ID",
				type: "text",
				required: true,
				placeholder: "Your Cloudflare Account ID",
			},
			{
				key: "api_token",
				label: "API Token",
				type: "password",
				required: true,
				placeholder: "Your Cloudflare API Token",
			},
		],
	},
];
