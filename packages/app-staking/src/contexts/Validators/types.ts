// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Sync } from '@w3ux/types'
import type {
	AnyJson,
	IdentityOf,
	Validator,
	ValidatorPrefs,
	ValidatorStatus,
} from 'types'

export type ValidatorActivityTier = 'belowBaseline' | 'good' | 'notRated'

export interface ValidatorsContextInterface {
	validatorsError: Error | null
	retryValidators: () => void
	getValidatorPrefs: (address: string) => ValidatorPrefs | null | undefined
	injectValidatorListData: (entries: Validator[]) => ValidatorListEntry[]
	getValidators: () => Validator[]
	validatorIdentities: Record<string, IdentityOf>
	validatorSupers: Record<string, AnyJson>
	validatorsFetched: Sync
	avgRewardRate: number
	averageEraValidatorReward: AverageEraValidatorReward
	formatWithPrefs: (addresses: string[]) => Validator[]
	getValidatorTotalStake: (address: string) => bigint
	getValidatorRank: (address: string) => number | undefined
	isValidatorHighPerformance: (address: string) => boolean
	getValidatorActivityTier: (
		address: string,
	) => ValidatorActivityTier | undefined
}

export interface AverageEraValidatorReward {
	days: number
	reward: bigint
}
export type ValidatorListEntry = Validator & {
	validatorStatus: ValidatorStatus
}
