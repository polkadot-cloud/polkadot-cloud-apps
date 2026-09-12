// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createSafeContext } from '@w3ux/hooks'
import { useNodeEraStakers } from 'data-gate'
import { removeSyncing, setSyncing } from 'global-bus'
import { useNetwork } from 'hooks/useNetwork'
import { type ReactNode, useCallback, useEffect, useState } from 'react'
import type { MaybeAddress, NominationStatus } from 'types'
import type { EraStakersContextInterface } from './types'

const [EraStakersContext, useEraStakersContext] =
	createSafeContext<EraStakersContextInterface>()

// Legacy consumers explicitly opt in to the shared exposure snapshot.
export const useEraStakers = (needsExposures = false) => {
	const context = useEraStakersContext()
	useEffect(() => {
		if (needsExposures) return context.subscribeExposures()
	}, [needsExposures, context.subscribeExposures])
	return context
}

export const EraStakersProvider = ({ children }: { children: ReactNode }) => {
	const { network } = useNetwork()

	// Count consumers that need exposures; they all share the same query.
	const [exposureConsumers, setExposureConsumers] = useState(0)

	const subscribeExposures = useCallback(() => {
		setExposureConsumers((count) => count + 1)
		// Release this consumer when it unmounts or no longer needs exposures.
		return () => setExposureConsumers((count) => count - 1)
	}, [])

	const enabled = exposureConsumers > 0
	const { exposures, exposuresLoading, exposuresStatus } = useNodeEraStakers(
		enabled,
		enabled,
	)
	const loading = enabled && exposuresLoading

	// Sync only while initial data is fetching; exposures require explicit consumers.
	useEffect(() => {
		if (loading) setSyncing('era-stakers')
		else removeSyncing('era-stakers')
		return () => removeSyncing('era-stakers')
	}, [loading, network])

	// Determine each nominee's status from its backing for the supplied stash.
	const getNominationsStatusFromEraStakers = useCallback(
		(who: MaybeAddress, targets: string[]): Record<string, NominationStatus> =>
			Object.fromEntries(
				targets.map((target) => {
					const staker = exposures?.find(({ keys }) => keys[1] === target)?.val
					return [
						target,
						!staker
							? 'waiting'
							: staker.others.some((other) => other.who === who)
								? 'active'
								: 'inactive',
					]
				}),
			),
		[exposures],
	)

	return (
		<EraStakersContext.Provider
			value={{
				// Exposure consumers also need to know if the prerequisite overview query failed.
				exposuresStatus,
				subscribeExposures,
				getNominationsStatusFromEraStakers,
			}}
		>
			{children}
		</EraStakersContext.Provider>
	)
}
