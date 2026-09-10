// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useActiveAccount } from '@polkadot-cloud/connect'
import { createSafeContext } from '@w3ux/hooks'
import { planckToUnit } from '@w3ux/utils'
import { getStakingChainData } from 'consts/util'
import { useNodeEraStakers } from 'data-gate'
import { removeSyncing, setSyncing } from 'global-bus'
import { useNetwork } from 'hooks/useNetwork'
import {
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react'
import type { MaybeAddress, NominationStatus } from 'types'
import type { EraStakersContextInterface } from './types'

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
	const { activeAddress } = useActiveAccount()
	const { units } = getStakingChainData(network)

	// Count consumers that need exposures; they all share the same query.
	const [exposureConsumers, setExposureConsumers] = useState(0)

	const subscribeExposures = useCallback(() => {
		setExposureConsumers((count) => count + 1)
		// Release this consumer when it unmounts or no longer needs exposures.
		return () => setExposureConsumers((count) => count - 1)
	}, [])

	const {
		overviews,
		exposures,
		overviewsLoading,
		exposuresLoading,
		exposuresStatus,
	} = useNodeEraStakers(exposureConsumers > 0)

	// Index overview entries by validator address for quick lookups.
	const validatorOverviews = useMemo(
		() =>
			overviews &&
			new Map(overviews.map(([[, address], entry]) => [address, entry])),
		[overviews],
	)

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

	// Sync only while initial data is fetching; exposures require explicit consumers.
	useEffect(() => {
		if (overviewsLoading || (exposureConsumers > 0 && exposuresLoading)) {
			setSyncing('era-stakers')
		} else removeSyncing('era-stakers')
		return () => removeSyncing('era-stakers')
	}, [
		overviewsLoading,
		exposureConsumers,
		exposuresLoading,
		network,
		overviews,
	])

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
				exposuresStatus,
				validatorOverviews,
				activeValidators: overviews?.length ?? 0,
				subscribeExposures,
				getNominationsStatusFromEraStakers,
				getActiveValidator: (who) =>
					eraStakers.stakers.find(({ address }) => address === who),
			}}
		>
			{children}
		</EraStakersContext.Provider>
	)
}
