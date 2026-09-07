// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ActiveAccountOwnStake, MaybeAddress, Staker } from 'types'

export interface EraStakersContextInterface {
	eraStakers: EraStakers
	activeValidators: number
	syncing: boolean
	error: Error | undefined
	getActiveValidator: (who: MaybeAddress) => Staker | undefined
}

export interface EraStakers {
	activeAccountOwnStake: ActiveAccountOwnStake[]
	stakers: Staker[]
}
