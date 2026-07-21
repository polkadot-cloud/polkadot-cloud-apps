// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { HydrationApi } from '@dedot/chaintypes/hydration'
import type { PolkadotAssetHubApi } from '@dedot/chaintypes/polkadot-asset-hub'
import type { DedotClient, SubmittableExtrinsic } from 'dedot'
import type { PayloadOptions } from 'dedot/types'
import type {
	FeeAssetSymbol,
	StablecoinBalance,
	StablecoinChainId,
	StablecoinFeeEstimateInput,
	StablecoinTransferInput,
} from 'types'
import { createAssetHubStablecoinAdapter } from './assetHub'
import {
	createHydrationStablecoinAdapter,
	type HydrationStablecoinAdapter,
} from './hydration'
import type { StablecoinAdapter } from './shared'

type StablecoinAdapters = {
	statemint: StablecoinAdapter
	hydration: HydrationStablecoinAdapter
}

// Stablecoin API facade for balances, transfers, fee assets, and fee estimates.
export class StablecoinsService {
	private adapters: StablecoinAdapters

	constructor(
		apiHub: DedotClient<PolkadotAssetHubApi>,
		getHydrationApi: () => Promise<DedotClient<HydrationApi>>,
	) {
		this.adapters = {
			statemint: createAssetHubStablecoinAdapter(apiHub),
			hydration: createHydrationStablecoinAdapter(getHydrationApi),
		}
	}

	// Fetches all configured stablecoin balances across Asset Hub and Hydration.
	balances = async (address: string): Promise<StablecoinBalance[]> => {
		const jobs = Object.values(this.adapters).flatMap((adapter) =>
			adapter.feeAssets.map((symbol) => adapter.balance(address, symbol)),
		)

		const balances = await Promise.all(jobs)
		return balances.filter((balance): balance is StablecoinBalance => !!balance)
	}

	// Fetches one configured stablecoin balance for the requested chain and symbol.
	balance = async (
		address: string,
		chain: StablecoinChainId,
		symbol: FeeAssetSymbol,
	): Promise<StablecoinBalance | undefined> => {
		return this.adapters[chain].balance(address, symbol)
	}

	// Reads the user's currently selected Hydration transaction fee currency.
	hydrationFeeCurrency = async (
		address: string,
	): Promise<FeeAssetSymbol | undefined> => {
		return this.adapters.hydration.hydrationFeeCurrency(address)
	}

	// Builds a transfer extrinsic for Asset Hub assets or Hydration tokens.
	transfer = async ({
		chain,
		symbol,
		recipient,
		amount,
	}: StablecoinTransferInput): Promise<SubmittableExtrinsic | undefined> => {
		return this.adapters[chain].transfer({ chain, symbol, recipient, amount })
	}

	// Builds a Hydration extrinsic that changes the account's fee currency.
	setHydrationFeeCurrency = async (
		symbol: FeeAssetSymbol,
	): Promise<SubmittableExtrinsic | undefined> => {
		return this.adapters.hydration.setHydrationFeeCurrency(symbol)
	}

	// Supplies Asset Hub payload options when fees should be paid in an asset.
	paymentOptions = (
		chain: StablecoinChainId,
		symbol: FeeAssetSymbol,
	): PayloadOptions | undefined => {
		return this.adapters[chain].paymentOptions(symbol)
	}

	// Estimates the transaction fee in the requested fee asset when supported.
	estimateFee = async ({
		chain,
		symbol,
		tx,
		from,
		payloadOptions,
	}: StablecoinFeeEstimateInput): Promise<bigint> => {
		return this.adapters[chain].estimateFee({
			chain,
			symbol,
			tx,
			from,
			payloadOptions,
		})
	}
}
