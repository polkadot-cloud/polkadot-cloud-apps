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
} from '../../app-swap/src/pages/CrossChain/utils'
import {
	findAssetInfo,
	getSupportedDestinations,
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
			asset: { assetId: '1337', symbol: 'USDC', decimals: 6 },
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
			asset: { assetId: '22', symbol: 'USDC', decimals: 6 },
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
			const asset = findAssetInfo(origin, { id }, destination)!
			expect(asset).toBeTruthy()
			expect(getSupportedDestinations(origin, { id })).toContain(destination)
			const quoteInfo = info()
			quoteInfo.origin.xcmFee.asset = {
				assetId: String(id),
				symbol: symbol === 'USDT' ? 'USDt' : symbol,
				decimals: 6,
			}
			quoteInfo.destination.xcmFee.asset = {
				assetId: String(destId),
				symbol,
				decimals: 6,
			}
			builder.getTransferInfo.mockResolvedValue(quoteInfo)
			const result = await prepareCrossChainTransfer(hub, hydration, {
				...input,
				from,
				to,
				symbol,
				feeAsset: symbol,
			})
			expect(mocked.Builder).toHaveBeenCalledWith({
				abstractDecimals: false,
				apiOverrides: { AssetHubPolkadot: hub, Hydration: hydration },
			})
			expect(builder.currency).toHaveBeenCalledWith({
				location: asset.location,
				amount: 2_000_000n,
			})
			expect(builder.feeAsset).toHaveBeenCalledWith({ id })
			expect(builder.recipient).toHaveBeenCalledWith('recipient')
			expect(builder.sender).toHaveBeenCalledWith('sender')
			expect(result.originFee.symbol).toBe(symbol)
			expect(result.destinationFee.symbol).toBe(symbol)
			expect(result.receivedAmount).toBe(1_998_000n)
			expect(result.originFeeFromAmount).toBe(from === 'statemint')
			expect(builder.disconnect).toHaveBeenCalledOnce()
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
		expect(parseTransferAmount(amount)).toBe(expected)
	})
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
