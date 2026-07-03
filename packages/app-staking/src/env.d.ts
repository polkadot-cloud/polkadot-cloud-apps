// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ExtensionInjected } from '@w3ux/types'

declare global {
	interface Window {
		walletExtension?: {
			isNovaWallet?: boolean
		}
		injectedWeb3?: Record<string, ExtensionInjected>
		opera?: boolean
	}
}
