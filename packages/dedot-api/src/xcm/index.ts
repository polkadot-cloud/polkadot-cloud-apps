// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { HydrationApi } from '@dedot/chaintypes/hydration'
import type { PolkadotAssetHubApi } from '@dedot/chaintypes/polkadot-asset-hub'
import {
	Builder,
	findAssetInfo,
	getSupportedDestinations,
	Native,
	type TXcmFeeBase,
} from '@paraspell/sdk-dedot'
import { getStablecoinAssetConfig } from 'consts/stablecoins'
import type { DedotClient } from 'dedot'
import type { GenericSubstrateApi } from 'dedot/types'
import type {
	CrossChainTransfer,
	CrossChainTransferInput,
	StablecoinChainId,
} from 'types'
import { asTx } from '../util'

const chainNames = {
	statemint: 'AssetHubPolkadot',
	hydration: 'Hydration',
} as const

// Registry spellings (e.g. USDt) differ from the symbols used by app balances.
const normalizeFee = (
	{ fee: amount, asset }: TXcmFeeBase,
	chain: StablecoinChainId,
) => {
	const symbol = (['DOT', 'USDC', 'USDT'] as const).find((symbol) => {
		const id = getStablecoinAssetConfig(chain, symbol)?.assetId
		return chain === 'statemint' && symbol === 'DOT'
			? asset.isNative && asset.symbol === 'DOT'
			: id !== undefined && asset.assetId === String(id)
	})
	if (!symbol)
		throw new Error(`Unsupported cross-chain fee currency: ${asset.symbol}`)
	return { amount, symbol, decimals: asset.decimals }
}

// Reuse service-owned APIs. ParaSpell disconnect() releases only its own clients.
export const prepareCrossChainTransfer = async (
	assetHub: DedotClient<PolkadotAssetHubApi>,
	hydration: DedotClient<HydrationApi>,
	input: CrossChainTransferInput,
): Promise<CrossChainTransfer> => {
	const { from, to, symbol, amount, sender, recipient, feeAsset } = input
	if (from === to || amount <= 0n || !['USDC', 'USDT'].includes(symbol)) {
		throw new Error('Invalid cross-chain transfer')
	}
	const origin = chainNames[from]
	const destination = chainNames[to]
	const assetId = getStablecoinAssetConfig(from, symbol)?.assetId
	if (assetId === undefined) throw new Error('Unsupported cross-chain asset')
	const currency = { id: assetId }
	const asset = findAssetInfo(origin, currency, destination)
	if (
		!asset ||
		!getSupportedDestinations(origin, currency).includes(destination)
	) {
		throw new Error(`No supported ${symbol} route between these chains`)
	}
	const feeId = getStablecoinAssetConfig(from, feeAsset)?.assetId
	const feeCurrency =
		from === 'statemint' && feeAsset === 'DOT'
			? { symbol: Native('DOT') }
			: { id: feeId! }
	if ('id' in feeCurrency && feeCurrency.id === undefined) {
		throw new Error('Unsupported fee asset')
	}
	const builder = Builder({
		abstractDecimals: false,
		apiOverrides: {
			AssetHubPolkadot: assetHub as unknown as DedotClient<GenericSubstrateApi>,
			Hydration: hydration as unknown as DedotClient<GenericSubstrateApi>,
		},
	})
		.from(origin)
		.to(destination)
		.currency({
			...(asset.location ? { location: asset.location } : currency),
			amount,
		})
		.feeAsset(feeCurrency)
		.recipient(recipient)
		.sender(sender)
	try {
		const info = await builder.getTransferInfo()
		if (
			!info.origin.selectedCurrency.sufficient ||
			!info.origin.xcmFee.sufficient
		) {
			throw new Error(
				'Insufficient balance for the transfer and cross-chain fees',
			)
		}
		const received = info.destination.receivedCurrency
		if (
			received.sufficient !== true ||
			typeof received.receivedAmount !== 'bigint' ||
			received.receivedAmount <= 0n ||
			!(await builder.verifyEdOnDestination())
		) {
			throw new Error(
				'The recipient would receive less than the destination minimum balance',
			)
		}
		const simulation = await builder.dryRun()
		if (!simulation.success) {
			throw new Error(
				'Cross-chain simulation failed. Check the amount and fee balance.',
			)
		}
		const tx = asTx(await builder.build())
		return {
			tx,
			originFee: normalizeFee(info.origin.xcmFee, from),
			originFeeFromAmount: from === 'statemint' && feeAsset === symbol,
			destinationFee: normalizeFee(info.destination.xcmFee, to),
			receivedAmount: received.receivedAmount,
			destinationBalance: received.balance,
			fetchedAt: Date.now(),
		}
	} finally {
		await builder.disconnect()
	}
}
