// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getStablecoinAssetConfig } from 'consts/stablecoins'
import type { SubmittableExtrinsic } from 'dedot'
import type { PayloadOptions } from 'dedot/types'
import type {
	FeeAssetSymbol,
	StablecoinBalance,
	StablecoinFeeEstimateInput,
	StablecoinTransferInput,
} from 'types'

// Minimal free/frozen balance shape shared by all stablecoin balance sources.
export type BalancePair = {
	free: bigint
	frozen: bigint
}

// Common interface implemented by each chain-specific stablecoin adapter.
export type StablecoinAdapter = {
	feeAssets: FeeAssetSymbol[]
	balance: (
		address: string,
		symbol: FeeAssetSymbol,
	) => Promise<StablecoinBalance | undefined>
	transfer: (
		input: StablecoinTransferInput,
	) => Promise<SubmittableExtrinsic | undefined>
	paymentOptions: (symbol: FeeAssetSymbol) => PayloadOptions | undefined
	estimateFee: (input: StablecoinFeeEstimateInput) => Promise<bigint>
}

// Builds an empty balance for a configured stablecoin when a lookup fails.
export const zeroBalance = (
	chain: StablecoinBalance['chain'],
	symbol: FeeAssetSymbol,
): StablecoinBalance | undefined => {
	const config = getStablecoinAssetConfig(chain, symbol)
	if (!config) {
		return undefined
	}

	return {
		chain,
		symbol,
		free: 0n,
		frozen: 0n,
		existentialDeposit: config.existentialDeposit,
		decimals: config.decimals,
	}
}

// Adds stablecoin metadata to a raw free/frozen balance pair.
export const toStablecoinBalance = (
	chain: StablecoinBalance['chain'],
	symbol: FeeAssetSymbol,
	balance: BalancePair,
): StablecoinBalance | undefined => {
	const config = getStablecoinAssetConfig(chain, symbol)
	if (!config) {
		return undefined
	}

	return {
		chain,
		symbol,
		free: balance.free,
		frozen: balance.frozen,
		existentialDeposit: config.existentialDeposit,
		decimals: config.decimals,
	}
}
