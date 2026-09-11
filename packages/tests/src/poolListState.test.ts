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
import { PoolFavorites } from '../../app-staking/src/pages/PoolsList/Favorites'

const { state, useEraStakers, removeFavorite } = vi.hoisted(() => ({
	state: {
		bondedPools: [] as BondedPool[],
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
vi.mock('contexts/Pools/BondedPools', () => ({ useBondedPools: () => state }))
vi.mock('../../hooks/src/useFavoritePools', () => ({
	useFavoritePools: () => ({ favorites: state.favorites, removeFavorite }),
}))
vi.mock('../../hooks/src/useSyncing', () => ({
	useSyncing: () => ({ syncing: state.syncing }),
}))
vi.mock('contexts/List', () => ({
	ListProvider: ({ children }: { children: ReactNode }) => children,
}))
vi.mock('library/PoolList', () => ({
	PoolList: ({ pools }: { pools: BondedPool[] }) =>
		createElement('div', { 'data-pools': pools.map(({ id }) => id).join(',') }),
}))
vi.mock('library/List', () => ({
	ListStatusHeader: ({ children }: { children: ReactNode }) =>
		createElement('div', null, children),
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
