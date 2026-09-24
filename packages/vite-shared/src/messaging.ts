// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Plugin } from 'vite'

// Keep local REST, Socket.IO polling and WebSocket upgrades on the app's origin.
export const messagingProxyPlugin = (): Plugin => ({
	name: 'polkadot-cloud-messaging',
	apply: (_, { command, isPreview }) => command === 'serve' && !isPreview,
	config: () => ({
		define: {
			'import.meta.env.MESSAGING_DEV_PROXY': true,
		},
		server: {
			proxy: {
				'^/(guest/session|conversations/[^/]+/messages|socket\\.io/?)(\\?|$)': {
					target: 'http://127.0.0.1:4013',
					changeOrigin: true,
					ws: true,
				},
			},
		},
	}),
})
