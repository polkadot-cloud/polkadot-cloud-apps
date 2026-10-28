// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { QueryStatus } from '@tanstack/react-query'
import { beforeEach, expect, test, vi } from 'vitest'
import { EraStakersProvider } from '../../app-staking/src/contexts/EraStakers'

const { state, setSyncing, removeSyncing, effects, query } = vi.hoisted(() => ({
	state: { consumers: 1, status: 'pending' as QueryStatus },
	setSyncing: vi.fn(),
	removeSyncing: vi.fn(),
	effects: [] as (() => (() => void) | undefined)[],
	query: vi.fn(),
}))

// Exercise the provider's sync effect for each query phase, including the disabled exposure
// query while its overview prerequisite loads. Transport lifecycles use real QueryObservers
// in eraStakersData.test.ts.
vi.mock('../../app-staking/node_modules/react/index.js', async (original) => ({
	...(await original<typeof import('react')>()),
	useState: () => [state.consumers, vi.fn()],
	useCallback: (callback: unknown) => callback,
	useMemo: (factory: () => unknown) => factory(),
	useEffect: (effect: () => (() => void) | undefined) => {
		effects.push(effect)
	},
}))
vi.mock('../../data-gate/src/index', () => ({ useNodeEraStakers: query }))
vi.mock('../../global-bus/src/index', () => ({ setSyncing, removeSyncing }))
vi.mock('../../hooks/src/useNetwork', () => ({
	useNetwork: () => ({ network: 'polkadot' }),
}))

beforeEach(() => {
	vi.clearAllMocks()
	effects.length = 0
	state.consumers = 1
	state.status = 'pending'
	query.mockImplementation(() => ({
		exposures: undefined,
		exposuresLoading: false,
		exposuresStatus: state.status,
	}))
})

test('legacy sync includes overview prerequisites and clears on cleanup', () => {
	EraStakersProvider({ children: null })
	expect(query).toHaveBeenCalledWith(true, true)
	const cleanup = effects[0]()
	expect(setSyncing).toHaveBeenCalledWith('era-stakers')
	cleanup?.()
	expect(removeSyncing).toHaveBeenCalledWith('era-stakers')
})

test.each(['success', 'error'] as const)(
	'legacy sync stops when exposure status is %s',
	(status) => {
		state.status = status
		EraStakersProvider({ children: null })
		effects[0]()
		expect(setSyncing).not.toHaveBeenCalled()
		expect(removeSyncing).toHaveBeenCalledWith('era-stakers')
	},
)

test('an idle provider starts no node queries and does not block syncing', () => {
	state.consumers = 0
	EraStakersProvider({ children: null })
	effects[0]()
	expect(query).toHaveBeenCalledWith(false, false)
	expect(setSyncing).not.toHaveBeenCalled()
	expect(removeSyncing).toHaveBeenCalledWith('era-stakers')
})
