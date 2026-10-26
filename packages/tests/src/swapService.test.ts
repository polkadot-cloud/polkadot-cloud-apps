// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
// @vitest-environment jsdom

import { expect, test, vi } from 'vitest'
import { PolkadotService } from '../../dedot-api/src/services/polkadot'

type ServiceArgs = ConstructorParameters<typeof PolkadotService>

test.each([true, false, undefined])(
	'swap=%s is independent of stablecoin support',
	(swap) => {
		for (const assetHub of [true, false]) {
			for (const hydration of [true, false]) {
				const api = { on: vi.fn() } as unknown as ServiceArgs[2]
				const provider = {} as ServiceArgs[3]
				const service = new PolkadotService(
					{
						network: 'polkadot',
						rpcEndpoints: {},
						providerType: 'ws',
						autoRpc: true,
					},
					['polkadot', 'people-polkadot', 'statemint'],
					api,
					provider,
					provider,
					{ swap, stablecoins: { assetHub, hydration } },
				)

				if (swap) {
					expect(service.interface.swap).toEqual({
						quotes: expect.any(Function),
						swap: expect.any(Function),
					})
				} else {
					expect(service.interface.swap).toBeUndefined()
				}
			}
		}
	},
)
