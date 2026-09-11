// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { QueryStatus } from '@tanstack/react-query'
import type { BondedPool, NominationStatus, Nominator } from 'types'
import { beforeEach, expect, test, vi } from 'vitest'
import {
	createElement,
	type ReactNode,
} from '../../app-staking/node_modules/react/index.js'
import { renderToStaticMarkup } from '../../app-staking/node_modules/react-dom/server.node.js'
import { usePoolFilters } from '../../app-staking/src/hooks/usePoolFilters'
import { PoolList as ActualPoolList } from '../../app-staking/src/library/PoolList'
import { PoolFavorites } from '../../app-staking/src/pages/PoolsList/Favorites'

const { state, useEraStakers, removeFavorite } = vi.hoisted(() => ({
	state: {
		bondedPools: [] as BondedPool[],
		bondedPoolsStatus: 'pending' as QueryStatus,
		poolsNominations: {} as Record<number, Nominator | undefined>,
		exposuresStatus: 'pending' as QueryStatus,
		statuses: {} as Record<string, NominationStatus>,
		favorites: ['stash-1'],
		syncing: true,
	},
	useEraStakers: vi.fn(),
	removeFavorite: vi.fn(),
}))

vi.mock('contexts/EraStakers', () => ({ useEraStakers }))
vi.mock(
	'hooks/usePoolFilters',
	() => import('../../app-staking/src/hooks/usePoolFilters'),
)
vi.mock('contexts/Pools/BondedPools', () => ({ useBondedPools: () => state }))
vi.mock('contexts/Filters', () => ({
	useFilters: () => ({
		getFilters: () => [],
		getSearchTerm: () => '',
		setSearchTerm: vi.fn(),
	}),
}))
vi.mock('../../hooks/src/useApi', () => ({
	useApi: () => ({ activeEra: { index: 100 } }),
}))
vi.mock('../../hooks/src/useNetwork', () => ({
	useNetwork: () => ({ network: 'polkadot' }),
}))
vi.mock('hooks/useThemeValues', () => ({
	useThemeValues: () => ({ getThemeValue: () => '' }),
}))
vi.mock('../../hooks/src/useFavoritePools', () => ({
	useFavoritePools: () => ({ favorites: state.favorites, removeFavorite }),
}))
vi.mock('../../hooks/src/useSyncing', () => ({
	useSyncing: () => ({ syncing: state.syncing }),
}))
vi.mock('contexts/List', () => ({
	ListProvider: ({ children }: { children: ReactNode }) => children,
	useList: () => ({ listFormat: 'row', setListFormat: vi.fn() }),
}))
vi.mock('library/PoolList', () => ({
	PoolList: ({ pools }: { pools: BondedPool[] }) =>
		createElement('div', { 'data-pools': pools.map(({ id }) => id).join(',') }),
}))
vi.mock('library/List', () => ({
	FilterHeaderWrapper: ({ children }: { children: ReactNode }) => children,
	List: ({ children }: { children: ReactNode }) => children,
	Wrapper: ({ children }: { children: ReactNode }) => children,
	ListStatusHeader: ({ children }: { children: ReactNode }) =>
		createElement('div', null, children),
}))
vi.mock('library/Filter/Tabs', () => ({ Tabs: () => null }))
vi.mock('library/List/MotionContainer', () => ({
	MotionContainer: ({ children }: { children: ReactNode }) => children,
	MotionItem: ({ children }: { children: ReactNode }) => children,
}))
vi.mock('library/List/Pagination', () => ({ Pagination: () => null }))
vi.mock('library/List/SearchInput', () => ({ SearchInput: () => null }))
vi.mock('library/Pool', () => ({
	Pool: ({ pool }: { pool: BondedPool }) =>
		createElement('div', null, `pool-${pool.id}`),
}))
vi.mock('../../ui-app/src/Card', () => ({
	CardWrapper: ({ children }: { children: ReactNode }) => children,
}))
vi.mock('../../ui-core/src/base', () => ({
	Page: { Row: ({ children }: { children: ReactNode }) => children },
}))
vi.mock(
	'../../app-staking/node_modules/react-i18next/dist/es/index.js',
	() => ({
		useTranslation: () => ({ t: (key: string) => key }),
	}),
)

const pool = (id: number, state = 'Open') =>
	({ id, state, addresses: { stash: `stash-${id}` } }) as BondedPool
const nominations = (targets = ['validator']): Nominator => ({
	targets,
	submittedIn: 100,
	suppressed: false,
})
const ids = (pools: BondedPool[]) => pools.map(({ id }) => id)
const filters = (active = true) => {
	let result!: ReturnType<typeof usePoolFilters>
	const Consumer = () => {
		result = usePoolFilters(state.bondedPools, active)
		return null
	}
	renderToStaticMarkup(createElement(Consumer))
	return result
}

beforeEach(() => {
	vi.clearAllMocks()
	state.bondedPools = [
		pool(1),
		pool(2, 'Blocked'),
		pool(3, 'Destroying'),
		pool(4),
	]
	state.poolsNominations = {}
	state.bondedPoolsStatus = 'pending'
	state.exposuresStatus = 'pending'
	state.statuses = {
		'stash-1': 'active',
		'stash-2': 'active',
		'stash-3': 'active',
		'stash-4': 'inactive',
	}
	state.favorites = ['stash-1']
	state.syncing = true
	useEraStakers.mockImplementation(() => ({
		exposuresStatus: state.exposuresStatus,
		getNominationsStatusFromEraStakers: (stash: string) => ({
			validator: state.statuses[stash],
		}),
	}))
})

