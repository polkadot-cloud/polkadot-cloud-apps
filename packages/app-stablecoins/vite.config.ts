// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import checker from 'vite-plugin-checker'
import svgr from 'vite-plugin-svgr'
import { sharedFaviconPlugins } from 'vite-shared'

export default defineConfig({
	plugins: [
		...sharedFaviconPlugins(),
		react(),
		svgr(),
		checker({
			typescript: true,
		}),
	],
	resolve: {
		tsconfigPaths: true,
	},
	build: {
		outDir: 'build',
		rolldownOptions: {
			output: {
				// Keep CSS-in-JS module evaluation deterministic across split chunks.
				strictExecutionOrder: true,
			},
		},
	},
	server: {
		fs: {
			strict: false,
		},
	},
	optimizeDeps: {
		include: ['react/jsx-runtime'],
	},
	worker: {
		format: 'es',
	},
})
