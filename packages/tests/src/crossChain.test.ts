// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
	CrossChainTransfer,
	CrossChainTransferInput,
	StablecoinBalance,
} from 'types'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import {
	canFundTransfer,
	parseTransferAmount,
} from '../../app-swap/src/pages/Bridge/utils'
import {
	findAssetInfo,
	getSupportedDestinations,
	Native,
	type TXcmFeeBase,
} from '../../dedot-api/node_modules/@paraspell/sdk-dedot'
import { prepareCrossChainTransfer } from '../../dedot-api/src/xcm'

const mocked = vi.hoisted(() => ({ Builder: vi.fn() }))
vi.mock(
	'../../dedot-api/node_modules/@paraspell/sdk-dedot',
	async (original) => ({
		...(await original<object>()),
		Builder: mocked.Builder,
	}),
)

const input: CrossChainTransferInput = {
	from: 'statemint',
	to: 'hydration',
	symbol: 'USDC',
	amount: 2_000_000n,
	sender: 'sender',
	recipient: 'recipient',
	feeAsset: 'USDC',
}
const info = () => ({
	origin: {
		selectedCurrency: { sufficient: true },
		xcmFee: {
			sufficient: true,
			fee: 1000n,
			asset: {
				assetId: '1337',
				symbol: 'USDC',
				decimals: 6,
			} as TXcmFeeBase['asset'],
		},
	},
	destination: {
		receivedCurrency: {
			sufficient: true,
			receivedAmount: 1_998_000n,
			balance: 0n,
		},
		xcmFee: {
			fee: 1000n,
			asset: {
				assetId: '22',
				symbol: 'USDC',
				decimals: 6,
			} as TXcmFeeBase['asset'],
		},
	},
})
const tx = {} as CrossChainTransfer['tx']
const builder = {
	from: vi.fn().mockReturnThis(),
	to: vi.fn().mockReturnThis(),
	currency: vi.fn().mockReturnThis(),
	feeAsset: vi.fn().mockReturnThis(),
	recipient: vi.fn().mockReturnThis(),
	sender: vi.fn().mockReturnThis(),
	getTransferInfo: vi.fn(),
	verifyEdOnDestination: vi.fn(),
	dryRun: vi.fn(),
	build: vi.fn(),
	disconnect: vi.fn(),
}
const hub = {} as Parameters<typeof prepareCrossChainTransfer>[0]
const hydration = {} as Parameters<typeof prepareCrossChainTransfer>[1]
beforeEach(() => {
	vi.clearAllMocks()
	mocked.Builder.mockReturnValue(builder)
	builder.getTransferInfo.mockResolvedValue(info())
	builder.verifyEdOnDestination.mockResolvedValue(true)
	builder.dryRun.mockResolvedValue({ success: true })
	builder.build.mockResolvedValue(tx)
})

