// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { createSafeContext, useEffectIgnoreInitial } from '@w3ux/hooks'
import { planckToUnit, setStateWithRef } from '@w3ux/utils'
import { getStakingChainData } from 'consts/util'
import { removeSyncing, setSyncing } from 'global-bus'
import { useApi } from 'hooks/useApi'
import { useNetwork } from 'hooks/useNetwork'
import { usePlugins } from 'hooks/usePlugins'
import { fetchEraTotalNominators } from 'plugin-staking-api'
import type { ReactNode } from 'react'
import { useRef, useState } from 'react'
import type {
	ErasStakersOverviewEntries,
	Exposure,
	MaybeAddress,
	NominationStatus,
} from 'types'
import Worker from 'workers/stakers?worker'
import type { ProcessExposuresResponse } from 'workers/types'
import { defaultEraStakers } from './defaults'
import type { EraStakers, EraStakersContextInterface } from './types'
import { getLocalEraExposures, setLocalEraExposures } from './util'

const worker = new Worker()

export const [EraStakersContext, useEraStakers] =
	createSafeContext<EraStakersContextInterface>()

export const EraStakersProvider = ({ children }: { children: ReactNode }) => {
	const { network } = useNetwork()
	const { pluginEnabled } = usePlugins()
	const { activeAddress } = useActiveAccount()
	const { isReady, activeEra, getApiStatus, serviceApi } = useApi()
	const { units, ss58 } = getStakingChainData(network)

	// Store eras stakers in state
	const [eraStakers, setEraStakers] = useState<EraStakers>(defaultEraStakers)
	const eraStakersRef = useRef(eraStakers)

	// Store the total active nominators
	const [activeNominatorsCount, setActiveNominatorsCount] = useState<number>(0)

	// Store the previous era's reward points
	const [prevEraReward, setPrevEraReward] = useState<{
		era: number
		points: { total: number; individual: [string, number][] } | undefined
		payout: bigint | undefined
	}>({
		era: 0,
		points: undefined,
		payout: undefined,
	})

	const prevRewardSyncing = useRef<boolean>(false)

	// Store active validators
	const [activeValidators, setActiveValidators] = useState<number>(0)

	worker.onmessage = (message: MessageEvent) => {
		if (message) {
			const { data }: { data: ProcessExposuresResponse } = message
			const { task, networkName, era } = data

			// Ensure task matches, & era is still the same
			if (
				task !== 'processExposures' ||
				networkName !== network ||
				era !== activeEra.index.toString()
			) {
				return
			}

			const { stakers, activeAccountOwnStake, who } = data

			// Check if account hasn't changed since worker started
			if (activeAddress === who) {
				// Syncing current eraStakers is now complete
				removeSyncing('era-stakers')
				setStateWithRef(
					{
						...eraStakersRef.current,
						stakers,
						activeAccountOwnStake,
					},
					setEraStakers,
					eraStakersRef,
				)
			}
		}
	}

	// Fetches erasStakers exposures for an era, and saves to `localStorage`
	const fetchEraStakers = async (era: string) => {
		if (!isReady || activeEra.index === 0) {
			return {
				exposures: [],
				totalNominators: undefined,
			}
		}
		// Fetch current era overviews
		const overviews = await serviceApi.query.erasStakersOverviewEntries(
			activeEra.index,
		)
		// Overview entries define the active validator set and are available before paged exposures.
		setActiveValidators(overviews.length)

		// Calculate active nominator count from overviews if staking API is disabled
		let totalNominators: number | undefined
		if (!pluginEnabled('staking_api')) {
			totalNominators = overviews.reduce(
				(prev, [, { nominatorCount }]) => prev + nominatorCount,
				0,
			)
		}

		let exposures: Exposure[] = []
		const localExposures = getLocalEraExposures(
			network,
			era,
			activeEra.index.toString(),
		)
		// Ignore empty or partial caches so a failed exposure fetch can recover on the next load.
		if (localExposures?.length === overviews.length) {
			exposures = localExposures
		} else {
			exposures = await getPagedErasStakers(era, overviews)
		}

		// For resource limitation concerns, only store the current era in local storage
		if (era === activeEra.index.toString()) {
			setLocalEraExposures(network, era, exposures)
		}
		return { exposures, totalNominators }
	}

	// Fetches the active nominator set and metadata around it
	const fetchActiveEraStakers = async () => {
		if (!isReady || activeEra.index === 0) {
			return
		}
		setSyncing('era-stakers')

		const { exposures, totalNominators } = await fetchEraStakers(
			activeEra.index.toString(),
		)
		if (totalNominators !== undefined) {
			setActiveNominatorsCount(totalNominators)
		}

		worker.postMessage({
			era: activeEra.index.toString(),
			networkName: network,
			task: 'processExposures',
			activeAccount: activeAddress,
			units,
			exposures,
		})
	}

	// Fetch eras stakers from storage
	const getPagedErasStakers = async (
		era: string,
		overviews: ErasStakersOverviewEntries,
	) => {
		const validators = overviews.reduce(
			(
				prev: Record<string, { own: bigint; total: bigint }>,
				[[, validator], { own, total }],
			) => {
				prev[validator] = { own, total }
				return prev
			},
			{},
		)

		const validatorKeys = Object.keys(validators)
		const pagedResults = await Promise.all(
			validatorKeys.map((v) =>
				serviceApi.query.erasStakersPagedEntries(Number(era), v),
			),
		)

		const result: Exposure[] = []
		let i = 0
		for (const pages of pagedResults) {
			// Merge nominators from all pages for this validator
			const allOthers: { who: string; value: bigint }[] = []
			let hasPage = false
			for (const page of pages) {
				if (page) {
					hasPage = true
					const [, { others }] = page
					allOthers.push(...others)
				}
			}

			// Skip only when there is no page data at all for this validator.
			if (!hasPage) {
				i++
				continue
			}

			const validator = validatorKeys[i]
			const { own, total } = validators[validator]

			result.push({
				keys: [era, validator],
				val: {
					total: total.toString(),
					own: own.toString(),
					others: allOthers.map(({ who, value }) => ({
						who,
						value: value.toString(),
					})),
				},
			})
			i++
		}
		return result
	}

	// Fetches and sets the total active nominators for the current era
	const handleEraTotalNominators = async () => {
		const { eraTotalNominators } = await fetchEraTotalNominators(
			network,
			activeEra.index,
		)
		setActiveNominatorsCount(eraTotalNominators.totalNominators)
	}

	// Fetches and sets the previous era's reward points
	const fetchPrevEraRewardPoints = async () => {
		const prevEra = activeEra.index - 1
		if (prevEra < 0) {
			return
		}

		prevRewardSyncing.current = true

		const [rewardPoints, totalPayout] = await Promise.all([
			serviceApi.query.erasRewardPoints(prevEra),
			serviceApi.query.erasValidatorReward(prevEra),
		])
		if (rewardPoints && totalPayout) {
			setPrevEraReward({
				points: {
					total: rewardPoints.total,
					individual: rewardPoints.individual.map(([who, points]) => [
						who.address(ss58),
						points,
					]),
				},
				payout: totalPayout,
				era: prevEra,
			})
		}
		prevRewardSyncing.current = false
	}

	// Gets the nomination statuses of the provided nominator and targets
	const getNominationsStatusFromEraStakers = (
		who: MaybeAddress,
		targets: string[],
	) => {
		const statuses: Record<string, NominationStatus> = {}
		if (!targets.length) {
			return statuses
		}
		for (const target of targets) {
			const staker = eraStakers.stakers.find(
				({ address }) => address === target,
			)
			if (staker === undefined) {
				statuses[target] = 'waiting'
				continue
			}
			if (!(staker.others ?? []).find((o) => o.who === who)) {
				statuses[target] = 'inactive'
				continue
			}
			statuses[target] = 'active'
		}
		return statuses
	}

	// Checks whether an address is an active nominator
	const isNominatorActive = (who: MaybeAddress) => {
		return eraStakers.stakers.some((staker) =>
			staker.others.find((other) => other.who === who),
		)
	}

	// Checks whether an address is an active validator
	const getActiveValidator = (who: MaybeAddress) => {
		return eraStakers.stakers.find((s) => s.address === who)
	}

	// When the active account changes and stakers are already loaded, re-derive activeAccountOwnStake
	// for the new account without re-fetching chain data.
	useEffectIgnoreInitial(() => {
		if (!eraStakersRef.current.stakers.length) {
			return
		}
		const activeAccountOwnStake = eraStakersRef.current.stakers.flatMap(
			({ address, others }) => {
				const own = others.find(({ who }) => who === activeAddress)
				return own ? [{ address, value: planckToUnit(own.value, units) }] : []
			},
		)
		setStateWithRef(
			{ ...eraStakersRef.current, activeAccountOwnStake },
			setEraStakers,
			eraStakersRef,
		)
	}, [activeAddress])

	useEffectIgnoreInitial(() => {
		if (getApiStatus(network) === 'connecting') {
			setActiveValidators(0)
			setStateWithRef(defaultEraStakers, setEraStakers, eraStakersRef)
		}
	}, [getApiStatus(network)])

	// Handle syncing with eraStakers
	useEffectIgnoreInitial(() => {
		if (isReady) {
			fetchActiveEraStakers()
			if (pluginEnabled('staking_api')) {
				// If era has been fetched, fetch total nominators
				if (activeEra.index > 0) {
					handleEraTotalNominators()
				}
			} else {
				if (activeEra.index > 0) {
					// Fetch previous era reward points
					if (
						prevEraReward.era !== activeEra.index - 1 &&
						prevRewardSyncing.current === false
					) {
						fetchPrevEraRewardPoints()
					}
				}
			}
		}
	}, [
		isReady,
		activeEra.index,
		pluginEnabled('staking_api'),
		prevEraReward.era,
	])

	return (
		<EraStakersContext.Provider
			value={{
				eraStakers,
				activeValidators,
				activeNominatorsCount,
				getNominationsStatusFromEraStakers,
				isNominatorActive,
				getActiveValidator,
				prevEraReward,
			}}
		>
			{children}
		</EraStakersContext.Provider>
	)
}
