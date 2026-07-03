// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createSafeContext } from '@w3ux/hooks'
import type { ReactNode } from 'react'
import { useCallback, useMemo, useState } from 'react'
import type { AnyFunction } from 'types'
import { defaultExcludes, defaultIncludes } from './defaults'
import type {
	FilterItem,
	FilterItems,
	FilterOrder,
	FilterOrders,
	FilterSearch,
	FilterSearches,
	FiltersContextInterface,
	FilterType,
} from './types'

export const [FiltersContext, useFilters] =
	createSafeContext<FiltersContextInterface>()

export const FiltersProvider = ({ children }: { children: ReactNode }) => {
	// groups along with their includes
	const [includes, setIncludes] = useState<FilterItems>(defaultIncludes)

	// groups along with their excludes
	const [excludes, setExcludes] = useState<FilterItems>(defaultExcludes)

	// groups along with their order
	const [orders, setOrders] = useState<FilterOrders>([])

	// groups along with their search terms
	const [searchTerms, setSearchTerms] = useState<FilterSearches>([])

	// Get stored includes or excludes for a group
	const getFilters = useCallback(
		(type: FilterType, group: string): string[] | null => {
			const current = type === 'exclude' ? excludes : includes
			return current.find((e) => e.key === group)?.filters || null
		},
		[excludes, includes],
	)

	const setFilters = useCallback((t: FilterType, n: FilterItems) => {
		if (t === 'exclude') {
			setExcludes(n)
		} else {
			setIncludes(n)
		}
	}, [])

	// Toggle a filter for a group
	// Adds the group to `excludes` or `includes` if it does not already exist
	const toggleFilter = useCallback(
		(t: FilterType, g: string, f: string) => {
			const current = t === 'exclude' ? excludes : includes
			const exists = getFilters(t, g)

			if (!exists) {
				const newFilters = [...current, { key: g, filters: [f] }]
				setFilters(t, newFilters)
				return
			}
			const newFilters = [...current]
				.map((e) => {
					if (e.key !== g) {
						return e
					}
					const currentFilters = e.filters
					const nextFilters = currentFilters.includes(f)
						? currentFilters.filter((item) => item !== f)
						: currentFilters.concat(f)

					return {
						key: e.key,
						filters: nextFilters,
					}
				})
				.filter((e) => e.filters.length !== 0)
			setFilters(t, newFilters)
		},
		[excludes, includes, getFilters, setFilters],
	)

	// Sets an array of filters to a group
	const setMultiFilters = useCallback(
		(t: FilterType, g: string, fs: string[], reset: boolean) => {
			// get all current filter groups for the given type
			const allGroups = t === 'exclude' ? excludes : includes

			// separate the target group from other groups
			const otherGroups = allGroups.filter((e) => e.key !== g)
			const existingGroup = allGroups.find((e) => e.key === g)

			// determine the new filters for the target group
			let filters: string[]
			if (reset || !existingGroup) {
				// on reset, or when the group does not yet exist, use fs as-is
				filters = [...fs]
			} else {
				// merge existing filters with fs, avoiding duplicates and
				// appending new filters at the end (preserves original behavior)
				filters = existingGroup.filters
					.filter((f: string) => !fs.includes(f))
					.concat(fs)
			}

			const newFilters: FilterItems = [...otherGroups, { key: g, filters }]

			setFilters(t, newFilters)
		},
		[excludes, includes, setFilters],
	)

	// Get the current order of a list or null
	const getOrder = useCallback(
		(g: string) => orders.find((o) => o.key === g)?.order || 'default',
		[orders],
	)

	// Sets an order key for a group
	const setOrder = useCallback(
		(g: string, o: string) => {
			let newOrders = []
			if (o === 'default') {
				newOrders = [...orders].filter((order) => order.key !== g)
			} else if (orders.length) {
				// Attempt to replace the order record if it exists
				newOrders = [...orders].map((order) =>
					order.key !== g ? order : { ...order, order: o },
				)
				// If order for this key does not exist, add it
				if (newOrders.find(({ key }) => key === g) === undefined) {
					newOrders.push({ key: g, order: o })
				}
			} else {
				newOrders = [{ key: g, order: o }]
			}
			setOrders(newOrders)
		},
		[orders],
	)

	// Get the current search term of a list or null
	const getSearchTerm = useCallback(
		(g: string) => searchTerms.find((o) => o.key === g)?.searchTerm || null,
		[searchTerms],
	)

	// Sets an order key for a group
	const setSearchTerm = useCallback(
		(g: string, t: string) => {
			let newSearchTerms = []
			if (searchTerms.length) {
				// Attempt to replace the search term if it exists
				newSearchTerms = [...searchTerms].map((term) =>
					term.key !== g ? term : { ...term, searchTerm: t },
				)

				// If search term for this key does not exist, add it
				if (newSearchTerms.find(({ key }) => key === g) === undefined) {
					newSearchTerms.push({ key: g, searchTerm: t })
				}
			} else {
				newSearchTerms = [{ key: g, searchTerm: t }]
			}
			setSearchTerms(newSearchTerms)
		},
		[searchTerms],
	)

	// resets excludes for a given group
	const resetFilters = useCallback(
		(t: FilterType, g: string) => {
			const current = t === 'exclude' ? excludes : includes
			setFilters(
				t,
				[...current].filter((e: FilterItem) => e.key !== g),
			)
		},
		[excludes, includes, setFilters],
	)

	// resets order for a given group
	const resetOrder = useCallback(
		(g: string) => {
			setOrders([...orders].filter((e: FilterOrder) => e.key !== g))
		},
		[orders],
	)

	// clear searchTerm from given group
	const clearSearchTerm = useCallback(
		(g: string) => {
			setSearchTerms([...searchTerms].filter((e: FilterSearch) => e.key !== g))
		},
		[searchTerms],
	)

	// apply filters to list
	const applyFilters = useCallback(
		(t: FilterType, g: string, list: unknown[], fn: AnyFunction): unknown[] => {
			const filtersToApply = getFilters(t, g)

			if (!filtersToApply) {
				return list
			}
			return fn(list, filtersToApply)
		},
		[getFilters],
	)

	// apply order to a list
	const applyOrder = useCallback(
		(g: string, list: unknown[], fn: AnyFunction): unknown[] => {
			const orderToApply = getOrder(g)
			return fn(list, orderToApply)
		},
		[getOrder],
	)

	const value = useMemo(
		() => ({
			getFilters,
			toggleFilter,
			setMultiFilters,
			getOrder,
			setOrder,
			getSearchTerm,
			setSearchTerm,
			resetFilters,
			resetOrder,
			clearSearchTerm,
			applyFilters,
			applyOrder,
		}),
		[
			getFilters,
			toggleFilter,
			setMultiFilters,
			getOrder,
			setOrder,
			getSearchTerm,
			setSearchTerm,
			resetFilters,
			resetOrder,
			clearSearchTerm,
			applyFilters,
			applyOrder,
		],
	)

	return (
		<FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>
	)
}
