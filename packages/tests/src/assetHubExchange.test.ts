// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { PolkadotAssetHubApi } from '@dedot/chaintypes/polkadot-asset-hub'
import type { DedotClient, SubmittableExtrinsic } from 'dedot'
import type {
	AssetHubMarket,
	AssetHubPool,
	AssetHubPsm,
	AssetHubSwapQuote,
} from 'types'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { assetHubLocation } from '../../consts/src/assetHub'
import {
	ChainHeadBlockNotPinnedError,
	ChainHeadBlockPrunedError,
} from '../../dedot-api/node_modules/dedot/index.js'
import { createAssetHubExchange } from '../../dedot-api/src/assetHub'
import {
	canFundExchange,
	ceilDiv,
	liquidityContribution,
	liquidityWithdrawal,
	psmAmounts,
	slippageLimit,
	U128_MAX,
} from '../../dedot-api/src/assetHub/math'

const psm: AssetHubPsm = {
	status: 'AllEnabled',
	maxDebt: 10_000_000_000_000n,
	debt: 2_000_000_000_000n,
	minSwapAmount: 1_000_000n,
	reserve: 2_000_000_000_000n,
	mintFee: 0,
	redeemFee: 100,
	weight: 1_000_000,
}
const pool: AssetHubPool = {
	asset: 'dotUSD',
	lpToken: 86,
	reserveDot: 1_000_000_000n,
	reserveAsset: 2_000_000_000n,
	lpSupply: 1_000_000n,
	lpBalance: 100_000n,
	lpMinBalance: 1n,
	lpFrozen: false,
	fee: 3_000,
	withdrawalFee: 0,
	minLiquidity: 100n,
	fetchedAt: Date.now(),
}
const snapshot = (): AssetHubMarket => ({
	hash: '0x1234',
	block: 1,
	fetchedAt: Date.now(),
	psm,
	pools: [
		pool,
		{ ...pool, asset: 'USDT', lpToken: 0 },
		{ ...pool, asset: 'USDC', lpToken: 1 },
	],
})

describe('Upfront funding checks', () => {
	const balances = [
		{
			chain: 'statemint',
			symbol: 'USDT',
			free: 1_000n,
			frozen: 0n,
			existentialDeposit: 10n,
			decimals: 6,
		},
		{
			chain: 'statemint',
			symbol: 'DOT',
			free: 100n,
			frozen: 0n,
			existentialDeposit: 10n,
			decimals: 10,
		},
	] as const
	test('reserves the input asset minimum and the fee together', () => {
		expect(canFundExchange([...balances], { USDT: 980n }, 'USDT', 10n)).toBe(
			true,
		)
		expect(canFundExchange([...balances], { USDT: 981n }, 'USDT', 10n)).toBe(
			false,
		)
	})
	test('checks separate fee balances and never assumes output can pay the fee', () => {
		expect(canFundExchange([...balances], { USDT: 990n }, 'DOT', 90n)).toBe(
			true,
		)
		expect(canFundExchange([...balances], { USDT: 990n }, 'DOT', 91n)).toBe(
			false,
		)
		expect(canFundExchange([...balances], { USDT: 100n }, 'dotUSD', 1n)).toBe(
			false,
		)
	})
	test('keeps frozen funds unavailable and blocks missing estimates', () => {
		expect(
			canFundExchange(
				[{ ...balances[0], frozen: 500n }],
				{ USDT: 500n },
				'USDT',
				1n,
			),
		).toBe(false)
		expect(canFundExchange([...balances], { USDT: 1n }, 'DOT', undefined)).toBe(
			false,
		)
	})
})

