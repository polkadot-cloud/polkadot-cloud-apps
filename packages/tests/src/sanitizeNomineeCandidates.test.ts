// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { beforeEach, expect, test, vi } from 'vitest'
import { fetchSanitizeNomineeCandidates } from '../../plugin-staking-api/src/queries/sanitizeNomineeCandidates'

const { query } = vi.hoisted(() => ({ query: vi.fn() }))
vi.mock('../../plugin-staking-api/src/Client', () => ({ client: { query } }))

beforeEach(() => vi.resetAllMocks())

test('sends only GraphQL input fields when candidates contain Apollo metadata', async () => {
	const candidates = [
		Object.freeze({
			address: 'validator-1',
			__typename: 'Validator',
			prefs: Object.freeze({
				commission: 2.5,
				blocked: false,
				__typename: 'ValidatorPrefs',
			}),
		}),
	]
	const data = {
		sanitizeNomineeCandidates: [
			{ address: 'sanitized', prefs: { commission: 0, blocked: false } },
		],
	}
	query.mockResolvedValue({ data })

	expect(await fetchSanitizeNomineeCandidates('polkadot', candidates)).toEqual(
		data,
	)
	expect(query).toHaveBeenCalledExactlyOnceWith(
		expect.objectContaining({
			variables: {
				network: 'polkadot',
				candidates: [
					{
						address: 'validator-1',
						prefs: { commission: 2.5, blocked: false },
					},
				],
			},
			fetchPolicy: 'no-cache',
		}),
	)
	expect(candidates[0].__typename).toBe('Validator')
	expect(candidates[0].prefs.__typename).toBe('ValidatorPrefs')
})

test('preserves candidate order and preference values', async () => {
	const candidates = [
		{ address: 'second', prefs: { commission: 0, blocked: true } },
		{ address: 'first', prefs: { commission: 100, blocked: false } },
	]
	query.mockResolvedValue({ data: { sanitizeNomineeCandidates: candidates } })
	await fetchSanitizeNomineeCandidates('kusama', candidates)
	expect(query).toHaveBeenCalledWith(
		expect.objectContaining({ variables: { network: 'kusama', candidates } }),
	)
})

test('propagates API errors instead of returning unsanitized candidates', async () => {
	query.mockRejectedValue(new Error('offline'))
	await expect(fetchSanitizeNomineeCandidates('polkadot', [])).rejects.toThrow(
		'offline',
	)
})
