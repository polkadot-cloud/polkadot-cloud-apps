// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

/**
 * Normalizes a non-negative fixed-point balance input.
 *
 * A single comma is accepted as a decimal separator. Invalid input is rejected
 * instead of stripping characters that could change the intended magnitude.
 */
export const sanitizeBalanceInput = (
	value: string,
	maxDecimals: number,
): string | null => {
	let normalized = value

	if (normalized.includes(',')) {
		if (
			normalized.includes('.') ||
			normalized.indexOf(',') !== normalized.lastIndexOf(',')
		) {
			return null
		}
		normalized = normalized.replace(',', '.')
	}

	if (!/^\d*(?:\.\d*)?$/.test(normalized)) {
		return null
	}
	if (!normalized) {
		return ''
	}

	const [integer = '', decimal] = normalized.split('.')
	const integerPart = integer || '0'
	if (decimal === undefined || maxDecimals <= 0) {
		return integerPart
	}

	return `${integerPart}.${decimal.slice(0, maxDecimals)}`
}
