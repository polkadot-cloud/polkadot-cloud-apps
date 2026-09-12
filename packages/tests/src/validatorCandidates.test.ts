// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { beforeEach, expect, test, vi } from 'vitest'
import { useFetchMethods } from '../../app-staking/src/hooks/useFetchMethods'

const { state, entries, basic, optimal, specialized, sanitize, demand } =
	vi.hoisted(() => ({
		state: { api: true, network: 'kusama' },
		entries: vi.fn(),
		basic: vi.fn(),
		optimal: vi.fn(),
		specialized: vi.fn(),
		sanitize: vi.fn(),
		demand: vi.fn(),
	}))
vi.mock('../../global-bus/src/index', () => ({
	pluginEnabled: () => state.api,
}))
vi.mock('../../hooks/src/useNetwork', () => ({
	useNetwork: () => ({ network: state.network }),
}))
vi.mock('../../hooks/src/useFavoriteValidators', () => ({
	useFavoriteValidators: () => ({ favoritesList: [] }),
}))
vi.mock('contexts/Validators/ValidatorEntries', () => ({
	useValidators: (...args: unknown[]) => {
		demand(...args)
		return { getValidators: entries, isValidatorHighPerformance: () => true }
	},
}))
vi.mock('hooks/useValidatorFilters', () => ({
	useValidatorFilters: () => ({
		applyFilter: (_: unknown, __: unknown, candidates: unknown) => candidates,
	}),
}))
vi.mock('../../plugin-staking-api/src/index', () => ({
	fetchBasicValidatorCandidates: basic,
	fetchOptimalValidatorBatch: optimal,
	fetchValidatorCandidateBatch: specialized,
	fetchSanitizeNomineeCandidates: sanitize,
}))
const candidate = { address: 'new', prefs: { commission: 3, blocked: false } }
beforeEach(() => {
	vi.clearAllMocks()
	state.api = true
	state.network = 'kusama'
	basic.mockResolvedValue([candidate])
	optimal.mockResolvedValue({ fetchOptimalValidatorBatch: [candidate] })
	sanitize.mockResolvedValue({ sanitizeNomineeCandidates: [candidate] })
	specialized.mockResolvedValue([{ candidate }])
	entries.mockReturnValue([candidate])
})

test.each([
	'Active Validator',
	'Random Validator',
	'High Performance Validator',
] as const)(
	'Kusama %s uses API candidates without local entries',
	async (type) => {
		const existing = [{ address: 'existing', prefs: null }]
		expect(await useFetchMethods().add(existing, type)).toEqual([
			...existing,
			candidate,
		])
		expect(basic).toHaveBeenCalledWith(
			'kusama',
			type === 'Active Validator'
				? 'ACTIVE'
				: type === 'Random Validator'
					? 'RANDOM'
					: 'HIGH_ACTIVITY',
			['existing'],
		)
		expect(entries).not.toHaveBeenCalled()
		expect(demand).toHaveBeenCalledWith([], false)
	},
)

test('Kusama optimal selection needs no retainment endpoint or local entries', async () => {
	expect(await useFetchMethods().fetch('Optimal Selection')).toEqual([
		candidate,
	])
	expect(basic).toHaveBeenCalledWith('kusama', 'OPTIMAL')
	expect(optimal).not.toHaveBeenCalled()
	expect(entries).not.toHaveBeenCalled()
})

test('Polkadot retains its existing optimal selection and sanitization', async () => {
	state.network = 'polkadot'
	expect(await useFetchMethods().fetch('Optimal Selection')).toEqual([
		candidate,
	])
	expect(optimal).toHaveBeenCalledWith({ network: 'polkadot' })
	expect(sanitize).toHaveBeenCalledWith('polkadot', [candidate])
	expect(entries).not.toHaveBeenCalled()
})

test('API candidate errors cannot fall back to the local validator set', async () => {
	basic.mockRejectedValue(new Error('offline'))
	await expect(useFetchMethods().fetch('Optimal Selection')).rejects.toThrow(
		'offline',
	)
	expect(entries).not.toHaveBeenCalled()
})

test('node mode requests the shared snapshot and uses its candidate set', async () => {
	state.api = false
	expect(await useFetchMethods().add([], 'Random Validator')).toEqual([
		candidate,
	])
	expect(demand).toHaveBeenCalledWith([], true)
	expect(entries).toHaveBeenCalled()
	expect(basic).not.toHaveBeenCalled()
})
