// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createSafeContext } from '@w3ux/hooks'
import { useEraStakers } from 'contexts/EraStakers'
import {
	useDataGate,
	useDataResource,
	useIdentities,
	useValidatorDirectory,
} from 'data-gate/react'
import { averageRewardInputs } from 'data-gate/resources/performance'
import {
	validatorPreferences,
	validatorStats,
} from 'data-gate/resources/validators'
import {
	countValidatorRanks,
	getValidatorRank as getValidatorRankBus,
} from 'global-bus'
import { useApi } from 'hooks/useApi'
import { useErasPerDay } from 'hooks/useErasPerDay'
import { useNetwork } from 'hooks/useNetwork'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import type { Validator } from 'types'
import type { ValidatorListEntry, ValidatorsContextInterface } from '../types'
import { getActivityTier } from '../Utils'

export const [ValidatorsContext, useValidators] =
	createSafeContext<ValidatorsContextInterface>()

export const ValidatorsProvider = ({ children }: { children: ReactNode }) => {
	const gate = useDataGate()
	const { network } = useNetwork()
	const { getConsts } = useApi()
	const { maxSupportedDays } = useErasPerDay()
	const { eraStakers, getActiveValidator } = useEraStakers()
	const directory = useValidatorDirectory()
	const entries = useMemo(() => directory.data ?? [], [directory.data])
	const identityData = useIdentities(entries.map(({ address }) => address))
	const stats = useDataResource(validatorStats())
	const average = useDataResource(
		averageRewardInputs(
			maxSupportedDays > 30 ? 30 : 15,
			getConsts(network).historyDepth,
		),
	)
	const avgRewardRate = average.data?.apiRate ?? 0
	const active = useMemo(
		() => new Set(eraStakers.stakers.map(({ address }) => address)),
		[eraStakers.stakers],
	)
	const getValidatorRank = (address: string) =>
		gate.policy.sources.validatorStats === 'staking-api'
			? stats.data?.activeValidatorRanks.find(
					(rank) => rank.validator === address,
				)?.rank
			: (getValidatorRankBus(address) ?? undefined)
	const rankTotal =
		gate.policy.sources.validatorStats === 'staking-api'
			? (stats.data?.activeValidatorRanks.length ?? 0)
			: countValidatorRanks()
	const injectValidatorListData = (
		validators: Validator[],
	): ValidatorListEntry[] =>
		validators.map((validator) => ({
			...validator,
			validatorStatus: active.has(validator.address) ? 'active' : 'waiting',
		}))
	return (
		<ValidatorsContext.Provider
			value={{
				getValidators: () => entries,
				validatorsFetched:
					directory.status === 'ready'
						? 'synced'
						: directory.loading
							? 'syncing'
							: 'unsynced',
				validatorIdentities: identityData.data?.identities ?? {},
				validatorSupers: identityData.data?.supers ?? {},
				fetchValidatorPrefs: async (addresses) =>
					addresses.length
						? gate.request(
								validatorPreferences(addresses.map(({ address }) => address)),
							)
						: null,
				formatWithPrefs: (addresses) =>
					addresses.map((address) => ({
						address,
						prefs: entries.find((validator) => validator.address === address)
							?.prefs ?? { blocked: false, commission: 0 },
					})),
				injectValidatorListData,
				getValidatorTotalStake: (address) =>
					BigInt(getActiveValidator(address)?.total ?? 0),
				getValidatorRank,
				isValidatorHighPerformance: (address) => {
					const rank = getValidatorRank(address)
					return !!rank && rank / rankTotal <= 0.5
				},
				getValidatorActivityTier: (address) =>
					getActivityTier(getValidatorRank(address), rankTotal),
				avgRewardRate,
				averageEraValidatorReward: average.data?.average ?? {
					days: 0,
					reward: 0n,
				},
			}}
		>
			{children}
		</ValidatorsContext.Provider>
	)
}
