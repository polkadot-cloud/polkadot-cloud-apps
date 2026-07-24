// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
	ActiveAccountOwnStake,
	Exposure,
	MaybeAddress,
	NetworkId,
	Staker,
} from 'types'

export interface ProcessExposuresArgs {
	task: string
	networkName: NetworkId
	era: string
	activeAccount: MaybeAddress
	units: number
	exposures: Exposure[]
}

export interface ProcessExposuresResponse {
	task: string
	networkName: NetworkId
	era: string
	stakers: Staker[]
	activeAccountOwnStake: ActiveAccountOwnStake[]
	who: MaybeAddress
}
