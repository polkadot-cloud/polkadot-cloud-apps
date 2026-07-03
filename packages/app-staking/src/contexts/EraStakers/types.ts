// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
	ActiveAccountOwnStake,
	MaybeAddress,
	NominationStatus,
	Staker,
} from 'types'

export interface EraStakersContextInterface {
	eraStakers: EraStakers
	activeValidators: number
	activeNominatorsCount: number
	getNominationsStatusFromEraStakers: (
		who: MaybeAddress,
		targets: string[],
	) => Record<string, NominationStatus>
	isNominatorActive: (who: string) => boolean
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
