// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { HydrationApi } from '@dedot/chaintypes/hydration'
import type { PolkadotAssetHubApi } from '@dedot/chaintypes/polkadot-asset-hub'
import type { PolkadotPeopleApi } from '@dedot/chaintypes/polkadot-people'
import {
	Builder,
	findAssetInfo,
	getSupportedDestinations,
	Native,
	type TXcmFeeBase,
} from '@paraspell/sdk-dedot'
import { CrossChainAssets, isCrossChainAssetSupported } from 'consts/crossChain'
import { getStablecoinAssetConfig } from 'consts/stablecoins'
import type { DedotClient } from 'dedot'
import type { GenericSubstrateApi } from 'dedot/types'
import type {
	CrossChainAsset,
	CrossChainTransfer,
	CrossChainTransferInput,
	StablecoinChainId,
} from 'types'
import { asTx } from '../util'

const chainNames = {
	statemint: 'AssetHubPolkadot',
	hydration: 'Hydration',
	'people-polkadot': 'PeoplePolkadot',
} as const

type CrossChainApis = {
	statemint: DedotClient<PolkadotAssetHubApi>
	hydration?: DedotClient<HydrationApi>
	'people-polkadot'?: DedotClient<PolkadotPeopleApi>
}

const currencyFor = (chain: StablecoinChainId, symbol: CrossChainAsset) => {
	if (chain !== 'hydration' && symbol === 'DOT')
		return { symbol: Native('DOT') }
	const id = getStablecoinAssetConfig(chain, symbol)?.assetId
	if (id === undefined)
		throw new Error(`Unsupported cross-chain asset: ${symbol}`)
	return { id }
}

// Registry spellings (e.g. USDt) differ from the symbols used by app balances.
const normalizeFee = (
	{ fee: amount, asset }: TXcmFeeBase,
	chain: StablecoinChainId,
) => {
	const symbol = CrossChainAssets.find((symbol) => {
		const id = getStablecoinAssetConfig(chain, symbol)?.assetId
		return chain !== 'hydration' && symbol === 'DOT'
			? asset.isNative && asset.symbol === 'DOT'
			: id !== undefined && asset.assetId === String(id)
	})
	if (!symbol)
		throw new Error(`Unsupported cross-chain fee currency: ${asset.symbol}`)
	return { amount, symbol, decimals: asset.decimals }
}

// Reuse service-owned APIs. ParaSpell disconnect() releases only its own clients.
export const prepareCrossChainTransfer = async (
	apis: CrossChainApis,
	input: CrossChainTransferInput,
): Promise<CrossChainTransfer> => {
	const { from, to, symbol, amount, sender, recipient, feeAsset } = input
	if (
		amount <= 0n ||
		!isCrossChainAssetSupported(from, to, symbol) ||
		!isCrossChainAssetSupported(from, to, feeAsset)
	) {
		throw new Error('Invalid cross-chain transfer')
	}
	if (!apis[from] || !apis[to]) {
		throw new Error('Cross-chain clients unavailable for these chains')
	}
	const origin = chainNames[from]
	const destination = chainNames[to]
	const currency = currencyFor(from, symbol)
	const feeCurrency = currencyFor(from, feeAsset)
	const asset = findAssetInfo(origin, currency, destination)
	if (
		!asset ||
		!getSupportedDestinations(origin, currency).includes(destination)
	) {
		throw new Error(`No supported ${symbol} route between these chains`)
	}
	const builder = Builder({
		abstractDecimals: false,
		apiOverrides: Object.fromEntries(
			Object.entries(apis)
				.filter(([, api]) => !!api)
				.map(([chain, api]) => [
					chainNames[chain as StablecoinChainId],
					api as unknown as DedotClient<GenericSubstrateApi>,
				]),
		),
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
		// getTransferInfo already checks the received amount against the destination ED.
		// verifyEdOnDestination repeats the full XCM fee simulation.
		if (
			received.sufficient !== true ||
			typeof received.receivedAmount !== 'bigint' ||
			received.receivedAmount <= 0n
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
		}
	} finally {
		await builder.disconnect()
	}
}
