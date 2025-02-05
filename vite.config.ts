import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import tailwindcss from "@tailwindcss/vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const host = process.env.TAURI_DEV_HOST;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(async () => ({
	plugins: [solid(), tailwindcss()],

	// Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
	//
	// 1. prevent vite from obscuring rust errors
	clearScreen: false,
	// 2. tauri expects a fixed port, fail if that port is not available
	server: {
		port: 1420,
		strictPort: true,
		host: host || false,
		hmr: host
			? {
					protocol: "ws",
					host,
					port: 1421,
				}
			: undefined,
		watch: {
			// 3. tell vite to ignore watching `src-tauri`
			ignored: ["**/src-tauri/**"],
		},
	},
	optimizeDeps: {
		include: ["solid-markdown > micromark", "solid-markdown > unified"],
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
			"@components": resolve(__dirname, "./src/components"),
			"@lib": resolve(__dirname, "./src/libs"),
			"@icons": resolve(__dirname, "./src/components/icons"),
		},
	},
}));
