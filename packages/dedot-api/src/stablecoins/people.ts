// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { PolkadotPeopleApi } from '@dedot/chaintypes/polkadot-people'
import type { DedotClient } from 'dedot'
import { asTx } from '../util'
import { type StablecoinAdapter, toStablecoinBalance } from './shared'

// People supports native DOT transfers and fee payment only.
export const createPeopleStablecoinAdapter = (
	getApi: () => Promise<DedotClient<PolkadotPeopleApi>>,
): StablecoinAdapter => ({
	feeAssets: ['DOT'],
	balance: async (address, symbol) => {
		if (symbol !== 'DOT') return undefined
		const api = await getApi()
		const { data } = await api.query.system.account(address)
		return toStablecoinBalance('people-polkadot', 'DOT', data)
	},
	transfer: async ({ symbol, recipient, amount }) => {
		if (symbol !== 'DOT') return undefined
		const api = await getApi()
		return asTx(api.tx.balances.transferKeepAlive(recipient, amount))
	},
	paymentOptions: () => undefined,
	estimateFee: async ({ tx, from, payloadOptions }) => {
		const { partialFee } = await tx.paymentInfo(from, payloadOptions)
		return partialFee
	},
})
