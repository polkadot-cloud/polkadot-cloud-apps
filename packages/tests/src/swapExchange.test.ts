// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { PolkadotAssetHubApi } from '@dedot/chaintypes/polkadot-asset-hub'
import type { DedotClient, SubmittableExtrinsic } from 'dedot'
import type { SwapPool, SwapPsm, SwapQuote, SwapRequest } from 'types'
import { canFundExchange, ceilDiv, slippageLimit } from 'utils'
import { afterEach, describe, expect, test, vi } from 'vitest'
import { U128_MAX } from '../../consts/src/math'
import {
	SwapQuoteExpiryMs,
	SwapTokens,
	swapLocation,
} from '../../consts/src/swap'
import {
	ChainHeadBlockNotPinnedError,
	ChainHeadBlockPrunedError,
} from '../../dedot-api/node_modules/dedot/index.js'
import { createSwapInterface } from '../../dedot-api/src/swap'
import { psmAmounts, psmDebtLimit } from '../../dedot-api/src/swap/math'

const psm: SwapPsm = {
	status: 'AllEnabled',
	maxDebt: 10_000_000_000_000n,
	debt: 2_000_000_000_000n,
	minSwapAmount: 1_000_000n,
	reserve: 2_000_000_000_000n,
	mintFee: 0,
	redeemFee: 100,
	weight: 1_000_000,
}
const pool: SwapPool = {
	asset: 'dotUSD',
	reserveDot: 1_000_000_000n,
	reserveAsset: 2_000_000_000n,
	fee: 3_000,
}
const mint: SwapRequest = {
	assetIn: 'USDT',
	assetOut: 'dotUSD',
	amount: 1_000_000n,
	mode: 'exactIn',
}
const redeem: SwapRequest = {
	...mint,
	assetIn: 'dotUSD',
	assetOut: 'USDT',
}

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
	test('rejects negative debits and never borrows a matching asset from another chain', () => {
		expect(canFundExchange([...balances], { USDT: -1n }, 'DOT', 1n)).toBe(false)
		expect(canFundExchange([...balances], { USDT: 1n }, 'DOT', -1n)).toBe(false)
		expect(
			canFundExchange(
				[{ ...balances[0], chain: 'hydration' }, balances[1]],
				{ USDT: 1n },
				'DOT',
				1n,
			),
		).toBe(false)
	})
})

