// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { QueryStatus } from '@tanstack/react-query'
import type { BondedPool, Nominator } from 'types'
import { beforeEach, expect, test, vi } from 'vitest'
import {
	createElement,
	type ReactNode,
} from '../../app-staking/node_modules/react/index.js'
import { renderToStaticMarkup } from '../../app-staking/node_modules/react-dom/server.node.js'
import { PoolNominateStatus } from '../../app-staking/src/library/ListItem/Labels/PoolNominateStatus'

const { state, useEraStakers, getStatuses, useNominationStatus } = vi.hoisted(
	() => ({
		state: {
			poolsNominations: {} as Record<number, Nominator | undefined>,
			api: false,
			exposuresStatus: 'success' as QueryStatus,
		},
		useEraStakers: vi.fn(),
		getStatuses: vi.fn(),
		useNominationStatus: vi.fn(),
	}),
)

vi.mock('contexts/EraStakers', () => ({ useEraStakers }))
vi.mock('contexts/Pools/BondedPools', () => ({
	useBondedPools: () => state,
}))
vi.mock('../../data-gate/src/index', () => ({ useNominationStatus }))
vi.mock('../../hooks/src/usePlugins', () => ({
	usePlugins: () => ({ pluginEnabled: () => state.api }),
}))
vi.mock('ui-app/ListItem', () => ({
	BasicItem: {
		PoolStatus: ({
			status,
			children,
		}: {
			status: string | null
			children: ReactNode
		}) => createElement('div', { 'data-status': status }, children),
	},
}))
vi.mock(
	'../../app-staking/node_modules/react-i18next/dist/es/index.js',
	() => ({ useTranslation: () => ({ t: (key: string) => key }) }),
)

const nominations = (targets: string[]): Nominator => ({
	targets,
	submittedIn: 100,
	suppressed: false,
})

const renderPool = (id = 1) =>
	renderToStaticMarkup(
		createElement(PoolNominateStatus, {
			pool: { id, addresses: { stash: `stash-${id}` } } as BondedPool,
		}),
	)

beforeEach(() => {
	vi.resetAllMocks()
	state.poolsNominations = {}
	state.api = false
	state.exposuresStatus = 'success'
	useEraStakers.mockImplementation(() => ({
		exposuresStatus: state.exposuresStatus,
		getNominationsStatusFromEraStakers: getStatuses,
	}))
	getStatuses.mockReturnValue({ validator: 'active' })
	useNominationStatus.mockReturnValue({ status: 'active', loading: false })
})

test('node rows share exposures and disable per-stash data-gate requests', () => {
	for (let id = 1; id <= 50; id++) {
		state.poolsNominations[id] = nominations(['validator'])
		expect(renderPool(id)).toContain('data-status="active"')
		expect(getStatuses).toHaveBeenLastCalledWith(`stash-${id}`, ['validator'])
	}
	expect(useEraStakers).toHaveBeenCalledTimes(50)
	expect(useEraStakers.mock.calls.every(([needed]) => needed === true)).toBe(
		true,
	)
	expect(
		useNominationStatus.mock.calls.every(([stash]) => stash === null),
	).toBe(true)
})

test('unloaded nominations stay unresolved without requesting exposures', () => {
	const markup = renderPool()
	expect(markup).toContain('syncing...')
	expect(markup).not.toContain('notNominating')
	expect(markup).not.toContain('data-status=')
	expect(useEraStakers).toHaveBeenCalledWith(false)
	expect(getStatuses).not.toHaveBeenCalled()
})

test.each([undefined, nominations([])])(
	'confirmed empty nominations skip exposures even if the shared query failed: %j',
	(record) => {
		state.poolsNominations[1] = record
		state.exposuresStatus = 'error'
		const markup = renderPool()
		expect(markup).toContain('notNominating')
		expect(markup).not.toContain('syncing')
		expect(markup).not.toContain('data-status=')
		expect(useEraStakers).toHaveBeenCalledWith(false)
		expect(getStatuses).not.toHaveBeenCalled()
		expect(
			useNominationStatus.mock.calls.every(([stash]) => stash === null),
		).toBe(true)
	},
)

test.each([
	['pending', 'syncing...'],
	['error', '—'],
] as const)('exposure %s does not become a staking status', (status, label) => {
	state.poolsNominations[1] = nominations(['validator'])
	state.exposuresStatus = status
	const markup = renderPool()
	expect(markup).toContain(label)
	expect(markup).not.toContain('data-status=')
	expect(getStatuses).not.toHaveBeenCalled()
})

test('completed exposures preserve waiting for an unelected target', () => {
	state.poolsNominations[1] = nominations(['validator'])
	getStatuses.mockReturnValue({ validator: 'waiting' })
	const markup = renderPool()
	expect(markup).toContain('data-status="waiting"')
	expect(markup).toContain('Waiting')
	expect(markup).not.toContain('syncing')
})

test.each(['active', 'inactive', 'waiting'] as const)(
	'API rows use the pool stash status (%s) before node nominations arrive',
	(status) => {
		state.api = true
		useNominationStatus.mockReturnValue({ status, loading: false, error: null })
		const markup = renderPool(42)
		expect(useNominationStatus).toHaveBeenCalledWith('stash-42', {
			dependencies: [undefined],
		})
		expect(markup).toContain(`data-status="${status}"`)
		expect(useEraStakers).toHaveBeenCalledWith(false)
		expect(getStatuses).not.toHaveBeenCalled()
	},
)

test.each([
	[{ status: undefined, loading: true, error: null }, 'syncing...'],
	[
		{ status: 'active', loading: false, error: new Error('API unavailable') },
		'—',
	],
])(
	'API loading and errors remain distinct from staking status',
	(result, label) => {
		state.api = true
		state.poolsNominations[1] = nominations(['validator'])
		useNominationStatus.mockReturnValue(result)
		const markup = renderPool()
		expect(markup).toContain(label)
		expect(markup).not.toContain('data-status=')
		expect(useEraStakers).toHaveBeenCalledWith(false)
		expect(getStatuses).not.toHaveBeenCalled()
	},
)

test('confirmed empty API-mode pools skip the status request', () => {
	state.api = true
	state.poolsNominations[1] = undefined
	expect(renderPool()).toContain('notNominating')
	expect(useNominationStatus).toHaveBeenCalledWith(null, {
		dependencies: [undefined],
	})
	expect(useEraStakers).toHaveBeenCalledWith(false)
})

test('API status keys follow pool nomination updates', () => {
	state.api = true
	state.poolsNominations[1] = nominations(['first'])
	renderPool()
	expect(useNominationStatus).toHaveBeenLastCalledWith('stash-1', {
		dependencies: [state.poolsNominations[1]],
	})
	state.poolsNominations[1] = nominations(['second'])
	renderPool()
	expect(useNominationStatus).toHaveBeenLastCalledWith('stash-1', {
		dependencies: [state.poolsNominations[1]],
	})
	expect(useEraStakers.mock.calls.every(([needed]) => !needed)).toBe(true)
})
