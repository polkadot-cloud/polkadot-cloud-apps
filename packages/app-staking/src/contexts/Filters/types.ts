// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { AnyFunction } from 'types'

export type FilterType = 'exclude' | 'include'

// Generic filter function type
export type FilterFunction<T = unknown> = (
	list: T[],
	filter: string | string[],
) => T[]
export type OrderFunction<T = unknown> = (list: T[], order: string) => T[]

export interface FiltersContextInterface {
	getFilters: (type: FilterType, group: string) => string[] | null
	toggleFilter: (type: FilterType, g: string, f: string) => void
	setMultiFilters: (t: FilterType, g: string, fs: string[], r: boolean) => void
	getOrder: (g: string) => string
	setOrder: (g: string, o: string) => void
	getSearchTerm: (g: string) => string | null
	setSearchTerm: (g: string, searchTerm: string) => void
	resetFilters: (type: FilterType, g: string) => void
	resetOrder: (g: string) => void
	clearSearchTerm: (g: string) => void
	applyFilters: (
		type: FilterType,
		g: string,
		list: unknown[],
		fn: AnyFunction,
	) => unknown[]
	applyOrder: (g: string, list: unknown[], fn: AnyFunction) => unknown[]
}

export type FilterItems = FilterItem[]
export interface FilterItem {
	key: string
	filters: string[]
}

export type FilterOrders = FilterOrder[]
export interface FilterOrder {
	key: string
	order: string
}

export type FilterSearches = FilterSearch[]
export interface FilterSearch {
	key: string
	searchTerm: string
}
