// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { loadEnv, type Plugin, searchForWorkspaceRoot } from 'vite'

const proxyPath = '/__cloud_rpc'

// Dedot's custom WebSocket headers only work in Node.js/Bun. Keep the dev token in Vite's server
// and proxy only the two authenticated Polkadot Cloud RPC endpoints.
export const cloudRpcPlugin = (): Plugin => ({
	name: 'polkadot-cloud-rpc',
	apply: (_, { command, isPreview }) => command === 'serve' && !isPreview,
	config(config, { mode }) {
		const envDir = searchForWorkspaceRoot(config.root ?? process.cwd())
		const token = loadEnv(
			mode,
			envDir,
			'CLOUD_RPC_AUTH_TOKEN',
		).CLOUD_RPC_AUTH_TOKEN?.trim()
		if (!token) return

		return {
			define: {
				'import.meta.env.CLOUD_RPC_PROXY_PATH': JSON.stringify(proxyPath),
			},
			server: {
				proxy: {
					[`^${proxyPath}/(statemint|people)$`]: {
						target: 'https://rpc.polkadot.cloud',
						ws: true,
						changeOrigin: true,
						headers: { Authorization: `Bearer ${token}` },
						rewrite: (path) => path.slice(proxyPath.length),
					},
				},
			},
		}
	},
})
