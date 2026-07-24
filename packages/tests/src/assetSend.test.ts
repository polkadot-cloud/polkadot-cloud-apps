// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { StablecoinBalance } from 'types'
import { describe, expect, test } from 'vitest'
import { maxSendableBalance } from '../../app-stablecoins/src/pages/Send/utils'

const dotBalance: StablecoinBalance = {
	chain: 'statemint',
	symbol: 'DOT',
	free: 1_000n,
	frozen: 0n,
	existentialDeposit: 100n,
	decimals: 10,
}

describe('Asset Send maximum balance', () => {
	test('deducts the transaction fee when DOT pays for a DOT transfer', () => {
		expect(maxSendableBalance(dotBalance, dotBalance, 25n)).toBe(875n)
	})

	test('does not deduct a fee paid from a different asset', () => {
		const feeBalance: StablecoinBalance = {
			...dotBalance,
			symbol: 'USDC',
		}

		expect(maxSendableBalance(dotBalance, feeBalance, 25n)).toBe(900n)
	})

	test('keeps frozen funds out of the available amount', () => {
		const frozenBalance = { ...dotBalance, frozen: 400n }

		expect(maxSendableBalance(frozenBalance, frozenBalance, 25n)).toBe(575n)
	})

	test('never returns a negative maximum', () => {
		expect(maxSendableBalance(dotBalance, dotBalance, 1_000n)).toBe(0n)
	})
})
