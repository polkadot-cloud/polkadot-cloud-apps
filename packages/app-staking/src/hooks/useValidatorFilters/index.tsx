// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useEraStakers } from 'contexts/EraStakers'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import type { AnyFilter } from 'library/Filter/types'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import type { AnyFunction, AnyJson } from 'types'

export const useValidatorFilters = () => {
	const { t } = useTranslation('app')
	const { validatorSupers, getValidatorRank, validatorIdentities } =
		useValidators()
	const { eraStakers } = useEraStakers()
	const eraValidatorSet = useMemo(
		() => new Set(eraStakers.stakers.map((staker) => staker.address)),
		[eraStakers.stakers],
	)

	/*
	 * filterMissingIdentity: Iterates through the supplied list and filters those with missing
	 * identities. Returns the updated filtered list.
	 */
	const filterMissingIdentity = useCallback(
		(list: AnyFilter) => {
			// Return list early if identity sync has not completed.
			if (
				!Object.values(validatorIdentities).length ||
				!Object.values(validatorSupers).length
			) {
				return list
			}
			const filteredList: AnyFilter = []
			for (const validator of list) {
				const identityExists = validatorIdentities[validator.address] ?? false
				const superExists = validatorSupers[validator.address] ?? false

				// Validator included if identity or super identity has been set.
				if (identityExists || superExists) {
					filteredList.push(validator)
				}
			}
			return filteredList
		},
		[validatorIdentities, validatorSupers],
	)

	/*
	 * filterAllCommission: Filters the supplied list and removes items with 100% commission. Returns
	 * the updated filtered list.
	 */
	const filterAllCommission = useCallback(
		(list: AnyFilter) =>
			list.filter(
				(validator: AnyFilter) => validator?.prefs?.commission !== 100,
			),
		[],
	)

	/*
	 * filterBlockedNominations: Filters the supplied list and removes items that have blocked
	 * nominations. Returns the updated filtered list.
	 */
	const filterBlockedNominations = useCallback((list: AnyFilter) => {
		return list.filter((validator: AnyFilter) => {
			const blocked: boolean | undefined = validator?.prefs?.blocked
			return !blocked
		})
	}, [])

	/*
	 * filterActive: Filters the supplied list and removes items that are inactive. Returns the
	 * updated filtered list.
	 */
	const filterActive = useCallback(
		(list: AnyFilter) => {
			// if list has not yet been populated, return original list
			if (eraStakers.stakers.length === 0) {
				return list
			}
			return list.filter((validator: AnyFilter) =>
				eraValidatorSet.has(validator.address),
			)
		},
		[eraStakers.stakers, eraValidatorSet],
	)

	/*
	 * filterInSession: Filters the supplied list and removes items that are in the current session.
	 * Returns the updated filtered list.
	 */
	const filterInSession = useCallback(
		(list: AnyFilter) => {
			// if list has not yet been populated, return original list
			if (eraStakers.stakers.length === 0) {
				return list
			}
			return list.filter(
				(validator: AnyFilter) => !eraValidatorSet.has(validator.address),
			)
		},
		[eraStakers.stakers, eraValidatorSet],
	)

	const includesToLabels = useMemo<Record<string, string>>(
		() => ({
			active: t('activeValidators'),
		}),
		[t],
	)

	const excludesToLabels = useMemo<Record<string, string>>(
		() => ({
			all_commission: t('100Commission'),
			blocked_nominations: t('blockedNominations'),
			missing_identity: t('missingIdentity'),
		}),
		[t],
	)

	const filterToFunction = useMemo<Record<string, AnyFunction>>(
		() => ({
			active: filterActive,
			missing_identity: filterMissingIdentity,
			all_commission: filterAllCommission,
			blocked_nominations: filterBlockedNominations,
			in_session: filterInSession,
		}),
		[
			filterActive,
			filterMissingIdentity,
			filterAllCommission,
			filterBlockedNominations,
			filterInSession,
		],
	)

	const getFiltersToApply = useCallback(
		(excludes: string[]) => {
			const fns = []
			for (const exclude of excludes) {
				if (filterToFunction[exclude]) {
					fns.push(filterToFunction[exclude])
				}
			}
			return fns
		},
		[filterToFunction],
	)

	const applyFilter = useCallback(
		(includes: string[] | null, excludes: string[] | null, list: AnyJson) => {
			if (!excludes && !includes) {
				return list
			}
			if (includes) {
				for (const fn of getFiltersToApply(includes)) {
					list = fn(list)
				}
			}
			if (excludes) {
				for (const fn of getFiltersToApply(excludes)) {
					list = fn(list)
				}
			}
			return list
		},
		[getFiltersToApply],
	)

	/*
	 * orderLowestCommission: Orders a list by commission, lowest first. Returns the updated ordered
	 * list.
	 */
	const orderLowestCommission = useCallback(
		(list: AnyFilter) =>
			[...list].sort((a, b) => a.prefs.commission - b.prefs.commission),
		[],
	)

	/*
	 * orderHighestCommission: Orders a list by commission, highest first. Returns the updated ordered
	 * list.
	 */
	const orderHighestCommission = useCallback(
		(list: AnyFilter) =>
			[...list].sort((a, b) => b.prefs.commission - a.prefs.commission),
		[],
	)

	/*
	 * orderByRank: Orders a list by validator rank.
	 */
	const orderByRank = useCallback(
		(list: AnyFilter) =>
			[...list].sort((a, b) => {
				const aRank = getValidatorRank(a.address) || 9999
				const bRank = getValidatorRank(b.address) || 9999
				return aRank - bRank
			}),
		[getValidatorRank],
	)

	const ordersToLabels = useMemo<Record<string, string>>(
		() => ({
			rank: `${t('performance')}`,
			low_commission: t('lowCommission'),
			high_commission: t('highCommission'),
			default: t('unordered'),
		}),
		[t],
	)

	const orderToFunction = useMemo<Record<string, AnyFunction>>(
		() => ({
			rank: orderByRank,
			low_commission: orderLowestCommission,
			high_commission: orderHighestCommission,
		}),
		[orderByRank, orderLowestCommission, orderHighestCommission],
	)

	const applyOrder = useCallback(
		(o: string, list: AnyJson) => {
			const fn = orderToFunction[o]
			if (fn) {
				return fn(list)
			}
			return list
		},
		[orderToFunction],
	)

	/*
	 * applySearch Iterates through the supplied list and filters those that match the search term.
	 * Returns the updated filtered list.
	 */
	const applySearch = useCallback(
		(list: AnyFilter, searchTerm: string) => {
			// If we cannot derive data, fallback to include validator in filtered list.
			if (
				!searchTerm ||
				!Object.values(validatorIdentities).length ||
				!Object.values(validatorSupers).length
			) {
				return list
			}

			const filteredList: AnyFilter = []
			for (const validator of list) {
				const identity = validatorIdentities[validator.address]
				const identityRaw = identity ? identity?.info?.display?.value : ''

				const identitySearch = (identityRaw || '').toLowerCase()

				const superIdentity = validatorSupers[validator.address] ?? null
				const superIdentityRaw =
					superIdentity?.superOf?.identity?.info?.display?.value ?? ''

				const superIdentitySearch = (superIdentityRaw || '').toLowerCase()

				if (
					validator.address.toLowerCase().includes(searchTerm.toLowerCase())
				) {
					filteredList.push(validator)
				}
				if (
					identitySearch.includes(searchTerm.toLowerCase()) ||
					superIdentitySearch.includes(searchTerm.toLowerCase())
				) {
					filteredList.push(validator)
				}
			}
			return filteredList
		},
		[validatorIdentities, validatorSupers],
	)

	return {
		includesToLabels,
		excludesToLabels,
		ordersToLabels,
		applyFilter,
		applyOrder,
		applySearch,
	}
}
