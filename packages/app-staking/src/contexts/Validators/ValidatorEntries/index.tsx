// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createSafeContext, useEffectIgnoreInitial } from '@w3ux/hooks'
import type { Sync } from '@w3ux/types'
import { shuffle } from '@w3ux/utils'
import { PerbillMultiplier } from 'consts'
import { getPeopleChainId } from 'consts/util'
import { useEraStakers } from 'contexts/EraStakers'
import {
	countValidatorRanks,
	getValidatorRank as getValidatorRankBus,
} from 'global-bus'
import { useApi } from 'hooks/useApi'
import { useErasPerDay } from 'hooks/useErasPerDay'
import { useNetwork } from 'hooks/useNetwork'
import { usePlugins } from 'hooks/usePlugins'
import { fetchIdentityCache, fetchValidatorStats } from 'plugin-staking-api'
import type { ActiveValidatorRank } from 'plugin-staking-api/types'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import type {
	IdentityOf,
	SuperIdentity,
	Validator,
	ValidatorStatus,
} from 'types'
import {
	formatIdentities,
	formatIdentitiesFromCache,
	formatSuperIdentities,
	formatSuperIdentitiesFromCache,
	perbillToPercent,
} from 'utils'
import type {
	ValidatorAddresses,
	ValidatorListEntry,
	Validators,
	ValidatorsContextInterface,
} from '../types'
import { getLocalEraValidators, setLocalEraValidators } from '../Utils'
import {
	defaultAverageEraValidatorReward,
	defaultValidatorsData,
} from './defaults'

export const [ValidatorsContext, useValidators] =
	createSafeContext<ValidatorsContextInterface>()