describe('PSM fixed-rate quotes', () => {
	test('matches current mint and redemption fees', () => {
		expect(
			psmAmounts(
				{
					assetIn: 'USDT',
					assetOut: 'dotUSD',
					amount: 1_000_000_000n,
					mode: 'exactIn',
				},
				psm,
			),
		).toEqual({ amountIn: 1_000_000_000n, amountOut: 1_000_000_000n, fee: 0 })
		expect(
			psmAmounts(
				{
					assetIn: 'dotUSD',
					assetOut: 'USDT',
					amount: 1_000_000_000n,
					mode: 'exactIn',
				},
				psm,
			)?.amountOut,
		).toBe(999_900_000n)
	})
	test.each([0, 100, 5_000, 999_999])(
		'inverts exact output minimally with ceiling-rounded fee %i',
		(fee) => {
			for (const wanted of [1n, 9n, 10_001n, 1_000_001n]) {
				const result = psmAmounts(
					{
						assetIn: 'dotUSD',
						assetOut: 'USDT',
						amount: wanted,
						mode: 'exactOut',
					},
					{ ...psm, minSwapAmount: 1n, redeemFee: fee },
				)!
				expect(result.amountOut).toBeGreaterThanOrEqual(wanted)
				const previous = result.amountIn - 1n
				expect(
					previous - ceilDiv(previous * BigInt(fee), 1_000_000n),
				).toBeLessThan(wanted)
			}
		},
	)
	test('rejects insufficient reserves and minting capacity', () => {
		expect(
			psmAmounts(
				{
					assetIn: 'USDT',
					assetOut: 'dotUSD',
					amount: 1_000_000n,
					mode: 'exactIn',
				},
				{ ...psm, maxDebt: psm.debt },
			),
		).toBeUndefined()
		expect(
			psmAmounts(
				{
					assetIn: 'dotUSD',
					assetOut: 'USDT',
					amount: 2_000_000n,
					mode: 'exactIn',
				},
				{ ...psm, reserve: 1n },
			),
		).toBeUndefined()
	})
	test('honors minimum amounts and per-asset circuit breakers', () => {
		const mint = {
			assetIn: 'USDT',
			assetOut: 'dotUSD',
			amount: 1_000_000n,
			mode: 'exactIn',
		} as const
		expect(psmAmounts({ ...mint, amount: 999_999n }, psm)).toBeUndefined()
		expect(psmAmounts(mint, { ...psm, weight: 0 })).toBeUndefined()
		expect(
			psmAmounts(mint, { ...psm, status: 'MintingDisabled' }),
		).toBeUndefined()
		const redeem = { ...mint, assetIn: 'dotUSD', assetOut: 'USDT' } as const
		expect(
			psmAmounts(redeem, { ...psm, status: 'MintingDisabled' }),
		).toBeDefined()
		expect(
			psmAmounts(redeem, { ...psm, status: 'AllDisabled' }),
		).toBeUndefined()
	})
	test('rejects unsupported pairs and u128 overflow', () => {
		expect(
			psmAmounts(
				{
					assetIn: 'USDC',
					assetOut: 'dotUSD',
					amount: 1_000_000n,
					mode: 'exactIn',
				},
				psm,
			),
		).toBeUndefined()
		expect(() =>
			psmAmounts(
				{
					assetIn: 'USDT',
					assetOut: 'dotUSD',
					amount: U128_MAX + 1n,
					mode: 'exactIn',
				},
				psm,
			),
		).toThrow()
	})
})

