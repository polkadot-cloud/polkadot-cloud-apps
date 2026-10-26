// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

// Divides a non-negative integer by a positive divisor, rounding up without losing precision.
export const ceilDiv = (value: bigint, divisor: bigint): bigint => {
	if (value < 0n || divisor <= 0n) throw new Error('Invalid division')
	return (value + divisor - 1n) / divisor
}
