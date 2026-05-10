import netlify from "@netlify/vite-plugin-tanstack-start";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const config = defineConfig({
	resolve: { tsconfigPaths: true },
	plugins: [netlify(), tailwindcss(), tanstackStart(), viteReact()],
	test: {
		environment: "jsdom",
		setupFiles: "./src/test/setup.ts",
		clearMocks: true,
		restoreMocks: true,
	},
});

export default config;
