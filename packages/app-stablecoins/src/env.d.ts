// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

interface Window {
	injectedWeb3?: Record<string, unknown>
	walletExtension?: {
		isNovaWallet?: boolean
	}
	opera?: string
}
