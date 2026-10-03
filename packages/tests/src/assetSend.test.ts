// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { StablecoinBalance } from 'types'
import { planckToUnitBn, sanitizeBalanceInput, stringToBn } from 'utils'
import { describe, expect, test } from 'vitest'
import {
	formatBalance,
	maxSendableBalance,
	toPlanck,
} from '../../app-swap/src/pages/Send/utils'

const dotBalance: StablecoinBalance = {
	chain: 'statemint',
	symbol: 'DOT',
	free: 1_000n,
	frozen: 0n,
	existentialDeposit: 100n,
	decimals: 10,
}

describe('Asset Send balance conversion', () => {
	test.each([
		['', 10, 0n],
		['.', 10, 0n],
		['1.', 10, 10_000_000_000n],
		['.5', 10, 5_000_000_000n],
		['1,5', 10, 15_000_000_000n],
		['0.0000000001', 10, 1n],
		['0.000001', 6, 1n],
		['0.000000000001', 12, 1n],
		['1.23456789', 6, 1_234_567n],
		['1.5', 0, 1n],
		['9007199254740993.000001', 6, 9_007_199_254_740_993_000_001n],
	] as const)(
		'converts balance input %s at %i decimals without losing precision',
		(input, decimals, expected) => {
			const sanitized = sanitizeBalanceInput(input, decimals)
			expect(sanitized).not.toBeNull()
			expect(toPlanck(sanitized!, decimals)).toBe(expected)
		},
	)

	test.each([6, 10, 12])(
		'round-trips maximum balances at %i decimals through the input display',
		(decimals) => {
			const balance = {
				...dotBalance,
				decimals,
				free: 9_007_199_254_740_993_000_001n,
			}
			const max = maxSendableBalance(balance, balance, 25n)
			const input = planckToUnitBn(
				stringToBn(max.toString()),
				decimals,
			).toFixed()
			expect(toPlanck(sanitizeBalanceInput(input, decimals)!, decimals)).toBe(
				max,
			)
		},
	)

	test('formats a one-planck balance without scientific notation', () => {
		expect(formatBalance({ ...dotBalance, free: 1n }, 'DOT')).toBe(
			'0.0000000001 DOT',
		)
	})
})

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
