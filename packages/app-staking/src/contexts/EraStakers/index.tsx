// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { useQuery } from '@tanstack/react-query'
import { createSafeContext } from '@w3ux/hooks'
import { planckToUnit } from '@w3ux/utils'
import { getStakingChainData } from 'consts/util'
import { removeSyncing, setSyncing } from 'global-bus'
import { useApi } from 'hooks/useApi'
import { useNetwork } from 'hooks/useNetwork'
import { usePlugins } from 'hooks/usePlugins'
import {
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react'
import type { Exposure, MaybeAddress, NominationStatus } from 'types'
import type { EraStakersContextInterface } from './types'
import {
	countUniqueNominators,
	getLocalEraExposures,
	setLocalEraExposures,
} from './util'

const [EraStakersContext, useEraStakersContext] =
	createSafeContext<EraStakersContextInterface>()

// Metadata readers do not start the full exposure scan. Legacy consumers opt in explicitly.
export const useEraStakers = (needsExposures = false) => {
	const context = useEraStakersContext()
	useEffect(() => {
		if (needsExposures) return context.subscribeExposures()
	}, [needsExposures, context.subscribeExposures])
	return context
}

export const EraStakersProvider = ({ children }: { children: ReactNode }) => {
	const { network } = useNetwork()
	const { pluginEnabled } = usePlugins()
	const { activeAddress } = useActiveAccount()
	const { isReady, activeEra, serviceApi } = useApi()
	const { units, ss58 } = getStakingChainData(network)
	const era = activeEra.index

	// Node reads need a ready connection and a known active era.
	const ready = isReady && era > 0

	// Count consumers that need exposures; they all share the same query.
	const [exposureConsumers, setExposureConsumers] = useState(0)

	const subscribeExposures = useCallback(() => {
		setExposureConsumers((count) => count + 1)
		// Release this consumer when it unmounts or no longer needs exposures.
		return () => setExposureConsumers((count) => count - 1)
	}, [])

	// Validator activity and totals need only overview entries, never nominator pages.
	const {
		data: overviews,
		isLoading: overviewsLoading,
		error: overviewsError,
	} = useQuery({
		queryKey: ['validator-overviews', network, era],
		queryFn: () => serviceApi.query.erasStakersOverviewEntries(era),
		enabled: ready,
		staleTime: Infinity,
	})

	// Index overview entries by validator address for quick lookups.
	const validatorOverviews = useMemo(
		() =>
			overviews &&
			new Map(overviews.map(([[, address], entry]) => [address, entry])),
		[overviews],
	)

	// Load full exposures only when at least one consumer requests them.
	const {
		data: exposures,
		isLoading: exposuresLoading,
		status: exposuresStatus,
	} = useQuery({
		queryKey: ['era-exposures', network, era],
		enabled: ready && !!overviews && exposureConsumers > 0,
		staleTime: Infinity,
		queryFn: async ({ signal }): Promise<Exposure[]> => {
			const entries = overviews ?? []
			const eraKey = String(era)

			// Reuse this era's persisted exposures when the validator count matches.
			const cached = getLocalEraExposures(network, eraKey, eraKey)
			if (cached?.length === entries.length) return cached

			// Fetch every validator's exposure pages in parallel.
			const result = await Promise.all(
				entries.map(async ([[, address], overview]) => {
					const pages = await serviceApi.query.erasStakersPagedEntries(
						era,
						address,
					)
					signal.throwIfAborted()

					// Incomplete pages must not be treated as missing nominator backing.
					if (pages.length !== overview.pageCount) {
						throw new Error(`Incomplete exposure pages for ${address}`)
					}
					return {
						keys: [eraKey, address],
						val: {
							own: overview.own.toString(),
							total: overview.total.toString(),
							others: pages.flatMap(([, { others }]) =>
								others.map(({ who, value }) => ({
									who,
									value: value.toString(),
								})),
							),
						},
					}
				}),
			)

			// Persist complete results only while the request is still current.
			signal.throwIfAborted()
			setLocalEraExposures(network, eraKey, result)
			return result
		},
	})

	// Format stakers and the connected account's backing amounts.
	const eraStakers = useMemo(() => {
		const stakers = (exposures ?? []).map(({ keys, val }) => ({
			address: keys[1],
			...val,
		}))

		const activeAccountOwnStake = stakers.flatMap(({ address, others }) => {
			const own = others.find(({ who }) => who === activeAddress)
			return own ? [{ address, value: planckToUnit(own.value, units) }] : []
		})
		return { stakers, activeAccountOwnStake }
	}, [exposures, activeAddress, units])

	// Count each nominator once across all active validators.
	const activeNominatorsCount = useMemo(
		() => countUniqueNominators(exposures ?? []),
		[exposures],
	)

	// Fetch previous-era reward data only when the staking API is disabled.
	const { data: prevEraReward } = useQuery({
		queryKey: ['previous-era-reward', network, era],
		enabled: ready && !pluginEnabled('staking_api'),
		staleTime: Infinity,
		queryFn: async () => {
			const [points, payout] = await Promise.all([
				serviceApi.query.erasRewardPoints(era - 1),
				serviceApi.query.erasValidatorReward(era - 1),
			])
			return {
				era: era - 1,
				payout,
				points: points && {
					total: points.total,
					individual: points.individual.map(
						([who, value]): [string, number] => [who.address(ss58), value],
					),
				},
			}
		},
	})

	// Sync only while initial data is fetching; exposures require explicit consumers.
	useEffect(() => {
		if (overviewsLoading || (exposureConsumers > 0 && exposuresLoading)) {
			setSyncing('era-stakers')
		} else removeSyncing('era-stakers')
		return () => removeSyncing('era-stakers')
	}, [overviewsLoading, exposureConsumers, exposuresLoading, network, era])

	// Determine each nominee's status from its backing for the supplied stash.
	const getNominationsStatusFromEraStakers = (
		who: MaybeAddress,
		targets: string[],
	): Record<string, NominationStatus> =>
		Object.fromEntries(
			targets.map((target) => {
				const staker = eraStakers.stakers.find(
					({ address }) => address === target,
				)
				return [
					target,
					!staker
						? 'waiting'
						: staker.others.some((other) => other.who === who)
							? 'active'
							: 'inactive',
				]
			}),
		)

	return (
		<EraStakersContext.Provider
			value={{
				eraStakers,
				// Exposure consumers also need to know if the prerequisite overview query failed.
				exposuresStatus: overviewsError ? 'error' : exposuresStatus,
				validatorOverviews,
				activeValidators: overviews?.length ?? 0,
				activeNominatorsCount,
				subscribeExposures,
				getNominationsStatusFromEraStakers,
				getActiveValidator: (who) =>
					eraStakers.stakers.find(({ address }) => address === who),
				prevEraReward: prevEraReward ?? {
					era: 0,
					points: undefined,
					payout: undefined,
				},
			}}
		>
			{children}
		</EraStakersContext.Provider>
	)
}