describe('Cross-chain preflight', () => {
	test.each([
		[
			'statemint',
			'hydration',
			'DOT',
			'AssetHubPolkadot',
			'Hydration',
			undefined,
			5,
		],
		[
			'hydration',
			'statemint',
			'DOT',
			'Hydration',
			'AssetHubPolkadot',
			5,
			undefined,
		],
		[
			'statemint',
			'hydration',
			'USDC',
			'AssetHubPolkadot',
			'Hydration',
			1337,
			22,
		],
		[
			'statemint',
			'hydration',
			'USDT',
			'AssetHubPolkadot',
			'Hydration',
			1984,
			10,
		],
		[
			'hydration',
			'statemint',
			'USDC',
			'Hydration',
			'AssetHubPolkadot',
			22,
			1337,
		],
		[
			'hydration',
			'statemint',
			'USDT',
			'Hydration',
			'AssetHubPolkadot',
			10,
			1984,
		],
	] as const)(
		'prepares %s → %s %s using the installed registry',
		async (from, to, symbol, origin, destination, id, destId) => {
			const currency = id === undefined ? { symbol: Native('DOT') } : { id }
			const destCurrency =
				destId === undefined ? { symbol: Native('DOT') } : { id: destId }
			const asset = findAssetInfo(origin, currency, destination)!
			const destAsset = findAssetInfo(destination, destCurrency, origin)!
			expect(asset).toBeTruthy()
			expect(destAsset).toBeTruthy()
			expect(getSupportedDestinations(origin, currency)).toContain(destination)
			const amount = symbol === 'DOT' ? 20_000_000_001n : 2_000_000n
			const receivedAmount = symbol === 'DOT' ? 19_980_000_001n : 1_998_000n
			const quoteInfo = info()
			quoteInfo.origin.xcmFee.asset = {
				...asset,
				symbol: symbol === 'USDT' ? 'USDt' : symbol,
			}
			quoteInfo.destination.xcmFee.asset = destAsset
			quoteInfo.destination.receivedCurrency.receivedAmount = receivedAmount
			builder.getTransferInfo.mockResolvedValue(quoteInfo)
			const result = await prepareCrossChainTransfer(hub, hydration, {
				...input,
				from,
				to,
				symbol,
				amount,
				feeAsset: symbol,
			})
			expect(mocked.Builder).toHaveBeenCalledWith({
				abstractDecimals: false,
				apiOverrides: { AssetHubPolkadot: hub, Hydration: hydration },
			})
			expect(builder.currency).toHaveBeenCalledWith({
				location: asset.location,
				amount,
			})
			expect(builder.feeAsset).toHaveBeenCalledWith(currency)
			expect(builder.recipient).toHaveBeenCalledWith('recipient')
			expect(builder.sender).toHaveBeenCalledWith('sender')
			expect(result.originFee.symbol).toBe(symbol)
			expect(result.destinationFee.symbol).toBe(symbol)
			expect(result.originFee.decimals).toBe(symbol === 'DOT' ? 10 : 6)
			expect(result.destinationFee.decimals).toBe(symbol === 'DOT' ? 10 : 6)
			expect(result.receivedAmount).toBe(receivedAmount)
			expect(result.originFeeFromAmount).toBe(from === 'statemint')
			expect(builder.disconnect).toHaveBeenCalledOnce()
		},
	)
	test.each([
		['statemint', 'hydration', 1337, 22],
		['hydration', 'statemint', 22, 1337],
	] as const)(
		'bridges DOT from %s to %s while paying fees in USDC',
		async (from, to, feeId, destFeeId) => {
			const quoteInfo = info()
			quoteInfo.origin.xcmFee.asset.assetId = String(feeId)
			quoteInfo.destination.xcmFee.asset.assetId = String(destFeeId)
			quoteInfo.destination.receivedCurrency.receivedAmount = 19_980_000_001n
			builder.getTransferInfo.mockResolvedValue(quoteInfo)
			const result = await prepareCrossChainTransfer(hub, hydration, {
				...input,
				from,
				to,
				symbol: 'DOT',
				amount: 20_000_000_001n,
			})
			expect(builder.currency).toHaveBeenCalledWith({
				location: { parents: 1, interior: { Here: null } },
				amount: 20_000_000_001n,
			})
			expect(builder.feeAsset).toHaveBeenCalledWith({ id: feeId })
			expect(result.originFee.symbol).toBe('USDC')
			expect(result.originFee.decimals).toBe(6)
			expect(result.destinationFee.symbol).toBe('USDC')
			expect(result.originFeeFromAmount).toBe(false)
			expect(result.receivedAmount).toBe(19_980_000_001n)
		},
	)
	test.each(['balance', 'destination', 'simulation', 'rpc'] as const)(
		'blocks failed %s checks and releases SDK resources',
		async (failure) => {
			const quoteInfo = info()
			if (failure === 'balance')
				quoteInfo.origin.selectedCurrency.sufficient = false
			if (failure === 'destination')
				builder.verifyEdOnDestination.mockResolvedValue(false)
			if (failure === 'simulation')
				builder.dryRun.mockResolvedValue({ success: false })
			builder.getTransferInfo.mockResolvedValue(quoteInfo)
			if (failure === 'rpc')
				builder.getTransferInfo.mockRejectedValue(new Error('RPC unavailable'))
			await expect(
				prepareCrossChainTransfer(hub, hydration, input),
			).rejects.toThrow()
			expect(builder.build).not.toHaveBeenCalled()
			expect(builder.disconnect).toHaveBeenCalledOnce()
		},
	)
	test('rejects same-chain, unsupported-token and nonpositive transfers', async () => {
		for (const changes of [
			{ to: 'statemint' },
			{ symbol: 'HOLLAR' },
			{ symbol: 'dotUSD' },
			{ amount: 0n },
			{ amount: -1n },
		]) {
			await expect(
				prepareCrossChainTransfer(hub, hydration, {
					...input,
					...changes,
				} as CrossChainTransferInput),
			).rejects.toThrow()
		}
		expect(mocked.Builder).not.toHaveBeenCalled()
	})
})

