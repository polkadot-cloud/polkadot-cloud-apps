// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createSafeContext, useEffectIgnoreInitial } from '@w3ux/hooks'
import { useEraStakers } from 'contexts/EraStakers'
import { useValidatorRecords } from 'data-gate'
import {
	countValidatorRanks,
	getValidatorRank as getValidatorRankBus,
} from 'global-bus'
import { useApi } from 'hooks/useApi'
import { useErasPerDay } from 'hooks/useErasPerDay'
import { useNetwork } from 'hooks/useNetwork'
import { usePlugins } from 'hooks/usePlugins'
import { fetchValidatorStats } from 'plugin-staking-api'
import type { ActiveValidatorRank } from 'plugin-staking-api/types'
import {
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react'
import type { Validator } from 'types'
import type { ValidatorListEntry, ValidatorsContextInterface } from '../types'
import { getActivityTier } from '../Utils'
import { defaultAverageEraValidatorReward } from './defaults'

type ValidatorSubscription = { addresses: string[]; all: boolean }
type Context = ValidatorsContextInterface & {
	registerValidators: (subscription: ValidatorSubscription) => () => void
}
export const [ValidatorsContext, useValidatorsContext] =
	createSafeContext<Context>()

// Only mounted address/list consumers request data. Metric-only readers start no entries query.
export const useValidators = (addresses: string[] = [], all = false) => {
	const context = useValidatorsContext()
	const key = JSON.stringify([...new Set(addresses)].sort())
	useEffect(() => {
		if (all || key !== '[]')
			return context.registerValidators({ addresses: JSON.parse(key), all })
	}, [context.registerValidators, key, all])
	return context
}

export const ValidatorsProvider = ({ children }: { children: ReactNode }) => {
	const { activeEra, isReady, serviceApi, getConsts } = useApi()
	const { network } = useNetwork()
	const { pluginEnabled } = usePlugins()
	const { validatorOverviews } = useEraStakers()
	const { erasPerDay, maxSupportedDays } = useErasPerDay()

	const { historyDepth } = getConsts(network)
	const [validatorSubscriptions, setValidatorSubscriptions] = useState(
		new Map<symbol, ValidatorSubscription>(),
	)

	const registerValidators = useCallback(
		(subscription: ValidatorSubscription) => {
			const id = Symbol()
			setValidatorSubscriptions((current) =>
				new Map(current).set(id, subscription),
			)
			return () =>
				setValidatorSubscriptions((current) => {
					const next = new Map(current)
					next.delete(id)
					return next
				})
		},
		[],
	)
	const requested = useMemo(
		() =>
			[
				...new Set(
					[...validatorSubscriptions.values()].flatMap(
						({ addresses }) => addresses,
					),
				),
			].sort(),
		[validatorSubscriptions],
	)
	const all = [...validatorSubscriptions.values()].some(
		(subscription) => subscription.all,
	)
	const records = useValidatorRecords(requested, all)
	const getValidators = () => records.entries ?? []
	const validatorIdentities = records.data?.identities ?? {}
	const validatorSupers = records.data?.supers ?? {}
	const formatWithPrefs = (addresses: string[]): Validator[] =>
		addresses.map((address) => ({
			address,
			prefs: records.data?.prefs[address] ?? null,
		}))
	const [avgRewardRate, setAvgRewardRate] = useState(0)
	const [activeValidatorRanks, setActiveValidatorRanks] = useState<
		ActiveValidatorRank[]
	>([])
	const [averageEraValidatorReward, setAverageEraValidatorReward] = useState(
		defaultAverageEraValidatorReward,
	)

	// Inject status into validator entries
	const injectValidatorListData = (
		entries: Validator[],
	): ValidatorListEntry[] =>
		entries.map((entry) => ({
			...entry,
			validatorStatus: validatorOverviews?.has(entry.address)
				? 'active'
				: 'waiting',
		}))

	// Gets a validator's total stake, if any
	const getValidatorTotalStake = (address: string): bigint => {
		const inEra = validatorOverviews?.get(address)
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
		return pluginEnabled('staking_api')
			? activeValidatorRanks.find((r) => r.validator === validator)?.rank
			: (getValidatorRankBus(validator) ?? undefined)
	}

	const getValidatorRankTotal = () =>
		pluginEnabled('staking_api')
			? activeValidatorRanks.length
			: countValidatorRanks()

	const isValidatorHighPerformance = (validator: string) => {
		const rank = getValidatorRank(validator)
		return Boolean(rank && rank / getValidatorRankTotal() <= 0.5)
	}

	const getValidatorActivityTier = (validator: string) =>
		getActivityTier(getValidatorRank(validator), getValidatorRankTotal())

	// Refetch staking API validator stats when network or era changes so APY does not remain stale at
	// the initial default value.
	useEffect(() => {
		if (pluginEnabled('staking_api') && activeEra.index > 0) {
			getValidatorStats()
		}
	}, [network, activeEra.index, pluginEnabled('staking_api')])

	// Mark unsynced and fetch session validators and average reward when activeEra changes
	useEffectIgnoreInitial(() => {
		if (isReady && activeEra.index > 0) {
			if (!pluginEnabled('staking_api') || avgRewardRate === 0) {
				getAverageEraValidatorReward()
			}
		}
	}, [isReady, activeEra, avgRewardRate])

	return (
		<ValidatorsContext.Provider
			value={{
				registerValidators,
				validatorsError: records.error,
				retryValidators: () => {
					void records.refetch()
				},
				getValidatorPrefs: (address) => records.data?.prefs[address],
				injectValidatorListData,
				getValidators,
				validatorIdentities,
				validatorSupers,
				validatorsFetched: records.loading
					? 'syncing'
					: records.error
						? 'unsynced'
						: 'synced',
				avgRewardRate,
				averageEraValidatorReward,
				formatWithPrefs,
				getValidatorTotalStake,
				getValidatorRank,
				isValidatorHighPerformance,
				getValidatorActivityTier,
			}}
		>
			{children}
		</ValidatorsContext.Provider>
	)
}
