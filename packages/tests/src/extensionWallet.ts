// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { vi } from 'vitest'

export const extensionId = 'cloud-signer'
export const extensionAccount = {
	address: `0x${'11'.repeat(32)}`,
	name: 'Public test account',
}

export const createExtensionWallet = () => {
	let publish: (value: (typeof extensionAccount)[]) => void = () => {}
	const unsubscribe = vi.fn()
	const extension = {
		accounts: {
			get: vi.fn().mockResolvedValue([extensionAccount]),
			subscribe: vi.fn((callback: typeof publish) => {
				publish = callback
				callback([extensionAccount])
				return unsubscribe
			}),
		},
		signer: { signPayload: vi.fn() },
	}
	const enable = vi.fn().mockResolvedValue(extension)
	return {
		extension,
		enable,
		unsubscribe,
		injectedWeb3: { [extensionId]: { enable } },
		publish: (value: (typeof extensionAccount)[]) => publish(value),
	}
}
