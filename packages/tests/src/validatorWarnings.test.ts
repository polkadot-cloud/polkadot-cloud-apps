// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { afterEach, expect, test, vi } from 'vitest'
import { getValidatorsWithHealthIssues } from '../../app-staking/src/library/GenerateNominations/utils'
import { fetchGetValidatorWarnings } from '../../plugin-staking-api/src/queries/getValidatorWarnings'
import { fetchValidatorDetailsBatch } from '../../plugin-staking-api/src/queries/validatorDetailsBatch'

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
	const hetzner = validator('hetzner')
	const healthy = validator('healthy')
	const result = getValidatorsWithHealthIssues(
		[sunsetting, healthy, both, low, hetzner],
		[low, both, validator('removed')],
		{
			both: ['ZUG_VALIDATOR', 'HETZNER'],
			sunsetting: ['ZUG_VALIDATOR'],
			hetzner: ['HETZNER'],
			removed: ['ZUG_VALIDATOR', 'HETZNER'],
		},
	)

	expect(result.flaggedValidatorCount).toBe(3)
	expect(result.validatorWarningGroups).toEqual([
		{
			type: 'ZUG_VALIDATOR',
			messageKey: 'zugValidatorWarning',
			validators: [sunsetting, both],
		},
		{
			type: 'HETZNER',
			messageKey: 'hetznerValidatorWarning',
			validators: [both, hetzner],
		},
	])
	expect(result.validatorsWithIssues).toEqual([sunsetting, both, low, hetzner])
})

test.each(['ZUG_VALIDATOR', 'HETZNER'] as const)(
	'%s warnings still apply when retainment data is unavailable',
	(type) => {
		const flagged = validator('flagged')
		const result = getValidatorsWithHealthIssues([flagged], [], {
			flagged: [type],
		})
		expect(result.validatorsWithIssues).toEqual([flagged])
		expect(result.flaggedValidatorCount).toBe(1)
	},
)

test('clearing or replacing a selection discards warnings for removed validators', () => {
	for (const validators of [[], [validator('healthy')]]) {
		expect(
			getValidatorsWithHealthIssues(validators, [], {
				removed: ['ZUG_VALIDATOR', 'HETZNER'],
			}),
		).toEqual({
			flaggedValidatorCount: 0,
			validatorWarningGroups: [],
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

test.each(['polkadot', 'kusama'])(
	'Hetzner warnings are preserved from the %s API response',
	async (network) => {
		query.mockResolvedValue({
			data: {
				getValidatorWarnings: [
					{ candidate: 'hetzner', warnings: ['HETZNER'] },
					{ candidate: 'both', warnings: ['ZUG_VALIDATOR', 'HETZNER'] },
				],
			},
		})
		expect(
			await fetchGetValidatorWarnings(network, ['hetzner', 'both', 'healthy']),
		).toEqual({
			hetzner: ['HETZNER'],
			both: ['ZUG_VALIDATOR', 'HETZNER'],
		})
	},
)

test('a successful response with no warnings returns an empty record', async () => {
	query.mockResolvedValue({ data: { getValidatorWarnings: [] } })
	expect(await fetchGetValidatorWarnings('kusama', ['healthy'])).toEqual({})
})

test('missing warning arrays are normalized before health checks consume them', async () => {
	query.mockResolvedValue({
		data: {
			getValidatorWarnings: [
				{ candidate: 'missing' },
				{ candidate: 'null', warnings: null },
			],
		},
	})
	expect(
		await fetchGetValidatorWarnings('polkadot', ['missing', 'null']),
	).toEqual({
		missing: [],
		null: [],
	})
})

test('warning API failures follow the shared query fallback', async () => {
	query.mockRejectedValue(new Error('API unavailable'))
	expect(await fetchGetValidatorWarnings('polkadot', ['zug'])).toEqual({})
})

test('cached warning and retainment queries propagate failures for retry', async () => {
	query.mockRejectedValue(new Error('API unavailable'))
	await expect(
		fetchGetValidatorWarnings('polkadot', ['zug'], { throwOnError: true }),
	).rejects.toThrow('API unavailable')
	await expect(
		fetchValidatorDetailsBatch('polkadot', ['zug'], 99, 1, 30, {
			throwOnError: true,
		}),
	).rejects.toThrow('API unavailable')
})

test('missing response data is not cached as a successful empty result', async () => {
	query.mockResolvedValue({ data: null })
	await expect(
		fetchGetValidatorWarnings('polkadot', ['zug'], { throwOnError: true }),
	).rejects.toThrow('Staking API returned no data')
})
