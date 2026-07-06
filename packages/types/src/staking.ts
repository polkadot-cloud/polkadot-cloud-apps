// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SpStakingPagedExposureMetadata } from 'dedot/chaintypes'

export interface EraRewardPoints {
	total: number
	individual: Array<[string, number]>
}
export type ErasStakersOverviewEntries = [
	[number, string],
	SpStakingPagedExposureMetadata,
][]

export type ErasStakersPagedEntries = [
	[number, string, number],
	{
		pageTotal: bigint
		others: {
			who: string
			value: bigint
		}[]
	},
][]

export type RewardDestinaton =
	| 'Staked'
	| 'Stash'
	| 'Controller'
	| 'Account'
	| 'None'

export interface UnlockChunk {
	era: number
	value: bigint
}

export type Staker = ExposureValue & {
	address: string
}

export interface ActiveAccountOwnStake {
	address: string
	value: string
}

export type ActiveAccountStaker = ActiveAccountOwnStake

export interface Exposure {
	keys: string[]
	val: ExposureValue
}

export interface ExposureValue {
	others: ExposureOther[]
	own: string
	total: string
}

export interface ExposureOther {
	who: string
	value: string
}

export interface LocalExposuresData {
	era: string
	exposures: LocalExposure[]
}

export interface LocalExposure {
	k: [string, string]
	v: {
		o: [string, string]
		w: string
		t: string
	}
}
