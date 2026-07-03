// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Sync } from '@w3ux/types'
import type { AnyJson, IdentityOf, Validator, ValidatorStatus } from 'types'

export interface ValidatorsContextInterface {
	fetchValidatorPrefs: (a: ValidatorAddresses) => Promise<Validator[] | null>
	injectValidatorListData: (entries: Validator[]) => ValidatorListEntry[]
	getValidators: () => Validator[]
	validatorIdentities: Record<string, IdentityOf>
	validatorSupers: Record<string, AnyJson>
	avgCommission: number
	validatorsFetched: Sync
	avgRewardRate: number
	averageEraValidatorReward: AverageEraValidatorReward
	formatWithPrefs: (addresses: string[]) => Validator[]
	getValidatorTotalStake: (address: string) => bigint
	getValidatorRank: (address: string) => number | undefined
	getValidatorRankSegment: (address: string) => number
}

export interface AverageEraValidatorReward {
	days: number
	reward: bigint
}
export interface Validators {
	status: Sync
	validators: Validator[]
}

export type ValidatorAddresses = {
	address: string
}[]

export interface LocalValidatorEntriesData {
	avgCommission: number
	era: string
	entries: Validator[]
}

export type ValidatorListEntry = Validator & {
	validatorStatus: ValidatorStatus
}
