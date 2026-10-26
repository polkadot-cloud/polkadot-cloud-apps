// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ceilDiv } from 'utils'
import { expect, test } from 'vitest'
import { U128_MAX } from '../../consts/src/math'

test.each([
	[0n, 100n, 0n],
	[1n, 100n, 1n],
	[100n, 100n, 1n],
	[101n, 100n, 2n],
	[U128_MAX * 100n, 100n, U128_MAX],
	[U128_MAX * 100n + 1n, 100n, U128_MAX + 1n],
])(
	'ceilDiv(%s, %s) preserves integer precision',
	(value, divisor, expected) => {
		expect(ceilDiv(value, divisor)).toBe(expected)
	},
)

test.each([
	[-1n, 10n],
	[1n, 0n],
	[1n, -1n],
])('ceilDiv rejects invalid division (%s, %s)', (value, divisor) => {
	expect(() => ceilDiv(value, divisor)).toThrow('Invalid division')
})
