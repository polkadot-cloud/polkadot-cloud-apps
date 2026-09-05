// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { expect, test, vi } from 'vitest'
import { getValidatorsWithRetainment } from '../../app-staking/src/library/GenerateNominations/utils'
import type {
	ValidatorRetainmentResult,
	ValidatorRetainmentWindow,
} from '../../plugin-staking-api/src/types'
import { useRetainmentStatsData } from '../../ui-app/src/RetainmentStats/useRetainmentStatsData'

vi.mock('../../ui-app/node_modules/react-i18next/dist/es/index.js', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
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

test('nomination scoring uses the latest month and never substitutes rolling or missing rates', () => {
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
		['zeroRate', result(window({ retainmentRate: 0 }))],
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
		['complete', 75],
		['monthly', 25],
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
	const zero = useRetainmentStatsData({
		period: window({ compoundRate: 0, retainmentRate: 0 }),
		selfStakeMax: false,
		unit: 'DOT',
		units: 10,
	})
	expect(zero.compoundRate.value).toBe(0)
	expect(zero.retainmentRate.valueText).toBe('0%')
})
