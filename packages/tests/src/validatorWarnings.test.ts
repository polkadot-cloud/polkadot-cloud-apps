// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { afterEach, expect, test, vi } from 'vitest'
import { getValidatorsWithHealthIssues } from '../../app-staking/src/library/GenerateNominations/utils'
import { fetchGetValidatorWarnings } from '../../plugin-staking-api/src/queries/getValidatorWarnings'

const { query } = vi.hoisted(() => ({ query: vi.fn() }))

vi.mock('../../plugin-staking-api/src/Client', () => ({ client: { query } }))

const validator = (address: string) => ({
	address,
	prefs: { commission: 0, blocked: false },
})

afterEach(() => vi.resetAllMocks())

test('overlapping health issues remove each selected validator once in selection order', () => {
	const both = validator('both')
	const low = validator('low')
	const sunsetting = validator('sunsetting')
	const healthy = validator('healthy')
	const result = getValidatorsWithHealthIssues(
		[sunsetting, healthy, both, low],
		[low, both, validator('removed')],
		{
			both: ['ZUG_VALIDATOR'],
			sunsetting: ['ZUG_VALIDATOR'],
			removed: ['ZUG_VALIDATOR'],
		},
	)

	expect(result.sunsettingCount).toBe(2)
	expect(result.sunsettingWarnings).toEqual([
		{
			type: 'ZUG_VALIDATOR',
			messageKey: 'zugValidatorWarning',
			validators: [sunsetting, both],
		},
	])
	expect(result.validatorsWithIssues).toEqual([sunsetting, both, low])
})

test('sunsetting warnings still apply when retainment data is unavailable', () => {
	const zug = validator('zug')
	expect(
		getValidatorsWithHealthIssues([zug], [], { zug: ['ZUG_VALIDATOR'] })
			.validatorsWithIssues,
	).toEqual([zug])
})

test('clearing or replacing a selection discards warnings for removed validators', () => {
	for (const validators of [[], [validator('healthy')]]) {
		expect(
			getValidatorsWithHealthIssues(validators, [], {
				removed: ['ZUG_VALIDATOR'],
			}),
		).toEqual({
			sunsettingCount: 0,
			sunsettingWarnings: [],
			validatorsWithIssues: [],
		})
	}
})

test('an empty candidate list does not call the warning API', async () => {
	expect(await fetchGetValidatorWarnings('polkadot', [])).toEqual({})
	expect(query).not.toHaveBeenCalled()
})

test('warning queries preserve supplied addresses and bypass the Apollo cache', async () => {
	query.mockResolvedValue({
		data: {
			getValidatorWarnings: [{ candidate: 'zug', warnings: ['ZUG_VALIDATOR'] }],
		},
	})
	expect(
		await fetchGetValidatorWarnings('polkadot', ['healthy', 'zug']),
	).toEqual({
		zug: ['ZUG_VALIDATOR'],
	})
	expect(query).toHaveBeenCalledWith(
		expect.objectContaining({
			variables: { network: 'polkadot', candidates: ['healthy', 'zug'] },
			fetchPolicy: 'no-cache',
		}),
	)
})

test('a successful response with no warnings returns an empty record', async () => {
	query.mockResolvedValue({ data: { getValidatorWarnings: [] } })
	expect(await fetchGetValidatorWarnings('kusama', ['healthy'])).toEqual({})
})

test('warning API failures follow the shared query fallback', async () => {
	query.mockRejectedValue(new Error('API unavailable'))
	expect(await fetchGetValidatorWarnings('polkadot', ['zug'])).toEqual({})
})