describe('Liquidity amounts and execution bounds', () => {
	test('uses the limiting side and calculates proportional LP shares', () => {
		expect(liquidityContribution(pool, 1_000_000n, 3_000_000n)).toEqual({
			dot: 1_000_000n,
			asset: 2_000_000n,
			lp: 1_000n,
		})
		expect(liquidityContribution(pool, 3_000_000n, 2_000_000n)).toEqual({
			dot: 1_000_000n,
			asset: 2_000_000n,
			lp: 1_000n,
		})
	})
	test('rejects deposits below the runtime LP minting minimum', () => {
		expect(() => liquidityContribution(pool, 1n, 2n)).toThrow()
	})
	test('withdraws a proportional position with the current withdrawal fee', () => {
		expect(liquidityWithdrawal(pool, 50_000n)).toEqual({
			dot: 50_000_000n,
			asset: 100_000_000n,
		})
		expect(
			liquidityWithdrawal({ ...pool, withdrawalFee: 10_000 }, 50_000n),
		).toEqual({ dot: 49_500_000n, asset: 99_000_000n })
	})
	test('rejects frozen LP, overspending, and dust remaining in a partial position', () => {
		expect(() => liquidityWithdrawal({ ...pool, lpFrozen: true }, 1n)).toThrow()
		expect(() => liquidityWithdrawal(pool, pool.lpBalance + 1n)).toThrow()
		expect(() =>
			liquidityWithdrawal({ ...pool, lpMinBalance: 100n }, pool.lpBalance - 1n),
		).toThrow()
		expect(
			liquidityWithdrawal({ ...pool, lpMinBalance: 100n }, pool.lpBalance),
		).toBeDefined()
	})
	test('rounds maximum spending up and minimum receipt down', () => {
		expect(slippageLimit(101n, 50, true)).toBe(102n)
		expect(slippageLimit(101n, 50)).toBe(100n)
		expect(() => slippageLimit(100n, 501)).toThrow()
		expect(() => slippageLimit(100n, -1)).toThrow()
	})
})

const fakeApi = () => {
	const tx = (name: string) =>
		vi.fn(
			(...args: unknown[]) =>
				({
					call: { name, args },
					toHex: () => '0x1234',
				}) as unknown as SubmittableExtrinsic,
		)
	const exactIn = vi.fn(
		async (_from: unknown, _to: unknown, amount: bigint) =>
			(amount * 997n) / 1000n,
	)
	const exactOut = vi.fn(async (_from: unknown, _to: unknown, amount: bigint) =>
		ceilDiv(amount * 1000n, 997n),
	)
	const client = {
		block: {
			finalized: vi.fn(async () => ({ hash: '0x5678', number: 2 })),
		},
		registry: { metadata: { pallets: [] } },
		at: vi.fn(async () => ({
			query: {
				assetConversion: {
					pools: {
						entries: vi.fn(async () =>
							snapshot().pools.map(({ asset, lpToken }) => [
								[assetHubLocation('DOT'), assetHubLocation(asset)],
								{ lpToken },
							]),
						),
					},
				},
				poolAssets: {
					asset: vi.fn(async () => ({
						status: 'Live',
						supply: pool.lpSupply,
						minBalance: pool.lpMinBalance,
					})),
					account: vi.fn(async () => ({
						balance: pool.lpBalance,
						status: 'Liquid',
					})),
				},
			},
			consts: {
				assetConversion: {
					lpFee: pool.fee,
					liquidityWithdrawalFee: pool.withdrawalFee,
					mintMinLiquidity: pool.minLiquidity,
				},
			},
			call: {
				assetConversionApi: {
					getReserves: vi.fn(async () => [pool.reserveDot, pool.reserveAsset]),
					quotePriceExactTokensForTokens: exactIn,
					quotePriceTokensForExactTokens: exactOut,
				},
			},
		})),
		tx: {
			psm: { mint: tx('mint'), redeem: tx('redeem') },
			assets: { transfer: tx('transfer') },
			utility: { batchAll: tx('batchAll') },
			assetConversion: {
				swapExactTokensForTokens: tx('swapExact'),
				swapTokensForExactTokens: tx('swapOutput'),
				addLiquidity: tx('add'),
				removeLiquidity: tx('remove'),
			},
		},
	}
	return {
		client,
		exchange: createAssetHubExchange(
			client as unknown as DedotClient<PolkadotAssetHubApi>,
		),
		exactIn,
		exactOut,
	}
}

