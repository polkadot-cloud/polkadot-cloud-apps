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
vi.mock('data-gate', () => ({ useNominationStatus }))
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
	state.exposuresStatus = 'success'
	useEraStakers.mockImplementation(() => ({
		exposuresStatus: state.exposuresStatus,
		getNominationsStatusFromEraStakers: getStatuses,
	}))
	getStatuses.mockReturnValue({ validator: 'active' })
	useNominationStatus.mockReturnValue({ status: 'active', loading: false })
})

test('a 50-row page reads shared exposures without per-stash data-gate queries', () => {
	for (let id = 1; id <= 50; id++) {
		state.poolsNominations[id] = nominations(['validator'])
		expect(renderPool(id)).toContain('data-status="active"')
		expect(getStatuses).toHaveBeenLastCalledWith(`stash-${id}`, ['validator'])
	}
	expect(useEraStakers).toHaveBeenCalledTimes(50)
	expect(useEraStakers.mock.calls.every(([needed]) => needed === true)).toBe(
		true,
	)
	expect(useNominationStatus).not.toHaveBeenCalled()
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
		expect(useNominationStatus).not.toHaveBeenCalled()
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
