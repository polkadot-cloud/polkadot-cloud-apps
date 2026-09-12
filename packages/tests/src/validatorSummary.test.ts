// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { Validator, ValidatorOverview } from 'types'
import { stringToBn } from 'utils'
import { expect, test, vi } from 'vitest'
import { injectValidatorListData } from '../../app-staking/src/library/ValidatorList/overview'
import { useValidatorSelfStake } from '../../app-staking/src/library/ValidatorList/useValidatorSelfStake'
import { useValidatorSummaryData } from '../../app-staking/src/library/ValidatorList/ValidatorSummary'

// Row summaries must render from the list snapshot, without acquiring their own data.
vi.mock('data-gate', () => ({
	useValidatorOverviews: () => {
		throw new Error('Unexpected row overview query')
	},
}))
vi.mock('../../hooks/src/useNetwork', () => ({
	useNetwork: () => ({ network: 'polkadot' }),
}))
vi.mock('../../hooks/src/useStakingMetrics', () => ({
	useHardCapSelfStake: () => undefined,
}))
vi.mock('../../consts/src/util', () => ({
	getStakingChainData: () => ({ unit: 'DOT', units: 10 }),
}))
vi.mock('../../app-staking/src/library/ListItem/Labels/ActivityTier', () => ({
	ActivityTier: () => null,
}))
vi.mock(
	'../../app-staking/node_modules/react-i18next/dist/es/index.js',
	() => ({
		useTranslation: () => ({
			t: (key: string) => key,
			i18n: { resolvedLanguage: 'en' },
		}),
	}),
)

const overview: ValidatorOverview = {
	own: 25000000000n,
	total: 12345678901234567890n,
	nominatorCount: 500,
	pageCount: 2,
}
const props = {
	address: 'validator',
	overview,
	status: 'waiting' as const,
	selfStakeMax: false,
	unit: 'DOT',
}

test('summaries render the supplied overview without querying exposures or account data', () => {
	const result = useValidatorSummaryData(props)
	expect(result.validatorStatus).toBe('active')
	expect(result.statusLabel).toBe('listItemActive')
	expect(result.totalStake).toBe('1,234,567,890')
})

test('summaries keep loading until the list overview arrives', () => {
	const result = useValidatorSummaryData({
		...props,
		overview: undefined,
		status: 'active',
	})
	expect(result.statusLabel).toBe('syncing')
	expect(result.validatorStatus).toBe('waiting')
	expect(result.totalStake).toBeUndefined()
})

test('an absent overview is waiting even with a stale active status', () => {
	const result = useValidatorSummaryData({
		...props,
		overview: null,
		status: 'active',
	})
	expect(result.statusLabel).toBe('Waiting')
	expect(result.validatorStatus).toBe('waiting')
	expect(result.totalStake).toBeUndefined()
})

test('active zero stake remains distinct from missing overview data', () => {
	const result = useValidatorSummaryData({
		...props,
		overview: { ...overview, total: 0n },
	})
	expect(result.validatorStatus).toBe('active')
	expect(result.totalStake).toBe('0')
})

test('API backing stake and status override overview totals', () => {
	const result = useValidatorSummaryData({
		...props,
		statusActive: true,
		statusLabel: 'backing',
		statusValue: stringToBn('12.5'),
	})
	expect(result.statusLabel).toBe('backing')
	expect(result.totalStake).toBe('12.5')
})

test.each([undefined, stringToBn('0')])(
	'empty API stake (%s) does not fall back to overview totals',
	(statusValue) => {
		const result = useValidatorSummaryData({
			...props,
			statusActive: false,
			statusLabel: 'waiting',
			statusValue,
		})
		expect(result.statusLabel).toBe('waiting')
		expect(result.totalStake).toBeUndefined()
	},
)

test('self stake uses the supplied overview without querying individual validators', () => {
	const result = useValidatorSelfStake(overview, 10)
	expect(result.selfStake?.toFixed()).toBe('2.5')
	expect(result.selfStakeMax).toBe(false)
})

test.each([null, undefined])(
	'missing overview %s leaves self stake unavailable',
	(entry) => {
		expect(useValidatorSelfStake(entry, 10).selfStake).toBeUndefined()
	},
)

test('a list snapshot preserves per-row loading, missing, and active states', () => {
	const validators: Validator[] = [
		{ address: 'validator', prefs: null },
		{ address: 'waiting', prefs: null },
	]
	const loading = injectValidatorListData(validators, undefined)
	expect(loading.map((entry) => entry.overview)).toEqual([undefined, undefined])
	const completed = injectValidatorListData(
		validators,
		new Map([['validator', overview]]),
	)
	expect(completed.map((entry) => entry.overview)).toEqual([overview, null])
	expect(completed.map((entry) => entry.validatorStatus)).toEqual([
		'active',
		'waiting',
	])
	expect(
		useValidatorSummaryData({ ...props, overview: completed[1].overview })
			.statusLabel,
	).toBe('Waiting')
	// A new era or address scope must not retain the preceding snapshot.
	expect(
		injectValidatorListData(completed, undefined).every(
			(entry) => entry.overview === undefined,
		),
	).toBe(true)
})