describe('Asset Hub route construction', () => {
	afterEach(() => vi.restoreAllMocks())
	test('reads market state at the client finalized block', async () => {
		const { exchange, client } = fakeApi()
		const market = await exchange.market('sender')
		expect(market).toMatchObject({
			hash: '0x5678',
			block: 2,
			psm: null,
		})
		expect(
			market.pools.map(({ asset, lpBalance }) => [asset, lpBalance]),
		).toEqual(
			['dotUSD', 'USDT', 'USDC'].map((asset) => [asset, pool.lpBalance]),
		)
		expect(client.at).toHaveBeenCalledWith(market.hash)
	})
	test.each([
		new ChainHeadBlockNotPinnedError(
			'Block hash 0x1234 is not pinned',
			'0x1234',
		),
		new ChainHeadBlockPrunedError(),
		new Error(
			'Block is not pinned and Archive JSON-RPC is not supported by the server/node!',
		),
	])('refreshes a market whose block became unavailable: %s', async (error) => {
		const { exchange, client } = fakeApi()
		client.at.mockRejectedValueOnce(error)
		const market = await exchange.market('sender')
		expect(market.hash).toBe('0x5678')
		expect(
			market.pools.every(({ lpBalance }) => lpBalance === pool.lpBalance),
		).toBe(true)
		expect(client.block.finalized).toHaveBeenCalledTimes(2)
	})
	test.each(['exactIn', 'exactOut'] as const)(
		'restarts every %s route from a fresh snapshot if the second leg loses its block',
		async (mode) => {
			const { exchange, client, exactIn, exactOut } = fakeApi()
			const price = mode === 'exactIn' ? exactIn : exactOut
			price
				.mockResolvedValueOnce(123n)
				.mockRejectedValueOnce(
					new ChainHeadBlockNotPinnedError(
						'Block hash 0x1234 is not pinned',
						'0x1234',
					),
				)
			const oldMarket = { ...snapshot(), fetchedAt: Date.now() - 20_000 }
			const quotes = await exchange.quotes(oldMarket, {
				assetIn: 'dotUSD',
				assetOut: 'USDT',
				amount: 1_000_000n,
				mode,
			})
			// The fresh market has no PSM: its old price must not survive the retry.
			expect(quotes).toHaveLength(1)
			expect(quotes[0]).toMatchObject({
				kind: 'amm',
				hash: '0x5678',
				path: ['dotUSD', 'DOT', 'USDT'],
			})
			expect(quotes[0].fetchedAt).toBeGreaterThan(oldMarket.fetchedAt)
			expect(price).toHaveBeenCalledTimes(4)
			expect(price.mock.calls[2][2]).toBe(1_000_000n)
			expect(price.mock.calls[3][2]).toBe(
				mode === 'exactIn' ? 997_000n : ceilDiv(1_000_000_000n, 997n),
			)
			expect(client.block.finalized).toHaveBeenCalledOnce()
		},
	)
	test('stops after one fresh quote attempt if blocks remain unavailable', async () => {
		const { exchange, client, exactIn } = fakeApi()
		const error = new ChainHeadBlockNotPinnedError(
			'Block hash 0x1234 is not pinned',
			'0x1234',
		)
		exactIn.mockRejectedValue(error)
		await expect(
			exchange.quotes(snapshot(), {
				assetIn: 'dotUSD',
				assetOut: 'USDT',
				amount: 1_000_000n,
				mode: 'exactIn',
			}),
		).rejects.toBe(error)
		expect(exactIn).toHaveBeenCalledTimes(2)
		expect(client.block.finalized).toHaveBeenCalledOnce()
	})
	test('propagates other quote errors without retrying or accepting a partial route', async () => {
		const { exchange, client, exactIn } = fakeApi()
		const error = new Error('Runtime API unavailable')
		exactIn.mockRejectedValueOnce(error)
		await expect(
			exchange.quotes(snapshot(), {
				assetIn: 'dotUSD',
				assetOut: 'USDT',
				amount: 1_000_000n,
				mode: 'exactIn',
			}),
		).rejects.toBe(error)
		expect(exactIn).toHaveBeenCalledOnce()
		expect(client.block.finalized).not.toHaveBeenCalled()
	})
	test('compares PSM with the DOT route at one finalized snapshot', async () => {
		const { exchange, client, exactIn } = fakeApi()
		const market = snapshot()
		const quotes = await exchange.quotes(market, {
			assetIn: 'USDT',
			assetOut: 'dotUSD',
			amount: 1_000_000n,
			mode: 'exactIn',
		})
		expect(quotes.map((quote) => quote.kind)).toEqual(['psm', 'amm'])
		expect(quotes[1].path).toEqual(['USDT', 'DOT', 'dotUSD'])
		expect(client.at).toHaveBeenCalledWith(market.hash)
		expect(exactIn.mock.calls[1][2]).toBe(997_000n)
	})
	test('quotes exact output backwards through both pools and sorts by required input', async () => {
		const { exchange, exactOut } = fakeApi()
		const quotes = await exchange.quotes(snapshot(), {
			assetIn: 'USDT',
			assetOut: 'dotUSD',
			amount: 1_000_000n,
			mode: 'exactOut',
		})
		expect(quotes[0].kind).toBe('psm')
		expect(exactOut.mock.calls[0].slice(0, 2)).toEqual([
			assetHubLocation('DOT'),
			assetHubLocation('dotUSD'),
		])
		expect(exactOut.mock.calls[1][2]).toBe(ceilDiv(1_000_000_000n, 997n))
	})
	test('never invents routes for missing pools or an unapproved PSM asset', async () => {
		const { exchange } = fakeApi()
		expect(
			await exchange.quotes(
				{ ...snapshot(), pools: [] },
				{
					assetIn: 'USDC',
					assetOut: 'dotUSD',
					amount: 1_000_000n,
					mode: 'exactIn',
				},
			),
		).toEqual([])
	})
	test('encodes AMM slippage bounds and preserves the payer account', async () => {
		const { exchange, client } = fakeApi()
		const [quote] = await exchange.quotes(snapshot(), {
			assetIn: 'DOT',
			assetOut: 'USDT',
			amount: 1_000_000n,
			mode: 'exactOut',
		})
		exchange.swap(quote, 'sender', 'recipient', 50)
		expect(
			client.tx.assetConversion.swapTokensForExactTokens,
		).toHaveBeenCalledWith(
			[assetHubLocation('DOT'), assetHubLocation('USDT')],
			quote.amountOut,
			slippageLimit(quote.amountIn, 50, true),
			'recipient',
			true,
		)
	})
	test('encodes minting with the quoted fee ceiling and sends atomically', async () => {
		const { exchange, client } = fakeApi()
		const [quote] = await exchange.quotes(snapshot(), {
			assetIn: 'USDT',
			assetOut: 'dotUSD',
			amount: 1_000_000n,
			mode: 'exactIn',
		})
		exchange.swap(quote, 'sender', 'recipient', 50)
		expect(client.tx.psm.mint).toHaveBeenCalledWith(
			assetHubLocation('dotUSD'),
			assetHubLocation('USDT'),
			1_000_000n,
			0,
		)
		expect(client.tx.assets.transfer).toHaveBeenCalledWith(
			7873,
			'recipient',
			1_000_000n,
		)
		expect(client.tx.utility.batchAll).toHaveBeenCalledOnce()
	})
	test('blocks stale quotes and pool snapshots', () => {
		const { exchange } = fakeApi()
		const quote = {
			kind: 'amm',
			amountIn: 1n,
			amountOut: 1n,
			fetchedAt: Date.now() - 31_000,
		} as AssetHubSwapQuote
		expect(() => exchange.swap(quote, 'sender', 'recipient', 50)).toThrow(
			/expired/,
		)
		expect(() =>
			exchange.addLiquidity(
				{ ...pool, fetchedAt: Date.now() - 31_000 },
				1_000_000n,
				2_000_000n,
				'sender',
				50,
			),
		).toThrow(/expired/)
	})
})