describe('Cross-chain amounts and funding', () => {
	test.each(['statemint', 'hydration'] as const)(
		'reserves DOT fees and frozen funds when bridging from %s',
		(from) => {
			const transfer: CrossChainTransferInput = {
				...input,
				from,
				to: from === 'statemint' ? 'hydration' : 'statemint',
				symbol: 'DOT',
				feeAsset: 'DOT',
				amount: 10_000_000_001n,
			}
			const quote: CrossChainTransfer = {
				tx,
				originFee: { symbol: 'DOT', amount: 1_000_000n, decimals: 10 },
				originFeeFromAmount: from === 'statemint',
				destinationFee: { symbol: 'DOT', amount: 1_000_000n, decimals: 10 },
				receivedAmount: 9_998_000_001n,
				destinationBalance: 0n,
				fetchedAt: Date.now(),
			}
			const fee = 2_000_000n
			const frozen = 300_000_000n
			const originReserve = quote.originFeeFromAmount
				? 0n
				: quote.originFee.amount
			const balance: StablecoinBalance = {
				chain: from,
				symbol: 'DOT',
				decimals: 10,
				free: transfer.amount + frozen + fee + originReserve,
				frozen,
				existentialDeposit: 100_000_000n,
			}
			expect(canFundTransfer([balance], transfer, quote, fee)).toBe(true)
			expect(
				canFundTransfer(
					[{ ...balance, free: balance.free - 1n }],
					transfer,
					quote,
					fee,
				),
			).toBe(false)
		},
	)
	test.each([
		['0.000001', 1n],
		['1.234567', 1_234_567n],
		['9007199254740993.000001', 9_007_199_254_740_993_000_001n],
		['1.0000001', 0n],
		['-1', 0n],
		['1e6', 0n],
		['NaN', 0n],
		['', 0n],
	] as const)('parses %s exactly without rounding', (amount, expected) => {
		expect(parseTransferAmount(amount, 6)).toBe(expected)
	})
	test.each([
		['0.0000000001', 1n],
		['1.2345678901', 12_345_678_901n],
		['9007199254740993.0000000001', 90_071_992_547_409_930_000_000_001n],
		['1.00000000001', 0n],
		['-1', 0n],
		['1e10', 0n],
	] as const)(
		'parses DOT amount %s at ten-decimal precision',
		(amount, expected) => {
			expect(parseTransferAmount(amount, 10)).toBe(expected)
		},
	)
	test('combines transfer and fee debits, respects frozen funds, and avoids charging deducted fees twice', async () => {
		const quote = await prepareCrossChainTransfer(hub, hydration, input)
		const balance: StablecoinBalance = {
			chain: 'statemint',
			symbol: 'USDC',
			decimals: 6,
			free: 2_010_500n,
			frozen: 0n,
			existentialDeposit: 10_000n,
		}
		expect(canFundTransfer([balance], input, quote, 500n)).toBe(true)
		expect(
			canFundTransfer(
				[balance],
				input,
				{ ...quote, originFeeFromAmount: false },
				500n,
			),
		).toBe(false)
		expect(
			canFundTransfer([{ ...balance, frozen: 11_000n }], input, quote, 500n),
		).toBe(false)
		expect(
			canFundTransfer([{ ...balance, chain: 'hydration' }], input, quote, 500n),
		).toBe(false)
		expect(
			canFundTransfer([balance], { ...input, feeAsset: 'DOT' }, quote, 500n),
		).toBe(false)
	})
})
