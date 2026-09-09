// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { expect, test, vi } from 'vitest'
import {
	getValidatorItemWarnings,
	getValidatorsWithRetainment,
	getValidatorWarningSeverity,
} from '../../app-staking/src/library/GenerateNominations/utils'
import type {
	ValidatorRetainmentResult,
	ValidatorRetainmentWindow,
	ValidatorWarningType,
} from '../../plugin-staking-api/src/types'
import {
	useRetainmentRateData,
	useRetainmentStatsData,
} from '../../ui-app/src/RetainmentStats/useRetainmentStatsData'

vi.mock('../../ui-app/node_modules/react-i18next/dist/es/index.js', () => ({
	useTranslation: () => ({
		t: (key: string, options?: { count: number }) =>
			options ? `${key}:${options.count}` : key,
		i18n: { resolvedLanguage: 'en' },
	}),
}))

const window = (
	overrides: Partial<ValidatorRetainmentWindow> = {},
): ValidatorRetainmentWindow => ({
	month: 8,
	year: 2026,
	windowMonths: 1,
	includedMonthCount: 1,
	fromEra: 100,
	toEra: 130,
	fromTimestamp: 1785542400,
	toTimestamp: 1788220800,
	graphRewards: '100000000000000000000',
	netInflow: '-900719925474099312345',
	retained: '75000000000000000000',
	retainmentRate: 75,
	validatorRewards: '0',
	selfStakeChange: '0',
	compounded: '0',
	compoundRate: null,
	...overrides,
})

const result = (
	oneMonth: ValidatorRetainmentWindow | null,
	threeMonths: ValidatorRetainmentWindow | null = null,
): ValidatorRetainmentResult => ({
	months: oneMonth ? [oneMonth] : [],
	retainment: { oneMonth, threeMonths },
})

test('nomination scoring uses rolling windows and never substitutes monthly or missing rates', () => {
	const results = new Map<string, ValidatorRetainmentResult | null>([
		[
			'complete',
			result(
				window(),
				window({ windowMonths: 3, includedMonthCount: 2, retainmentRate: 10 }),
			),
		],
		['monthly', result(window({ retainmentRate: 25 }))],
		['rolling', result(null, window({ windowMonths: 3, retainmentRate: 100 }))],
		['empty', result(null)],
		['null', null],
		[
			'zeroRewards',
			result(window({ graphRewards: '0', retainmentRate: null })),
		],
		['zeroRate', result(null, window({ retainmentRate: 0, windowMonths: 3 }))],
	])
	const validators = [...results.keys(), 'missing'].map((address) => ({
		address,
		prefs: { commission: 0, blocked: false },
	}))
	expect(
		getValidatorsWithRetainment(validators, results).map(
			({ validator, rate }) => [validator.address, rate],
		),
	).toEqual([
		['complete', 10],
		['rolling', 100],
		['zeroRate', 0],
	])
})

test('monthly stats preserve unavailable rates, real zero rates and timestamps in seconds', () => {
	const period = window({ retainmentRate: null })
	const stats = useRetainmentStatsData({
		period,
		selfStakeMax: false,
		unit: 'DOT',
		units: 10,
	})
	expect(stats.compoundRate.value).toBeUndefined()
	expect(stats.retainmentRate.value).toBeUndefined()
	expect(stats.compoundRate.valueText).toBe('—')
	expect(stats.month?.date.toISOString()).toBe('2026-08-01T00:00:00.000Z')
	expect(stats.month?.label).toBe('August 2026')
	expect(stats.netOutflow.prefix).toBe('−')
	expect(period.netInflow).toBe('-900719925474099312345')
	expect(period.includedMonthCount).toBe(1)
	const zero = useRetainmentStatsData({
		period: window({ compoundRate: 0, retainmentRate: 0 }),
		selfStakeMax: false,
		unit: 'DOT',
		units: 10,
	})
	expect(zero.compoundRate.value).toBe(0)
	expect(zero.retainmentRate.valueText).toBe('0%')
})

test('rolling stats use the included month count and preserve unavailable compound rates at max self stake', () => {
	const stats = useRetainmentStatsData({
		period: window({
			windowMonths: 3,
			includedMonthCount: 2,
			retainmentRate: 40,
		}),
		selfStakeMax: true,
		unit: 'DOT',
		units: 10,
	})
	expect(stats.retainmentRate.value).toBe(40)
	expect(stats.retainmentLabel).toBe('monthRetainment:2')
	expect(stats.compoundRate.value).toBeUndefined()
	expect(stats.compoundRate.valueText).toBe('—')
})

