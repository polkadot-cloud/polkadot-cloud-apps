// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { planckToUnit, rmCommas } from '@w3ux/utils'
import BigNumber from 'bignumber.js'

export const formatCompactNumber = (value: number, locale?: string) =>
	value.toLocaleString(locale, {
		notation: 'compact',
		maximumFractionDigits: 1,
	})

// Return `planckToUnit` as a BigNumber
export const planckToUnitBn = (val: BigNumber, units: number): BigNumber => {
	const result = new BigNumber(
		planckToUnit(
			val.abs().decimalPlaces(0).toFormat({ groupSeparator: '' }),
			units,
		),
	)

	return val.isNegative() ? result.negated() : result
}

// Converts a string to a BigNumber
export const stringToBn = (value: string): BigNumber =>
	new BigNumber(rmCommas(value))

// Convert a perbill value into a percentage
export const perbillToPercent = (
	value: BigNumber | bigint | number,
): BigNumber => {
	if (typeof value === 'bigint' || typeof value === 'number') {
		value = new BigNumber(value)
	}
	return value.dividedBy('10000000')
}

// Convert a percentage value into perbill
export const percentToPerbill = (
	value: BigNumber | bigint | number,
): BigNumber => {
	if (typeof value === 'bigint' || typeof value === 'number') {
		value = new BigNumber(value)
	}
	return value.multipliedBy('10000000').integerValue(BigNumber.ROUND_HALF_UP)
}