test('pending nominations and exposures are not classified as active or inactive', () => {
	let view = filters()
	expect(view.activityLoading).toBe(true)
	expect(view.applyFilter(['active'], [], state.bondedPools)).toEqual([])
	expect(view.applyFilter([], ['active'], state.bondedPools)).toEqual([])
	state.poolsNominations = {
		1: nominations(),
		2: nominations(),
		3: nominations(),
		4: nominations(),
	}
	view = filters()
	expect(view.activityLoading).toBe(true)
	expect(view.applyFilter(['active'], [], state.bondedPools)).toEqual([])
	expect(useEraStakers).toHaveBeenLastCalledWith(true)
})

test('state tabs work while activity is pending and share the original pool snapshot', () => {
	const snapshot = state.bondedPools
	const view = filters(false)
	expect(view.activityLoading).toBe(false)
	expect(view.applyFilter([], [], snapshot)).toBe(snapshot)
	expect(ids(view.applyFilter(['locked'], [], snapshot))).toEqual([2])
	expect(ids(view.applyFilter(['destroying'], [], snapshot))).toEqual([3])
	expect(state.bondedPools).toBe(snapshot)
	expect(useEraStakers).toHaveBeenCalledWith(false)
})

test('active results update after exposures and nominations change without a global sync transition', () => {
	state.poolsNominations = {
		1: nominations(),
		2: nominations(),
		3: nominations(),
		4: nominations(),
	}
	expect(
		filters().applyFilter(
			['active'],
			['locked', 'destroying'],
			state.bondedPools,
		),
	).toEqual([])
	state.exposuresStatus = 'success'
	expect(
		ids(
			filters().applyFilter(
				['active'],
				['locked', 'destroying'],
				state.bondedPools,
			),
		),
	).toEqual([1])
	state.poolsNominations = { ...state.poolsNominations, 1: undefined }
	expect(
		filters().applyFilter(
			['active'],
			['locked', 'destroying'],
			state.bondedPools,
		),
	).toEqual([])
	expect(state.syncing).toBe(true)
})

test('activity errors and confirmed empty nominations have distinct states', () => {
	state.poolsNominations = { 1: nominations() }
	state.bondedPools = [pool(1)]
	state.exposuresStatus = 'error'
	expect(filters().activityError).toBe(true)
	expect(filters().activityLoading).toBe(false)
	state.poolsNominations = { 1: undefined }
	expect(filters().activityError).toBe(false)
	expect(filters().activityLoading).toBe(false)
	expect(useEraStakers).toHaveBeenLastCalledWith(false)
})

test('favorites resolve late pool data without deleting saved addresses', () => {
	state.bondedPools = []
	const savedFavorites = state.favorites
	expect(renderToStaticMarkup(createElement(PoolFavorites))).toContain(
		'fetchingFavoritePools',
	)
	state.bondedPools = [pool(1)]
	expect(renderToStaticMarkup(createElement(PoolFavorites))).toContain(
		'data-pools="1"',
	)
	state.bondedPools = [pool(1), pool(2)]
	state.favorites = [...state.favorites, 'stash-2']
	expect(renderToStaticMarkup(createElement(PoolFavorites))).toContain(
		'data-pools="1,2"',
	)
	expect(savedFavorites).toEqual(['stash-1'])
	expect(removeFavorite).not.toHaveBeenCalled()
})

test('an expired global sync flag cannot turn an unfinished pool fetch into no matches', () => {
	state.bondedPools = []
	state.syncing = false
	const render = () =>
		renderToStaticMarkup(createElement(ActualPoolList, { pools: [] }))
	expect(render()).toContain('syncingPoolList')
	expect(render()).not.toContain('noMatch')
	state.bondedPoolsStatus = 'success'
	expect(render()).toContain('noMatch')
	expect(render()).not.toContain('syncingPoolList')
	state.bondedPoolsStatus = 'error'
	expect(render()).toContain('errorUnknown')
	expect(render()).not.toContain('noMatch')
})

test('available pool rows remain visible while metadata is still loading', () => {
	state.syncing = false
	state.bondedPoolsStatus = 'pending'
	const html = renderToStaticMarkup(
		createElement(ActualPoolList, { pools: [pool(1)] }),
	)
	expect(html).toContain('pool-1')
	expect(html).not.toContain('noMatch')
})

test('favorites wait for the pool snapshot even after global syncing expires', () => {
	state.bondedPools = []
	state.syncing = false
	const render = () => renderToStaticMarkup(createElement(PoolFavorites))
	expect(render()).toContain('fetchingFavoritePools')
	expect(render()).not.toContain('noFavorites')
	state.bondedPoolsStatus = 'success'
	expect(render()).toContain('noFavorites')
	state.bondedPoolsStatus = 'error'
	expect(render()).toContain('errorUnknown')
	expect(render()).not.toContain('noFavorites')
})
