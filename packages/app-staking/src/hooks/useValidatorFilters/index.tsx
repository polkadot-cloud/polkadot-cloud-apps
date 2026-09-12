// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useValidatorOverviews } from 'data-gate'
import type { AnyFilter } from 'library/Filter/types'
import type { ValidatorListConfig } from 'library/StakingApiValidatorList/Controls'
import { useCallback, useMemo } from 'react'

export const useValidatorFilters = (addresses: string[] = []) => {
	const { data: overviews, error: overviewError } =
		useValidatorOverviews(addresses)
	const { validatorSupers, getValidatorRank, validatorIdentities } =
		useValidators()

	// Identity records contain an entry for every validator; super identities may legitimately be
	// empty after a complete sync.
	const identitiesReady = Object.keys(validatorIdentities).length > 0

	const filterFunctions = useMemo<
		Record<string, (list: AnyFilter) => AnyFilter>
	>(
		() => ({
			active: (list) =>
				!overviews
					? list
					: list.filter(({ address }: AnyFilter) => overviews.has(address)),
			blocked_nominations: (list) =>
				list.filter(({ prefs }: AnyFilter) => !prefs?.blocked),
			in_session: (list) =>
				!overviews
					? list
					: list.filter(({ address }: AnyFilter) => !overviews.has(address)),
			missing_identity: (list) =>
				!identitiesReady
					? list
					: list.filter(
							({ address }: AnyFilter) =>
								validatorIdentities[address] || validatorSupers[address],
						),
		}),
		[overviews, identitiesReady, validatorIdentities, validatorSupers],
	)

	const applyFilter = useCallback(
		(includes: string[] | null, excludes: string[] | null, list: AnyFilter) =>
			[...(includes ?? []), ...(excludes ?? [])].reduce(
				(result, filter) => filterFunctions[filter]?.(result) ?? result,
				list,
			),
		[filterFunctions],
	)

	const applyOrder = useCallback(
		(order: string, list: AnyFilter) =>
			order === 'ACTIVITY'
				? [...list].sort(
						(a, b) =>
							(getValidatorRank(a.address) ?? 9999) -
							(getValidatorRank(b.address) ?? 9999),
					)
				: list,
		[getValidatorRank],
	)

	const applySearch = useCallback(
		(list: AnyFilter, search: string) => {
			const term = search.toLowerCase()
			if (!term || !identitiesReady) {
				return list
			}

			return list.filter(({ address }: AnyFilter) => {
				const identity =
					validatorIdentities[address]?.info?.display?.value ?? ''
				const superIdentity =
					validatorSupers[address]?.superOf?.identity?.info?.display?.value ??
					''

				return [address, identity, superIdentity].some((value) =>
					value.toLowerCase().includes(term),
				)
			})
		},
		[identitiesReady, validatorIdentities, validatorSupers],
	)

	const applyConfig = useCallback(
		(config: ValidatorListConfig, list: AnyFilter) => {
			const { filters, order, search } = config
			const includes = filters.activeOnly ? ['active'] : null
			const excludes = [
				...(filters.excludeBlocked ? ['blocked_nominations'] : []),
				...(filters.excludeMissingIdentity ? ['missing_identity'] : []),
			]

			return applyOrder(
				order,
				applySearch(applyFilter(includes, excludes, list), search),
			)
		},
		[applyFilter, applyOrder, applySearch],
	)

	return { applyConfig, applyFilter, overviews, overviewError }
}