test.each([
	{ rate: null, value: undefined, text: '—' },
	{ rate: Number.NaN, value: undefined, text: '—' },
	{ rate: Number.POSITIVE_INFINITY, value: undefined, text: '—' },
	{ rate: 0, value: 0, text: '0%' },
	{ rate: -10, value: 0, text: '0%' },
	{ rate: 150, value: 100, text: '100%' },
	{ rate: 42.25, value: 42.25, text: '42.3%' },
])(
	'operator and validator rate formatting agree for $rate',
	({ rate, value, text }) => {
		const period = window({ includedMonthCount: 2, retainmentRate: rate })
		const operator = useRetainmentRateData(period)
		const validator = useRetainmentStatsData({
			period,
			selfStakeMax: false,
			unit: 'DOT',
			units: 10,
		})

		expect(operator.retainmentRate.value).toBe(value)
		expect(operator.retainmentRate.valueText).toBe(text)
		expect(operator.retainmentLabel).toBe('monthRetainment:2')
		expect(operator.retainmentRate).toEqual(validator.retainmentRate)
		expect(operator.retainmentLabel).toBe(validator.retainmentLabel)
	},
)

test('missing retainment windows display unavailable rates without a month count', () => {
	const { retainmentLabel, retainmentRate } = useRetainmentRateData()

	expect(retainmentLabel).toBe('retainment')
	expect(retainmentRate.value).toBeUndefined()
	expect(retainmentRate.valueText).toBe('—')
	expect(retainmentRate.color).toBe('var(--text-tertiary)')
})

test.each<
	[
		ValidatorWarningType[],
		number | null,
		boolean,
		'warning' | 'danger' | undefined,
	]
>([
	[['HETZNER'], null, true, 'warning'],
	[['HETZNER'], 90, true, 'warning'],
	[['HETZNER'], 60, true, 'warning'],
	[['HETZNER'], 40, true, 'danger'],
	[['ZUG_VALIDATOR'], 90, true, 'danger'],
	[['HETZNER', 'ZUG_VALIDATOR'], 90, true, 'danger'],
	[['HETZNER'], 40, false, undefined],
	[[], 90, true, undefined],
	[[], 60, true, 'warning'],
	[[], 40, true, 'danger'],
])(
	'item strip combines %j and %s%% retainment with highlighting %s',
	(warnings, rate, highlightWarnings, expected) => {
		const stats = useRetainmentStatsData({
			highlightWarnings,
			warningSeverity: getValidatorWarningSeverity(warnings),
			period: rate === null ? undefined : window({ retainmentRate: rate }),
			selfStakeMax: false,
			unit: 'DOT',
			units: 10,
		})
		expect(stats.statusAccent).toBe(expected)
	},
)

test('item badges preserve overlapping issues in severity order using three-month retainment', () => {
	const retainment = result(
		window({ retainmentRate: 100 }),
		window({ retainmentRate: 10 }),
	)
	expect(
		getValidatorItemWarnings(['HETZNER', 'ZUG_VALIDATOR'], retainment),
	).toEqual([
		{
			type: 'ZUG_VALIDATOR',
			labelKey: 'zugValidatorWarningLabel',
			severity: 'danger',
		},
		{
			type: 'LOW_RETAINMENT',
			labelKey: 'lowThreeMonthRetainmentWarningLabel',
			severity: 'danger',
		},
		{
			type: 'HETZNER',
			labelKey: 'hetznerValidatorWarningLabel',
			severity: 'warning',
		},
	])
})

test.each([
	[0, 'danger'],
	[49.9, 'danger'],
	[50, 'warning'],
	[69.9, 'warning'],
	[70, undefined],
	[100, undefined],
	[null, undefined],
	[Number.NaN, undefined],
	[Number.POSITIVE_INFINITY, undefined],
])(
	'item retainment badges match the summary threshold for %s',
	(rate, severity) => {
		const warnings = getValidatorItemWarnings(
			[],
			result(window({ retainmentRate: 0 }), window({ retainmentRate: rate })),
		)
		expect(warnings.map((warning) => warning.severity)).toEqual(
			severity ? [severity] : [],
		)
	},
)

test('missing three-month data never substitutes one-month retainment or hides API warnings', () => {
	for (const retainment of [
		undefined,
		null,
		result(window({ retainmentRate: 0 })),
	]) {
		expect(getValidatorItemWarnings([], retainment)).toEqual([])
		expect(getValidatorItemWarnings(['HETZNER'], retainment)).toEqual([
			{
				type: 'HETZNER',
				labelKey: 'hetznerValidatorWarningLabel',
				severity: 'warning',
			},
		])
	}
})
