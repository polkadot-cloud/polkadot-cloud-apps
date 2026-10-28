// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEraStakers } from 'contexts/EraStakers'
import { useBondedPools } from 'contexts/Pools/BondedPools'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { BondedPool } from 'types'
import { getPoolNominationStatusCode } from 'utils'

export const usePoolFilters = (
	pools: BondedPool[],
	needsExposures: boolean,
) => {
	const { t } = useTranslation('app')
	const { poolsNominations } = useBondedPools()
	const hasNominatingPools = pools.some(
		(pool) => (poolsNominations[pool.id]?.targets.length ?? 0) > 0,
	)
	// All activity filters and row labels use the same cached era snapshot.
	const { exposuresStatus, getNominationsStatusFromEraStakers } = useEraStakers(
		needsExposures && hasNominatingPools,
	)
	const activityLoading =
		needsExposures &&
		(pools.some((pool) => !Object.hasOwn(poolsNominations, pool.id)) ||
			(hasNominatingPools && exposuresStatus === 'pending'))
	const activityError =
		needsExposures && hasNominatingPools && exposuresStatus === 'error'

	const getActivity = useCallback(
		(pool: BondedPool) => {
			if (!Object.hasOwn(poolsNominations, pool.id)) return undefined
			const targets = poolsNominations[pool.id]?.targets ?? []
			if (!targets.length) return 'waiting'
			if (exposuresStatus !== 'success') return undefined
			return getPoolNominationStatusCode(
				getNominationsStatusFromEraStakers(pool.addresses.stash, targets),
			)
		},
		[poolsNominations, exposuresStatus, getNominationsStatusFromEraStakers],
	)

	// Filtering is local to the view; it never starts a request or mutates shared pools.
	const applyFilter = useCallback(
		(
			includes: string[] | null,
			excludes: string[] | null,
			list: BondedPool[],
		) => {
			const matches = (
				pool: BondedPool,
				filter: string,
			): boolean | undefined => {
				if (filter === 'active') {
					const status = getActivity(pool)
					return status === undefined ? undefined : status === 'active'
				}
				if (filter === 'locked') return pool.state.toLowerCase() === 'blocked'
				if (filter === 'destroying')
					return pool.state.toLowerCase() === 'destroying'
				return undefined
			}
			const known = (filter: string) =>
				['active', 'locked', 'destroying'].includes(filter)
			const includeFilters = includes?.filter(known) ?? []
			const excludeFilters = excludes?.filter(known) ?? []
			if (!includeFilters.length && !excludeFilters.length) return list
			// An unresolved activity result satisfies neither an include nor an exclude.
			return list.filter(
				(pool) =>
					includeFilters.every((filter) => matches(pool, filter) === true) &&
					excludeFilters.every((filter) => matches(pool, filter) === false),
			)
		},
		[getActivity],
	)

	const includesToLabels: Record<string, string> = { active: t('activePools') }
	const excludesToLabels: Record<string, string> = {
		locked: t('lockedPools'),
		destroying: t('destroyingPools'),
	}

	return {
		activityLoading,
		activityError,
		includesToLabels,
		excludesToLabels,
		applyFilter,
	}
}
