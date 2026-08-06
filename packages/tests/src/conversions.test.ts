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
})
