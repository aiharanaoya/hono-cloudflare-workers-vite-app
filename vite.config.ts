import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	plugins: [
		react({ jsxRuntime: 'automatic' }),
		cloudflare(),
		tailwindcss(),
		tsconfigPaths(),
	],
	build: {
		rollupOptions: {
			input: {
				islands: './src/islands.tsx',
			},
			output: {
				entryFileNames: '[name].js',
			},
		},
	},
});
