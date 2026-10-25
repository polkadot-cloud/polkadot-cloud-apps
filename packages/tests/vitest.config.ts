// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	resolve: {
		alias: {
			'library/Balances/BalancesView': fileURLToPath(
				new URL(
					'../app-swap/src/library/Balances/BalancesView',
					import.meta.url,
				),
			),
			'library/AssetHub': fileURLToPath(
				new URL('../app-swap/src/library/AssetHub', import.meta.url),
			),
		},
	},
})
