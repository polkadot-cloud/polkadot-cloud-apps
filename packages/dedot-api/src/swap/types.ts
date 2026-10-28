// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { PolkadotAssetHubApi } from '@dedot/chaintypes/polkadot-asset-hub'
import type { swapLocation } from 'consts/swap'
import type {
	DedotClient,
	ISubstrateClientAt,
	SubmittableExtrinsic,
} from 'dedot'
import type { GenericStorageQuery } from 'dedot/types'
import type { HexString } from 'dedot/utils'
import type { SwapPsm } from 'types'

// The connected Asset Hub client used to create swap transactions.
export type SwapApi = DedotClient<PolkadotAssetHubApi>

// One finalized block shared by every route in a quote response.
export type SwapSnapshot = {
	at: ISubstrateClientAt<PolkadotAssetHubApi>
	hash: HexString
	fetchedAt: number
}

// XCM location used to identify a supported swap asset.
export type Location = ReturnType<typeof swapLocation>

// Internal and external asset locations used as PSM storage keys.
export type PsmPair = [Location, Location]

// PSM instance fields needed to calculate capacity and interpret balances.
export type PsmInfo = {
	maxDebt: bigint
	minSwapAmount: bigint
	internalDecimals: number
}

// Approval status and recorded decimals for an external PSM asset.
export type PsmExternal = { status: SwapPsm['status']; decimals: number }

// Runtime-metadata bindings for PSM storage not yet covered by generated chain types.
export type PsmQueries = {
	psm: GenericStorageQuery<
		(internal: Location) => PsmInfo | undefined,
		Location
	>
	externalAssets: GenericStorageQuery<
		(pair: PsmPair) => PsmExternal | undefined,
		PsmPair
	>
	psmDebt: GenericStorageQuery<(pair: PsmPair) => bigint, PsmPair>
	mintingFee: GenericStorageQuery<(pair: PsmPair) => number, PsmPair>
	redemptionFee: GenericStorageQuery<(pair: PsmPair) => number, PsmPair>
	assetCeilingWeight: GenericStorageQuery<(pair: PsmPair) => number, PsmPair>
}

// PSM calls encoded by Dedot using the connected runtime's metadata.
export type PsmTransactions = Record<
	'mint' | 'redeem',
	(
		internal: Location,
		external: Location,
		amount: bigint,
		maxFee: number,
	) => SubmittableExtrinsic
>
