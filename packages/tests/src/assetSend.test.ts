// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { StablecoinBalance } from 'types'
import {
	maxSendableBalance,
	planckToUnitBn,
	sanitizeBalanceInput,
	stringToBn,
} from 'utils'
import { describe, expect, test, vi } from 'vitest'
import {
	getFeeAssetOptions,
	getTokenOptions,
} from '../../app-swap/src/pages/Send/options'
import { formatBalance, toPlanck } from '../../app-swap/src/pages/Send/utils'
import dotUsdSvg from '../../assets/src/token/dotusd.svg'
import { createAssetHubStablecoinAdapter } from '../../dedot-api/src/stablecoins/assetHub'

type AssetHubApi = Parameters<typeof createAssetHubStablecoinAdapter>[0]

describe('Asset Send dotUSD support', () => {
	test('offers dotUSD for transfers and fees on Polkadot Hub only', () => {
		for (const getOptions of [getTokenOptions, getFeeAssetOptions]) {
			expect(getOptions('statemint')).toContainEqual({
				value: 'dotUSD',
				label: 'dotUSD',
				icon: dotUsdSvg,
			})
			expect(getOptions('hydration').map(({ value }) => value)).not.toContain(
				'dotUSD',
			)
		}
	})

	test('reads dotUSD balances and builds transfers with six-decimal amounts', async () => {
		const account = vi.fn().mockResolvedValue({
			balance: 2_000_000n,
			status: 'Liquid',
		})
		const tx = {}
		const transferKeepAlive = vi.fn().mockReturnValue(tx)
		const adapter = createAssetHubStablecoinAdapter({
			query: { assets: { account } },
			tx: { assets: { transferKeepAlive } },
		} as unknown as AssetHubApi)

		const balance = await adapter.balance('sender', 'dotUSD')
		expect(account).toHaveBeenCalledWith([7873, 'sender'])
		expect(balance).toEqual({
			chain: 'statemint',
			symbol: 'dotUSD',
			free: 2_000_000n,
			frozen: 0n,
			existentialDeposit: 10_000n,
			decimals: 6,
		})
		expect(formatBalance(balance, 'dotUSD')).toBe('2.000000 dotUSD')
		expect(maxSendableBalance(balance, balance, 2_500n)).toBe(1_987_500n)
		expect(
			await adapter.transfer({
				chain: 'statemint',
				symbol: 'dotUSD',
				recipient: 'recipient',
				amount: toPlanck('1.234567', balance!.decimals),
			}),
		).toBe(tx)
		expect(transferKeepAlive).toHaveBeenCalledWith(
			7873,
			'recipient',
			1_234_567n,
		)
	})

	test('uses the dotUSD asset location for fee payment and conversion', async () => {
		const quotePriceTokensForExactTokens = vi.fn().mockResolvedValue(2_500n)
		const adapter = createAssetHubStablecoinAdapter({
			call: { assetConversionApi: { quotePriceTokensForExactTokens } },
		} as unknown as AssetHubApi)
		const assetLocation = {
			parents: 0,
			interior: {
				type: 'X2',
				value: [
					{ type: 'PalletInstance', value: 50 },
					{ type: 'GeneralIndex', value: 7873n },
				],
			},
		}
		const payloadOptions = adapter.paymentOptions('dotUSD')
		const paymentInfo = vi.fn().mockResolvedValue({ partialFee: 1_000_000n })
		const tx = { paymentInfo } as unknown as Parameters<
			typeof adapter.estimateFee
		>[0]['tx']

		expect(adapter.feeAssets).toContain('dotUSD')
		expect(payloadOptions).toEqual({ assetId: assetLocation })
		expect(
			await adapter.estimateFee({
				chain: 'statemint',
				symbol: 'dotUSD',
				tx,
				from: 'sender',
				payloadOptions,
			}),
		).toBe(2_500n)
		expect(paymentInfo).toHaveBeenCalledWith('sender', payloadOptions)
		expect(quotePriceTokensForExactTokens).toHaveBeenCalledWith(
			assetLocation,
			{ parents: 1, interior: { type: 'Here' } },
			1_000_000n,
			true,
		)
	})
})

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
