// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
	ActiveAccountOwnStake,
	ErasStakersOverviewEntries,
	MaybeAddress,
	NominationStatus,
	Staker,
} from 'types'

export interface EraStakersContextInterface {
	subscribeExposures: () => () => void
	eraStakers: EraStakers
	validatorOverviews:
		| ReadonlyMap<string, ErasStakersOverviewEntries[number][1]>
		| undefined
	activeValidators: number
	activeNominatorsCount: number
	getNominationsStatusFromEraStakers: (
		who: MaybeAddress,
		targets: string[],
	) => Record<string, NominationStatus>
	getActiveValidator: (who: string) => Staker | undefined
	prevEraReward: {
		era: number
		points: { total: number; individual: [string, number][] } | undefined
		payout: bigint | undefined
	}
}

export interface EraStakers {
	activeAccountOwnStake: ActiveAccountOwnStake[]
	stakers: Staker[]
}