describe('PSM fixed-rate quotes', () => {
	test('matches current mint and redemption fees', () => {
		expect(psmAmounts({ ...mint, amount: 1_000_000_000n }, psm)).toEqual({
			amountIn: 1_000_000_000n,
			amountOut: 1_000_000_000n,
			fee: 0,
		})
		expect(
			psmAmounts({ ...redeem, amount: 1_000_000_000n }, psm)?.amountOut,
		).toBe(999_900_000n)
	})
	test.each([0, 100, 5_000, 999_999])(
		'inverts exact output minimally with ceiling-rounded fee %i',
		(fee) => {
			for (const wanted of [1n, 9n, 10_001n, 1_000_001n]) {
				const result = psmAmounts(
					{ ...redeem, amount: wanted, mode: 'exactOut' },
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
		expect(psmAmounts(mint, { ...psm, maxDebt: psm.debt })).toBeUndefined()
		expect(
			psmAmounts({ ...redeem, amount: 2_000_000n }, { ...psm, reserve: 1n }),
		).toBeUndefined()
	})
	test('honors minimum amounts and per-asset circuit breakers', () => {
		expect(psmAmounts({ ...mint, amount: 999_999n }, psm)).toBeUndefined()
		expect(psmAmounts(mint, { ...psm, weight: 0 })).toBeUndefined()
		expect(
			psmAmounts(mint, { ...psm, status: 'MintingDisabled' }),
		).toBeUndefined()
		expect(
			psmAmounts(redeem, { ...psm, status: 'MintingDisabled' }),
		).toBeDefined()
		expect(
			psmAmounts(redeem, { ...psm, status: 'AllDisabled' }),
		).toBeUndefined()
	})
	test('rejects unsupported pairs and u128 overflow', () => {
		expect(psmAmounts({ ...mint, assetIn: 'USDC' }, psm)).toBeUndefined()
		expect(() => psmAmounts({ ...mint, amount: U128_MAX + 1n }, psm)).toThrow()
	})
	test('rejects an exact-output quote whose gross input overflows u128', () => {
		expect(
			psmAmounts({ ...redeem, amount: U128_MAX, mode: 'exactOut' }, psm),
		).toBeUndefined()
	})
	test('applies the aggregate debt limit even when the per-asset share has headroom', () => {
		expect(psmDebtLimit(1_000n, [100n, 900n], [1, 1], 0)).toBe(100n)
		expect(psmDebtLimit(1_000n, [100n, 1_001n], [1, 1], 0)).toBe(0n)
		expect(psmDebtLimit(1_000n, [0n, 0n], [0, 1], 0)).toBe(0n)
		expect(psmDebtLimit(1_000n, [0n, 0n], [0, 0], 0)).toBe(0n)
	})
})

describe('Swap execution bounds', () => {
	test('rounds maximum spending up and minimum receipt down', () => {
		expect(slippageLimit(101n, 50, 'maximum')).toBe(102n)
		expect(slippageLimit(101n, 50)).toBe(100n)
		expect(() => slippageLimit(100n, 501)).toThrow()
		expect(() => slippageLimit(100n, -1)).toThrow()
	})
	test('keeps minimum receipts positive and maximum inputs encodable at the boundaries', () => {
		expect(slippageLimit(1n, 500)).toBe(1n)
		expect(slippageLimit(U128_MAX, 500, 'maximum')).toBe(U128_MAX)
		expect(slippageLimit(U128_MAX - 1n, 0, 'maximum')).toBe(U128_MAX - 1n)
		for (const amount of [0n, -1n, U128_MAX + 1n]) {
			expect(() => slippageLimit(amount, 50)).toThrow('Invalid token amount')
		}
		for (const bps of [0.5, Number.NaN, Number.POSITIVE_INFINITY]) {
			expect(() => slippageLimit(100n, bps)).toThrow('Slippage')
		}
	})
})

const fakeApi = (withPsm = false, lpFee = pool.fee) => {
	const internal = swapLocation('dotUSD')
	const pair = [internal, swapLocation('USDT')]
	const pairs = [pair, [internal, swapLocation('USDC')]]
	const query = {
		psm: Object.assign(
			vi.fn(async () => ({
				maxDebt: 10_000_000_001n,
				minSwapAmount: 1_000_000n,
				internalDecimals: 6,
			})),
			{
				meta: { storageType: { type: 'Map', value: { keyTypeId: 7 } } },
			},
		),
		externalAssets: {
			entries: vi.fn(async () =>
				pairs.map((ids) => [ids, { status: 'AllEnabled', decimals: 6 }]),
			),
		},
		psmDebt: {
			multi: vi.fn(async (_pairs: unknown[]) => [1_000_000_000n, 200n]),
		},
		assetCeilingWeight: { multi: vi.fn(async (_pairs: unknown[]) => [1, 2]) },
		mintingFee: vi.fn(async () => psm.mintFee),
		redemptionFee: vi.fn(async () => psm.redeemFee),
	}
	const registry = {
		metadata: { pallets: withPsm ? [{ name: 'Psm' }] : [] },
		findCodec: vi.fn(() => ({ tryEncode: vi.fn(() => new Uint8Array([0])) })),
	}
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
	const getReserves = vi.fn(
		async (
			_from: unknown,
			_to: unknown,
		): Promise<[bigint, bigint] | undefined> => [
			pool.reserveDot,
			pool.reserveAsset,
		],
	)
	const client = {
		block: {
			finalized: vi.fn(async () => ({ hash: '0x5678', number: 2 })),
		},
		at: vi.fn(async () => ({
			registry,
			query: {
				psm: query,
				assets: {
					account: vi.fn(async () => ({
						balance: 1_000_000_000n,
						status: 'Liquid',
					})),
				},
			},
			consts: {
				psm: { palletId: '0x70792f706567736d' },
				assetConversion: {
					lpFee,
				},
			},
			call: {
				assetConversionApi: {
					getReserves,
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
			},
		},
	}
	return {
		client,
		exchange: createSwapInterface(
			client as unknown as DedotClient<PolkadotAssetHubApi>,
		),
		exactIn,
		exactOut,
		getReserves,
		query,
		registry,
	}
}

describe('Asset Hub route construction', () => {
	afterEach(() => vi.restoreAllMocks())
	test.each(['exactIn', 'exactOut'] as const)(
		'quotes every supported pair in %s mode',
		async (mode) => {
			for (const assetIn of SwapTokens) {
				for (const assetOut of SwapTokens) {
					const { exchange, exactIn, exactOut, client } = fakeApi()
					const quotes = await exchange.quotes({
						assetIn,
						assetOut,
						amount: 1_000_000n,
						mode,
					})
					if (assetIn === assetOut) {
						expect(quotes).toEqual([])
						expect(client.at).not.toHaveBeenCalled()
						continue
					}
					const path =
						assetIn === 'DOT' || assetOut === 'DOT'
							? [assetIn, assetOut]
							: [assetIn, 'DOT', assetOut]
					expect(quotes).toHaveLength(1)
					expect(quotes[0]).toMatchObject({
						kind: 'amm',
						assetIn,
						assetOut,
						path,
						mode,
					})
					expect(
						mode === 'exactIn' ? quotes[0].amountIn : quotes[0].amountOut,
					).toBe(1_000_000n)
					expect(mode === 'exactIn' ? exactIn : exactOut).toHaveBeenCalledTimes(
						path.length - 1,
					)
				}
			}
		},
	)
	test('retains a valid PSM route when AMM liquidity is missing', async () => {
		const { exchange, getReserves } = fakeApi(true)
		getReserves.mockResolvedValue(undefined)
		expect((await exchange.quotes(mint)).map(({ kind }) => kind)).toEqual([
			'psm',
		])
	})
	test('rejects unsupported PSM denominations without hiding the AMM route', async () => {
		const { exchange, query } = fakeApi(true)
		query.psm.mockResolvedValueOnce({
			maxDebt: psm.maxDebt,
			minSwapAmount: 1n,
			internalDecimals: 12,
		})
		expect((await exchange.quotes(mint)).map(({ kind }) => kind)).toEqual([
			'amm',
		])
	})
	test('keeps full precision across both legs when measuring price impact', async () => {
		const { exchange, exactIn, getReserves } = fakeApi(false, 0)
		getReserves
			.mockResolvedValueOnce([3n, 2n])
			.mockResolvedValueOnce([1n, 1_000n])
		exactIn.mockResolvedValueOnce(1n).mockResolvedValueOnce(500n)
		const [quote] = await exchange.quotes({
			...mint,
			assetOut: 'USDC',
			amount: 1n,
		})
		// Marginal output is 1 * (3/2) * (1000/1) = 1500, before the actual 500 output.
		expect(quote.priceImpactBps).toBe(6666)
		expect(quote.fee).toBe(0)
	})
	test('reports compounded LP fees in parts per million', async () => {
		const { exchange } = fakeApi()
		expect((await exchange.quotes(mint))[0].fee).toBe(5991)
		expect((await exchange.quotes({ ...mint, assetIn: 'DOT' }))[0].fee).toBe(
			3000,
		)
	})
	test('reads only the requested pools at the finalized block and skips empty pools', async () => {
		const { exchange, client, getReserves } = fakeApi()
		expect((await exchange.quotes(mint))[0].hash).toBe('0x5678')
		expect(client.at).toHaveBeenCalledExactlyOnceWith('0x5678')
		expect(getReserves.mock.calls.map((call) => call[1])).toEqual([
			swapLocation('dotUSD'),
			swapLocation('USDT'),
		])
		getReserves
			.mockResolvedValueOnce(undefined)
			.mockResolvedValueOnce([0n, pool.reserveAsset])
		expect(await exchange.quotes(mint)).toEqual([])
	})
	test('scopes and batches PSM reads and rounds capacity down like the runtime', async () => {
		const { exchange, query, registry } = fakeApi(true)
		expect(
			(await exchange.quotes({ ...mint, amount: 2_333_333_330n })).some(
				(q) => q.kind === 'psm',
			),
		).toBe(true)
		expect(
			(await exchange.quotes({ ...mint, amount: 2_333_333_331n })).some(
				(q) => q.kind === 'psm',
			),
		).toBe(false)
		expect(query.externalAssets.entries).toHaveBeenCalledWith(
			swapLocation('dotUSD'),
		)
		expect(query.psmDebt.multi).toHaveBeenCalledTimes(2)
		expect(query.assetCeilingWeight.multi).toHaveBeenCalledWith(
			query.psmDebt.multi.mock.calls[0][0],
		)
		expect(registry.findCodec).toHaveBeenCalledWith(7)
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
	])('refreshes a quote whose block became unavailable: %s', async (error) => {
		const { exchange, client } = fakeApi()
		client.at.mockRejectedValueOnce(error)
		const quotes = await exchange.quotes(mint)
		expect(quotes[0].hash).toBe('0x5678')
		expect(client.block.finalized).toHaveBeenCalledTimes(2)
	})
	test.each(['exactIn', 'exactOut'] as const)(
		'restarts every %s route from a fresh snapshot if the second leg loses its block',
		async (mode) => {
			const { exchange, client, exactIn, exactOut, registry } = fakeApi(true)
			const price = mode === 'exactIn' ? exactIn : exactOut
			price.mockResolvedValueOnce(123n).mockImplementationOnce(async () => {
				registry.metadata.pallets = []
				throw new ChainHeadBlockNotPinnedError(
					'Block hash 0x1234 is not pinned',
					'0x1234',
				)
			})
			const quotes = await exchange.quotes({ ...redeem, mode })
			// The fresh market has no PSM: its old price must not survive the retry.
			expect(quotes).toHaveLength(1)
			expect(quotes[0]).toMatchObject({
				kind: 'amm',
				hash: '0x5678',
				path: ['dotUSD', 'DOT', 'USDT'],
			})
			expect(price).toHaveBeenCalledTimes(4)
			expect(price.mock.calls[2][2]).toBe(1_000_000n)
			expect(price.mock.calls[3][2]).toBe(
				mode === 'exactIn' ? 997_000n : ceilDiv(1_000_000_000n, 997n),
			)
			expect(client.block.finalized).toHaveBeenCalledTimes(2)
		},
	)
	test('stops after one fresh quote attempt if blocks remain unavailable', async () => {
		const { exchange, client, exactIn } = fakeApi()
		const error = new ChainHeadBlockNotPinnedError(
			'Block hash 0x1234 is not pinned',
			'0x1234',
		)
		exactIn.mockRejectedValue(error)
		await expect(exchange.quotes(redeem)).rejects.toBe(error)
		expect(exactIn).toHaveBeenCalledTimes(2)
		expect(client.block.finalized).toHaveBeenCalledTimes(2)
	})
	test('propagates other quote errors without retrying or accepting a partial route', async () => {
		const { exchange, client, exactIn } = fakeApi()
		const error = new Error('Runtime API unavailable')
		exactIn.mockRejectedValueOnce(error)
		await expect(exchange.quotes(redeem)).rejects.toBe(error)
		expect(exactIn).toHaveBeenCalledOnce()
		expect(client.block.finalized).toHaveBeenCalledOnce()
	})
	test('compares PSM with the DOT route at one finalized snapshot', async () => {
		const { exchange, client, exactIn } = fakeApi(true)
		const quotes = await exchange.quotes(mint)
		expect(quotes.map((quote) => quote.kind)).toEqual(['psm', 'amm'])
		expect(quotes[1].path).toEqual(['USDT', 'DOT', 'dotUSD'])
		expect(client.at).toHaveBeenCalledWith('0x5678')
		expect(exactIn.mock.calls[1][2]).toBe(997_000n)
	})
	test('quotes exact output backwards through both pools and sorts by required input', async () => {
		const { exchange, exactOut } = fakeApi(true)
		const quotes = await exchange.quotes({
			...mint,
			mode: 'exactOut',
		})
		expect(quotes[0].kind).toBe('psm')
		expect(exactOut.mock.calls[0].slice(0, 2)).toEqual([
			swapLocation('DOT'),
			swapLocation('dotUSD'),
		])
		expect(exactOut.mock.calls[1][2]).toBe(ceilDiv(1_000_000_000n, 997n))
	})
	test.each(['exactIn', 'exactOut'] as const)(
		'selects AMM ahead of PSM when its %s quote is better',
		async (mode) => {
			const { exchange, exactIn, exactOut } = fakeApi(true)
			const price = mode === 'exactIn' ? exactIn : exactOut
			price
				.mockResolvedValueOnce(1_000_000n)
				.mockResolvedValueOnce(mode === 'exactIn' ? 2_000_000n : 500_000n)
			expect(
				(await exchange.quotes({ ...mint, mode })).map(({ kind }) => kind),
			).toEqual(['amm', 'psm'])
		},
	)
	test('never invents routes for missing pools or an unapproved PSM asset', async () => {
		const { exchange, getReserves, query } = fakeApi(true)
		getReserves.mockResolvedValue(undefined)
		expect(await exchange.quotes({ ...mint, assetIn: 'USDC' })).toEqual([])
		expect(query.psm).not.toHaveBeenCalled()
	})
	test('encodes AMM slippage bounds and preserves the payer account', async () => {
		const { exchange, client } = fakeApi()
		const [quote] = await exchange.quotes({
			...mint,
			assetIn: 'DOT',
			assetOut: 'USDT',
			mode: 'exactOut',
		})
		exchange.swap(quote, 'sender', 'recipient', 50)
		expect(
			client.tx.assetConversion.swapTokensForExactTokens,
		).toHaveBeenCalledWith(
			[swapLocation('DOT'), swapLocation('USDT')],
			quote.amountOut,
			slippageLimit(quote.amountIn, 50, 'maximum'),
			'recipient',
			true,
		)
	})
	test('encodes minting with the quoted fee ceiling and sends atomically', async () => {
		const { exchange, client } = fakeApi(true)
		const [quote] = await exchange.quotes(mint)
		exchange.swap(quote, 'sender', 'recipient', 50)
		expect(client.tx.psm.mint).toHaveBeenCalledWith(
			swapLocation('dotUSD'),
			swapLocation('USDT'),
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
	test('encodes redemption followed by a transfer in the same atomic batch', async () => {
		const { exchange, client } = fakeApi(true)
		const quote = (await exchange.quotes({ ...redeem, mode: 'exactOut' })).find(
			({ kind }) => kind === 'psm',
		)!
		exchange.swap(quote, 'sender', 'recipient', 50)
		expect(client.tx.psm.redeem).toHaveBeenCalledWith(
			swapLocation('dotUSD'),
			swapLocation('USDT'),
			quote.amountIn,
			psm.redeemFee,
		)
		expect(client.tx.assets.transfer).toHaveBeenCalledWith(
			1984,
			'recipient',
			quote.amountOut,
		)
		expect(client.tx.utility.batchAll.mock.calls[0][0]).toEqual([
			client.tx.psm.redeem.mock.results[0].value.call,
			client.tx.assets.transfer.mock.results[0].value.call,
		])
	})
	test('does not add a transfer when the PSM recipient is the signer', async () => {
		const { exchange, client } = fakeApi(true)
		const [quote] = await exchange.quotes(mint)
		exchange.swap(quote, 'sender', 'sender', 50)
		expect(client.tx.psm.mint).toHaveBeenCalledOnce()
		expect(client.tx.utility.batchAll).not.toHaveBeenCalled()
		expect(client.tx.assets.transfer).not.toHaveBeenCalled()
	})
	test('uses the same boundary slippage limits in encoded transactions as the UI', async () => {
		const { exchange, client } = fakeApi()
		const [quote] = await exchange.quotes({ ...mint, assetIn: 'DOT' })
		exchange.swap({ ...quote, amountOut: 1n }, 'sender', 'recipient', 500)
		expect(
			client.tx.assetConversion.swapExactTokensForTokens.mock.calls[0][2],
		).toBe(1n)
		exchange.swap(
			{ ...quote, mode: 'exactOut', amountIn: U128_MAX },
			'sender',
			'recipient',
			500,
		)
		expect(
			client.tx.assetConversion.swapTokensForExactTokens.mock.calls[0][2],
		).toBe(U128_MAX)
	})
	test('applies the shared quote lifetime at its exact boundary and rejects invalid timestamps', async () => {
		const { exchange } = fakeApi()
		vi.spyOn(Date, 'now').mockReturnValue(100_000)
		const [quote] = await exchange.quotes(mint)
		expect(() =>
			exchange.swap(
				{ ...quote, fetchedAt: 100_000 - SwapQuoteExpiryMs },
				'sender',
				'recipient',
				50,
			),
		).not.toThrow()
		for (const fetchedAt of [
			100_000 - SwapQuoteExpiryMs - 1,
			100_001,
			Number.NaN,
		]) {
			expect(() =>
				exchange.swap({ ...quote, fetchedAt }, 'sender', 'recipient', 50),
			).toThrow('Quote expired')
		}
	})
	test('blocks stale swap quotes', () => {
		const { exchange } = fakeApi()
		const quote = {
			kind: 'amm',
			amountIn: 1n,
			amountOut: 1n,
			fetchedAt: Date.now() - 31_000,
		} as SwapQuote
		expect(() => exchange.swap(quote, 'sender', 'recipient', 50)).toThrow(
			/expired/,
		)
	})
})
