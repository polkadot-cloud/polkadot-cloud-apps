// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { beforeEach, expect, test, vi } from 'vitest'
import {
	fetchNominationWarnings,
	nominationWarningsStore,
	warningRequestKey,
} from '../../app-staking/src/hooks/useNominationWarnings/cache'

const { fetchWarnings, fetchDetails } = vi.hoisted(() => ({
	fetchWarnings: vi.fn(),
	fetchDetails: vi.fn(),
}))

vi.mock('../../plugin-staking-api/src/index', () => ({
	fetchGetValidatorWarnings: fetchWarnings,
	fetchValidatorDetailsBatch: fetchDetails,
}))

vi.mock('../../hooks/src/index', () => import('../../hooks/src/util'))

const request = {
	network: 'polkadot',
	era: 100,
	erasPerDay: 1,
	addresses: ['zug', 'healthy'],
}

beforeEach(() => {
	vi.resetAllMocks()
	nominationWarningsStore.resetSnapshot()
	fetchWarnings.mockResolvedValue({ zug: ['ZUG_VALIDATOR'] })
	fetchDetails.mockResolvedValue({ validatorRetainmentBatch: [] })
})

test('page and header requests are deduplicated and reused after page remounts', async () => {
	const unsubscribe = nominationWarningsStore.subscribe(() => {})
	await Promise.all([
		fetchNominationWarnings(request),
		fetchNominationWarnings(request),
	])
	const cached = nominationWarningsStore.getSnapshot()
	unsubscribe()

	const listener = vi.fn()
	const leavePage = nominationWarningsStore.subscribe(listener)
	await fetchNominationWarnings({ ...request, addresses: ['healthy', 'zug'] })
	expect(fetchWarnings).toHaveBeenCalledTimes(1)
	expect(fetchDetails).toHaveBeenCalledTimes(1)
	expect(nominationWarningsStore.getSnapshot()).toBe(cached)
	expect(listener).not.toHaveBeenCalled()
	leavePage()
})

test('new eras and selections fetch fresh data without overwriting cached results', async () => {
	await fetchNominationWarnings(request)
	fetchWarnings.mockResolvedValue({})
	const nextEra = { ...request, era: 101 }
	const nextSelection = { ...request, addresses: ['healthy'] }
	await fetchNominationWarnings(nextEra)
	await fetchNominationWarnings(nextSelection)
	expect(fetchWarnings).toHaveBeenCalledTimes(3)
	expect(
		nominationWarningsStore.getSnapshot()[warningRequestKey(request)]?.warnings,
	).toEqual({ zug: ['ZUG_VALIDATOR'] })
	expect(
		nominationWarningsStore.getSnapshot()[warningRequestKey(nextSelection)]
			?.warnings,
	).toEqual({})
})

test('empty results are cached and empty selections do not fetch', async () => {
	fetchWarnings.mockResolvedValue({})
	await fetchNominationWarnings({ ...request, addresses: [] })
	expect(fetchWarnings).not.toHaveBeenCalled()
	await fetchNominationWarnings(request)
	await fetchNominationWarnings(request)
	expect(fetchWarnings).toHaveBeenCalledTimes(1)
})

test('an unexpected failure clears loading and permits a later retry', async () => {
	fetchWarnings.mockRejectedValueOnce(new Error('unavailable'))
	await fetchNominationWarnings(request)
	expect(
		nominationWarningsStore.getSnapshot()[warningRequestKey(request)]?.status,
	).toBe('error')
	await fetchNominationWarnings(request)
	expect(
		nominationWarningsStore.getSnapshot()[warningRequestKey(request)]?.status,
	).toBe('ready')
})
