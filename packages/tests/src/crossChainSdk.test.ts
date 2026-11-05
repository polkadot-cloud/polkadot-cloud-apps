// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	Builder,
	Native,
	type TDedotApi,
	type TDedotExtrinsic,
} from '@paraspell/sdk-dedot'
import { encodeAddress } from 'dedot/utils'
import { afterEach, expect, test, vi } from 'vitest'

afterEach(() => vi.restoreAllMocks())

test('the installed SDK builds People → Hydration DOT transfers through Hub', async () => {
	const address = encodeAddress(new Uint8Array(32).fill(1))
	const amount = 50_000_000_000n
	const builder = Builder({ abstractDecimals: false })
		.from('PeoplePolkadot')
		.to('Hydration')
		.currency({
			location: { parents: 1, interior: { Here: null } },
			amount,
		})
		.feeAsset({ symbol: Native('DOT') })
		.sender(address)
		.recipient(address)
	const api = builder.api
	const tx = {} as TDedotExtrinsic
	// Stub chain I/O and encoding, leaving the SDK builder and route validation real.
	vi.spyOn(api, 'api', 'get').mockReturnValue({} as TDedotApi)
	vi.spyOn(api, 'init').mockResolvedValue()
	vi.spyOn(api, 'clone').mockReturnValue(api)
	vi.spyOn(api, 'hasMethod').mockResolvedValue(true)
	vi.spyOn(api, 'hasDryRunSupport').mockReturnValue(false)
	vi.spyOn(api, 'disconnect').mockResolvedValue()
	const deserialize = vi.spyOn(api, 'deserializeExtrinsics').mockReturnValue(tx)

	expect(await builder.build()).toBe(tx)
	expect(deserialize).toHaveBeenCalledWith({
		module: 'PolkadotXcm',
		method: 'transfer_assets_using_type_and_then',
		params: expect.objectContaining({
			dest: {
				V5: { parents: 1, interior: { X1: [{ Parachain: 1000 }] } },
			},
			assets: {
				V5: [
					{
						id: { parents: 1, interior: { Here: null } },
						fun: { Fungible: amount },
					},
				],
			},
			assets_transfer_type: 'Teleport',
			custom_xcm_on_dest: {
				V5: expect.arrayContaining([
					{
						DepositReserveAsset: expect.objectContaining({
							dest: {
								parents: 1,
								interior: { X1: [{ Parachain: 2034 }] },
							},
						}),
					},
				]),
			},
		}),
	})
})
