// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
// @vitest-environment jsdom

import { expect, test, vi } from 'vitest'
import { KusamaService } from '../../dedot-api/src/services/kusama'
import { PaseoService } from '../../dedot-api/src/services/paseo'
import { PolkadotService } from '../../dedot-api/src/services/polkadot'
import { defaultServiceInterface } from '../../global-bus/src/serviceInterface/default'

type ServiceApi = ConstructorParameters<typeof PolkadotService>[2] &
	ConstructorParameters<typeof KusamaService>[2] &
	ConstructorParameters<typeof PaseoService>[2]

test.each([
	['polkadot', 'people-polkadot', 'statemint', PolkadotService],
	['kusama', 'people-kusama', 'statemine', KusamaService],
	['paseo', 'people-paseo', 'paseomint', PaseoService],
] as const)(
	'%s exposes swapping only when supported and explicitly enabled',
	(network, people, hub, Service) => {
		for (const swap of [true, false, undefined]) {
			for (const assetHub of [true, false]) {
				for (const hydration of [true, false]) {
					const api = { on: vi.fn() } as unknown as ServiceApi
					const provider = {} as ConstructorParameters<typeof Service>[3]
					const service = new Service(
						{
							network,
							rpcEndpoints: {},
							providerType: 'ws',
							autoRpc: true,
						},
						[network, people, hub],
						api,
						provider,
						provider,
						{ swap, stablecoins: { assetHub, hydration } },
					)

					if (network === 'polkadot' && swap) {
						expect(service.interface.swap).toEqual({
							quotes: expect.any(Function),
							swap: expect.any(Function),
						})
					} else {
						expect(service.interface).toHaveProperty('swap', undefined)
					}
					if (network === 'polkadot' && assetHub) {
						expect(service.interface.assetHub).toEqual({
							market: expect.any(Function),
							quotes: expect.any(Function),
							swap: expect.any(Function),
							addLiquidity: expect.any(Function),
							removeLiquidity: expect.any(Function),
						})
					} else {
						expect(service.interface.assetHub).toBeUndefined()
					}
					expect(service.features.swap).toBe(swap ?? false)
				}
			}
		}
	},
)

test('the default service leaves swapping unavailable', () => {
	expect(defaultServiceInterface).toHaveProperty('swap', undefined)
})
