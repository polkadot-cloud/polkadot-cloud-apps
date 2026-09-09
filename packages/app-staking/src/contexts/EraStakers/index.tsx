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
	const ready = isReady && era > 0
	const [exposureConsumers, setExposureConsumers] = useState(0)
	const subscribeExposures = useCallback(() => {
		setExposureConsumers((count) => count + 1)
		return () => setExposureConsumers((count) => count - 1)
	}, [])

	// Validator activity and totals need only overview entries, never nominator pages.
	const { data: overviews, isPending: overviewsPending } = useQuery({
		queryKey: ['validator-overviews', network, era],
		queryFn: () => serviceApi.query.erasStakersOverviewEntries(era),
		enabled: ready,
		staleTime: Infinity,
	})
	const validatorOverviews = useMemo(
		() =>
			overviews &&
			new Map(overviews.map(([[, address], entry]) => [address, entry])),
		[overviews],
	)

	const { data: exposures, isPending } = useQuery({
		queryKey: ['era-exposures', network, era],
		enabled: ready && !!overviews && exposureConsumers > 0,
		staleTime: Infinity,
		queryFn: async ({ signal }): Promise<Exposure[]> => {
			const entries = overviews ?? []
			const eraKey = String(era)
			const cached = getLocalEraExposures(network, eraKey, eraKey)
			if (cached?.length === entries.length) return cached

			const result = await Promise.all(
				entries.map(async ([[, address], overview]) => {
					const pages = await serviceApi.query.erasStakersPagedEntries(
						era,
						address,
					)
					signal.throwIfAborted()
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
			signal.throwIfAborted()
			setLocalEraExposures(network, eraKey, result)
			return result
		},
	})

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
	const activeNominatorsCount = useMemo(
		() => countUniqueNominators(exposures ?? []),
		[exposures],
	)

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

	// Lists need overviews; only explicit exposure consumers wait for the full scan.
	useEffect(() => {
		if (overviewsPending || (exposureConsumers > 0 && isPending)) {
			setSyncing('era-stakers')
		} else removeSyncing('era-stakers')
		return () => removeSyncing('era-stakers')
	}, [overviewsPending, exposureConsumers, isPending, network, era])

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
