// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { afterEach, expect, test, vi } from 'vitest'
import {
	getPageValidatorWarningGroups,
	getValidatorsWithHealthIssues,
	getValidatorWarningGroups,
} from '../../app-staking/src/library/GenerateNominations/utils'
import { fetchGetValidatorWarnings } from '../../plugin-staking-api/src/queries/getValidatorWarnings'
import { fetchValidatorDetailsBatch } from '../../plugin-staking-api/src/queries/validatorDetailsBatch'
import type { ValidatorWarnings } from '../../plugin-staking-api/src/types'

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

	expect(result.flaggedValidatorCount).toBe(2)
	expect(result.validatorWarningGroups).toEqual([
		{
			type: 'ZUG_VALIDATOR',
			messageKey: 'zugValidatorWarning',
			labelKey: 'zugValidatorWarningLabel',
			severity: 'danger',
			validators: [sunsetting, both],
		},
		{
			type: 'HETZNER',
			messageKey: 'hetznerValidatorWarning',
			labelKey: 'hetznerValidatorWarningLabel',
			severity: 'warning',
			validators: [both, hetzner],
		},
	])
	expect(result.validatorsWithIssues).toEqual([sunsetting, both, low])
})

test.each(['ZUG_VALIDATOR', 'HETZNER', 'LOW_HISTORICAL_BACKING'] as const)(
	'%s warnings still apply when retainment data is unavailable',
	(type) => {
		const flagged = validator('flagged')
		const result = getValidatorsWithHealthIssues([flagged], [], {
			flagged: [type],
		})
		expect(result.validatorWarningGroups).toHaveLength(1)
		expect(result.validatorsWithIssues).toEqual(
			type === 'ZUG_VALIDATOR' ? [flagged] : [],
		)
		expect(result.flaggedValidatorCount).toBe(type === 'ZUG_VALIDATOR' ? 1 : 0)
	},
)

test('page warnings include historical backing advisories while Hetzner stays in the generator', () => {
	const validators = [
		validator('hetzner'),
		validator('zug'),
		validator('historical'),
	]
	const warnings: ValidatorWarnings = {
		hetzner: ['HETZNER'],
		zug: ['ZUG_VALIDATOR'],
		historical: ['LOW_HISTORICAL_BACKING'],
	}
	const pageWarnings = getPageValidatorWarningGroups(validators, warnings)
	expect(pageWarnings.map(({ type }) => type)).toEqual([
		'ZUG_VALIDATOR',
		'LOW_HISTORICAL_BACKING',
	])
	expect(
		getPageValidatorWarningGroups(validators, { hetzner: ['HETZNER'] }),
	).toEqual([])
	expect(getValidatorWarningGroups(validators, warnings)).toContainEqual({
		type: 'HETZNER',
		messageKey: 'hetznerValidatorWarning',
		labelKey: 'hetznerValidatorWarningLabel',
		severity: 'warning',
		validators: [validators[0]],
	})
})

test.each(['HETZNER', 'LOW_HISTORICAL_BACKING'] as const)(
	'%s validators are still fixed when they independently have red retainment issues',
	(type) => {
		const low = validator('low')
		const advisory = validator('advisory')
		const result = getValidatorsWithHealthIssues([low, advisory], [low], {
			low: [type],
			advisory: [type],
		})
		expect(result.validatorsWithIssues).toEqual([low])
		expect(result.flaggedValidatorCount).toBe(0)
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
	expect(await fetchGetValidatorWarnings('polkadot', [], { who: 'nominator' })).toEqual({})
	expect(query).not.toHaveBeenCalled()
})

test.each([undefined, null])('without a nominator no warning request is made: %s', async (who) => {
	expect(await fetchGetValidatorWarnings('polkadot', ['zug'], { who })).toEqual({})
	expect(query).not.toHaveBeenCalled()
})

test('warning queries preserve supplied addresses and bypass the Apollo cache', async () => {
	query.mockResolvedValue({
		data: {
			getValidatorWarnings: [{ candidate: 'zug', warnings: ['ZUG_VALIDATOR'] }],
		},
	})
	expect(
		await fetchGetValidatorWarnings('polkadot', ['healthy', 'zug'], { who: 'nominator' }),
	).toEqual({
		zug: ['ZUG_VALIDATOR'],
	})
	expect(query).toHaveBeenCalledWith(
		expect.objectContaining({
			variables: { network: 'polkadot', candidates: ['healthy', 'zug'], who: 'nominator' },
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
			await fetchGetValidatorWarnings(network, ['hetzner', 'both', 'healthy'], { who: 'nominator' }),
		).toEqual({
			hetzner: ['HETZNER'],
			both: ['ZUG_VALIDATOR', 'HETZNER'],
		})
	},
)

test('a successful response with no warnings returns an empty record', async () => {
	query.mockResolvedValue({ data: { getValidatorWarnings: [] } })
	expect(await fetchGetValidatorWarnings('kusama', ['healthy'], { who: 'nominator' })).toEqual({})
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
		await fetchGetValidatorWarnings('polkadot', ['missing', 'null'], { who: 'nominator' }),
	).toEqual({
		missing: [],
		null: [],
	})
})

test('warning API failures follow the shared query fallback', async () => {
	query.mockRejectedValue(new Error('API unavailable'))
	expect(await fetchGetValidatorWarnings('polkadot', ['zug'], { who: 'nominator' })).toEqual({})
})

test('cached warning and retainment queries propagate failures for retry', async () => {
	query.mockRejectedValue(new Error('API unavailable'))
	await expect(
		fetchGetValidatorWarnings('polkadot', ['zug'], { throwOnError: true, who: 'nominator' }),
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
		fetchGetValidatorWarnings('polkadot', ['zug'], { throwOnError: true, who: 'nominator' }),
	).rejects.toThrow('Staking API returned no data')
})

test('historical backing warnings survive the API transport alongside existing codes', async () => {
	query.mockResolvedValue({
		data: {
			getValidatorWarnings: [
				{
					candidate: 'historical',
					warnings: ['HETZNER', 'LOW_HISTORICAL_BACKING'],
				},
			],
		},
	})
	expect(await fetchGetValidatorWarnings('polkadot', ['historical'], { who: 'nominator' })).toEqual({
		historical: ['HETZNER', 'LOW_HISTORICAL_BACKING'],
	})
})