export const ValidatorsProvider = ({ children }: { children: ReactNode }) => {
	const { activeEra } = useApi()
	const { network } = useNetwork()
	const { pluginEnabled } = usePlugins()
	const { eraStakers, getActiveValidator } = useEraStakers()
	const { erasPerDay, maxSupportedDays } = useErasPerDay()
	const { isReady, serviceApi, getConsts, getApiStatus } = useApi()

	const { historyDepth } = getConsts(network)

	// Store validator entries and sync status
	const [validators, setValidators] = useState<Validators>({
		status: 'unsynced',
		validators: [],
	})
	// Setter for validator status
	const setValidatorsFetched = (status: Sync) =>
		setValidators({ ...validators, status })

	// Getter for validator entries
	const getValidators = () => validators.validators

	// Store validator identity data
	const [validatorIdentities, setValidatorIdentities] = useState<
		Record<string, IdentityOf>
	>({})

	// Store validator super identity data
	const [validatorSupers, setValidatorSupers] = useState<
		Record<string, SuperIdentity>
	>({})

	// Stores the average reward rate
	const [avgRewardRate, setAvgRewardRate] = useState<number>(0)

	// Stores active validator ranks
	const [activeValidatorRanks, setActiveValidatorRanks] = useState<
		ActiveValidatorRank[]
	>([])

	// Stores the average era validator reward
	const [averageEraValidatorReward, setAverageEraValidatorReward] = useState<{
		days: number
		reward: bigint
	}>(defaultAverageEraValidatorReward)

	// Fetch validator entries and format the returning data
	const getValidatorEntries = async () => {
		if (!isReady) {
			return defaultValidatorsData
		}
		const result = await serviceApi.query.validatorEntries()
		const entries: Validator[] = []

		result.forEach(([address, { commission, blocked }]) => {
			const commissionUnit = commission / PerbillMultiplier
			entries.push({
				address,
				prefs: {
					commission: Number(commissionUnit.toFixed(2)),
					blocked,
				},
			})
		})
		return { entries }
	}

	// Fetches and formats the active validator set, and derives metrics from the result
	const fetchValidators = async () => {
		if (!isReady || validators.status !== 'unsynced') {
			return
		}
		setValidatorsFetched('syncing')

		// If local validator entries exist for the current era, store these values in state. Otherwise,
		// fetch entries from API
		const localEraValidators = getLocalEraValidators(
			network,
			activeEra.index.toString(),
		)

		// The validator entries for the current active era
		let validatorEntries: Validator[] = []
		if (localEraValidators) {
			validatorEntries = localEraValidators.entries
		} else {
			const result = await getValidatorEntries()
			validatorEntries = result.entries
		}

		// Set entries data for the era to local storage
		setLocalEraValidators(network, activeEra.index.toString(), validatorEntries)

		// NOTE: validators are shuffled before committed to state
		setValidators({ status: 'synced', validators: shuffle(validatorEntries) })

		const addresses = validatorEntries.map(({ address }) => address)

		// Fetch identities - use GraphQL if staking API is enabled, otherwise use dedot API
		if (pluginEnabled('staking_api')) {
			const { identityCache } = await fetchIdentityCache(network, addresses)
			setValidatorIdentities({
				...formatIdentitiesFromCache(addresses, identityCache),
			})
			setValidatorSupers({ ...formatSuperIdentitiesFromCache(identityCache) })
		} else {
			const [identities, supers] = await Promise.all([
				serviceApi.query.identityOfMulti(addresses),
				serviceApi.query.superOfMulti(addresses),
			])
			setValidatorIdentities({ ...formatIdentities(addresses, identities) })
			setValidatorSupers({ ...formatSuperIdentities(supers) })
		}
	}

	// Fetches prefs for a list of validators
	const fetchValidatorPrefs = async (addresses: ValidatorAddresses) => {
		if (!addresses.length) {
			return null
		}

		const v: string[] = []
		const vMulti: string[] = []
		for (const { address } of addresses) {
			v.push(address)
			vMulti.push(address)
		}

		const resultsMulti = await serviceApi.query.validatorsMulti(vMulti)
		const formatted: Validator[] = []
		for (let i = 0; i < resultsMulti.length; i++) {
			const prefs = resultsMulti[i]

			if (prefs) {
				formatted.push({
					address: v[i],
					prefs: {
						commission: Number(perbillToPercent(prefs.commission).toString()),
						blocked: prefs.blocked,
					},
				})
			}
		}
		return formatted
	}

	// Formats a list of addresses with validator preferences
	const formatWithPrefs = (addresses: string[]) =>
		addresses.map((address) => ({
			address,
			prefs: getValidators().find((v) => v.address === address)?.prefs || {
				blocked: false,
				commission: 0,
			},
		}))

	// Inject status into validator entries
	const injectValidatorListData = (
		entries: Validator[],
	): ValidatorListEntry[] => {
		// Build an O(1) lookup of active validator addresses.
		const activeAddresses = new Set(
			eraStakers.stakers.map((staker) => staker.address),
		)

		const injected: ValidatorListEntry[] =
			entries.map((entry) => {
				const inEra: boolean = activeAddresses.has(entry.address)

				let validatorStatus: ValidatorStatus = 'waiting'
				if (inEra) {
					validatorStatus = 'active'
				}
				return {
					...entry,
					validatorStatus,
				}
			}) || []

		return injected
	}

	// Gets a validator's total stake, if any
	const getValidatorTotalStake = (address: string): bigint => {
		const entry = getValidators().find((v) => v.address === address)
		if (!entry) {
			return 0n
		}
		const inEra = getActiveValidator(entry.address)
		if (!inEra) {
			return 0n
		}

		// Use the total directly from the validator data, which comes from the chain
		// This ensures we get the correct total even if we're missing some nominator data
		return BigInt(inEra.total)
	}

	const getAverageEraValidatorReward = async () => {
		if (!isReady || activeEra.index === 0) {
			setAverageEraValidatorReward({
				days: 0,
				reward: 0n,
			})
			return
		}

		// If max supported days is less than 30, use 15 day average instead
		const days = maxSupportedDays > 30 ? 30 : 15

		// Calculates the number of eras required to calculate required `days`, not surpassing
		// historyDepth
		const endEra = Math.max(
			activeEra.index - erasPerDay * days,
			Math.max(0, activeEra.index - historyDepth),
		)

		const eras: string[] = []
		let thisEra = activeEra.index - 1
		do {
			eras.push(thisEra.toString())
			thisEra = thisEra - 1
		} while (thisEra >= endEra)

		const results = await serviceApi.query.erasValidatorRewardMulti(
			eras.map((e) => Number(e)),
		)

		const totalReward = results
			.map((v) => v || 0n)
			.reduce((prev, current) => prev + current, 0n)

		const reward = totalReward / BigInt(eras.length)
		setAverageEraValidatorReward({ days, reward })
	}

	const getValidatorStats = async (): Promise<void> => {
		const { validatorStats } = await fetchValidatorStats(network)
		setActiveValidatorRanks(validatorStats.activeValidatorRanks)
		setAvgRewardRate(validatorStats.averageRewardRate.rate)
	}

	const getValidatorRank = (validator: string): number | undefined => {
		if (pluginEnabled('staking_api')) {
			return activeValidatorRanks.find((r) => r.validator === validator)?.rank
		} else {
			const rank = getValidatorRankBus(validator)
			if (!rank) {
				return undefined
			}
			return rank
		}
	}

	const getValidatorRankSegment = (validator: string): number => {
		const fallbackSegment = 100
		if (pluginEnabled('staking_api')) {
			const totalValidators = activeValidatorRanks.length
			if (totalValidators === 0) {
				return fallbackSegment
			}
			// Find the rank of the given validator
			const rank = getValidatorRank(validator)
			if (!rank) {
				return fallbackSegment
			}
			const percentile = (rank / totalValidators) * 100
			const segment = Math.ceil(percentile / 10) * 10
			return segment
		} else {
			const rank = getValidatorRankBus(validator)
			if (!rank) {
				return fallbackSegment
			}
			const percentile = (rank / countValidatorRanks()) * 100
			const segment = Math.ceil(percentile / 10) * 10
			return segment
		}
	}

	// Reset validator state data on network change
	useEffectIgnoreInitial(() => {
		setValidators({
			status: 'unsynced',
			validators: [],
		})
		setValidatorIdentities({})
		setValidatorSupers({})
	}, [network])

	// Refetch staking API validator stats when network or era changes so APY does not remain stale at
	// the initial default value.
	useEffect(() => {
		if (pluginEnabled('staking_api') && activeEra.index > 0) {
			getValidatorStats()
		}
	}, [network, activeEra.index, pluginEnabled('staking_api')])

	// Fetch validators and era reward points when fetched status changes
	useEffect(() => {
		if (isReady && activeEra.index > 0) {
			fetchValidators()
		}
	}, [
		validators.status,
		isReady,
		getApiStatus(getPeopleChainId(network)),
		activeEra,
	])

	// Mark unsynced and fetch session validators and average reward when activeEra changes
	useEffectIgnoreInitial(() => {
		if (isReady && activeEra.index > 0) {
			if (validators.status === 'synced') {
				setValidatorsFetched('unsynced')
			}
			if (!pluginEnabled('staking_api') || avgRewardRate === 0) {
				getAverageEraValidatorReward()
			}
		}
	}, [isReady, activeEra, avgRewardRate])

	return (
		<ValidatorsContext.Provider
			value={{
				fetchValidatorPrefs,
				injectValidatorListData,
				getValidators,
				validatorIdentities,
				validatorSupers,
				validatorsFetched: validators.status,
				avgRewardRate,
				averageEraValidatorReward,
				formatWithPrefs,
				getValidatorTotalStake,
				getValidatorRank,
				getValidatorRankSegment,
			}}
		>
			{children}
		</ValidatorsContext.Provider>
	)
}
