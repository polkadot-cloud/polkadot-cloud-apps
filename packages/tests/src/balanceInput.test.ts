// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { sanitizeBalanceInput } from 'utils'
import { describe, expect, test } from 'vitest'

describe('sanitizeBalanceInput', () => {
	test.each([
		['', 10, ''],
		['.', 10, '0.'],
		['1.', 10, '1.'],
		['.5', 10, '0.5'],
		['1,5', 10, '1.5'],
		['0.0000001', 10, '0.0000001'],
		['1.23456789', 6, '1.234567'],
		['1.5', 0, '1'],
	])('normalizes %s with %i decimals', (value, decimals, expected) => {
		expect(sanitizeBalanceInput(value, decimals)).toBe(expected)
	})

	test.each(['-1', '1e-7', '1.2.3', '1,2,3', '1,234.5', 'one'])(
		'rejects %s instead of changing its magnitude',
		(value) => {
			expect(sanitizeBalanceInput(value, 10)).toBeNull()
		},
	)
})
