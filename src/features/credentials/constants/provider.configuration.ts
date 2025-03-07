import type { ProviderFormConfig } from "../types/provider.types";
import Cloudflare from "@icons/Cloudflare";

export const PROVIDER_CONFIGURATION: ProviderFormConfig[] = [
	//  {
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
		id: "anthropic",
		name: "Anthropic",
		icon: "/icons/anthropic.png",
		fields: [
			{
				key: "api_key",
				label: "API Key",
				type: "password",
				required: true,
				placeholder: "Your Anthropic API Key",
			},
		],
	},
	{
		id: "cloudflare",
		name: "Cloudflare",
		icon: "/icons/cloudflare.png",
		fields: [
			{
				key: "accountId",
				label: "Account ID",
				type: "text",
				required: true,
				placeholder: "Your Cloudflare Account ID",
			},
			{
				key: "apiToken",
				label: "API Token",
				type: "password",
				required: true,
				placeholder: "Your Cloudflare API Token",
			},
		],
	},
];
