// Copyright 2026 @polkadot-cloud/polkadot-staking-dashboard authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import type { IdentityOf, SuperIdentity } from 'types'
import type { IdentityDisplay } from './types'

export const getIdentityDisplay = (
	_identity?: IdentityOf,
	_superIdentity?: SuperIdentity,
): IdentityDisplay => {
	let display = ''

	// Add base-identity to display
	const baseValue = _identity?.info?.display?.value
	if (baseValue) {
		display = baseValue
	}
	// Overwrite with super identity value if it exists
	const superIdentityValue =
		_superIdentity?.superOf?.identity?.info?.display?.value
	if (superIdentityValue) {
		display = superIdentityValue
	}
	// Add super value as secondary identity value
	const superValue = _superIdentity?.value || ''

	return display === ''
		? {
				node: null,
				data: null,
			}
		: {
				node: (
					<>
						{display}
						{superValue !== '' ? <span>/ {superValue}</span> : null}
					</>
				),
				data: {
					display,
					super: superValue || '',
				},
			}
}

// Normalise era points between 0 and 1 relative to the highest recorded value.
export const normaliseEraPoints = (
	eraPoints: Record<string, BigNumber>,
	high: BigNumber,
): Record<string, number> => {
	const percentile = high.isZero() ? new BigNumber(0) : high.dividedBy(100)

	return Object.fromEntries(
		Object.entries(eraPoints).map(([era, points]) => [
			era,
			Math.min(
				percentile.isZero()
					? 0
					: points.dividedBy(percentile).multipliedBy(0.01).toNumber(),
				1,
			),
		]),
	)
}

// Prefill low values where no points are recorded.
export const prefillEraPoints = (eraPoints: number[]): number[] => {
	const missing = Math.max(30 - eraPoints.length, 0)

	if (!missing) {
		return eraPoints
	}

	return Array(missing).fill(0).concat(eraPoints)
}
