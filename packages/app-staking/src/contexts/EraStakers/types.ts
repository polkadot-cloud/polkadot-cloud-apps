// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { QueryStatus } from '@tanstack/react-query'
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
	exposuresStatus: QueryStatus
	validatorOverviews:
		| ReadonlyMap<string, ErasStakersOverviewEntries[number][1]>
		| undefined
	activeValidators: number
	getNominationsStatusFromEraStakers: (
		who: MaybeAddress,
		targets: string[],
	) => Record<string, NominationStatus>
	getActiveValidator: (who: string) => Staker | undefined
}

export interface EraStakers {
	activeAccountOwnStake: ActiveAccountOwnStake[]
	stakers: Staker[]
}
