// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { StakingMetrics } from 'types'

export const defaultStakingMetrics: StakingMetrics = {
	totalIssuance: 0n,
	minimumActiveStake: 0n,
	counterForValidators: 0,
	maxValidatorsCount: undefined,
	validatorCount: 0,
	lastReward: undefined,
	lastTotalStake: 0n,
	minNominatorBond: 0n,
	minValidatorBond: 0n,
	totalStaked: 0n,
	counterForNominators: 0,
}
