// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getStablecoinAssetConfig } from 'consts/stablecoins'
import type { SubmittableExtrinsic } from 'dedot'
import type { PayloadOptions } from 'dedot/types'
import type {
	AssetTransferInput,
	FeeAssetSymbol,
	StablecoinBalance,
	StablecoinFeeEstimateInput,
} from 'types'
import type {
	BalanceCallback,
	ErrorCallback,
} from '../subscribe/stablecoinBalances'

// Minimal free/frozen balance shape shared by all stablecoin balance sources.
export type BalancePair = {
	free: bigint
	frozen: bigint
}

// Common interface implemented by each chain-specific stablecoin adapter.
export type StablecoinAdapter = {
	feeAssets: FeeAssetSymbol[]
	subscribe: (
		address: string,
		onBalance: BalanceCallback,
		onError: ErrorCallback,
	) => () => void
	balance: (
		address: string,
		symbol: FeeAssetSymbol,
	) => Promise<StablecoinBalance | undefined>
	transfer: (
		input: AssetTransferInput,
	) => Promise<SubmittableExtrinsic | undefined>
	paymentOptions: (symbol: FeeAssetSymbol) => PayloadOptions | undefined
	estimateFee: (input: StablecoinFeeEstimateInput) => Promise<bigint>
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

// Builds an empty balance for a configured stablecoin when a lookup fails.
export const zeroBalance = (
	chain: StablecoinBalance['chain'],
	symbol: FeeAssetSymbol,
) => toStablecoinBalance(chain, symbol, { free: 0n, frozen: 0n })
