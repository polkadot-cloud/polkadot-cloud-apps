// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { planckToUnitBn, stringToBn } from 'utils'
import { describe, expect, test } from 'vitest'

describe('planckToUnitBn', () => {
	test.each([
		['8507711000000', 10, '850.7711'],
		['-8507711000000', 10, '-850.7711'],
		['-1', 10, '-1e-10'],
	])('converts %s planck with %i decimals', (value, units, expected) => {
		expect(planckToUnitBn(stringToBn(value), units).toString()).toBe(expected)
	})

	test.each([
		['0', 10, '0'],
		['1', 10, '0.0000000001'],
		['-1', 12, '-0.000000000001'],
		[
			'340282366920938463463374607431768211455',
			10,
			'34028236692093846346337460743.1768211455',
		],
		[
			'-340282366920938463463374607431768211455',
			10,
			'-34028236692093846346337460743.1768211455',
		],
	] as const)(
		'preserves the sign and precision of %s planck',
		(value, units, expected) => {
			expect(planckToUnitBn(stringToBn(value), units).toFixed()).toBe(expected)
		},
	)
})
