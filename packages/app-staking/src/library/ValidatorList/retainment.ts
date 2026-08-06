// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export interface RetainmentMonth {
	fromTimestamp: number
	netFlow: number
	selfStakeChange: number
	retainmentRate: number
	compoundRate: number
}

export const MAX_SELF_STAKE_DOT = 100_000

// TODO: Replace this view model with validatorRetainment once the query is wired up.
// The API months array is expected to be latest-first.
export const DUMMY_RETAINMENT: {
	month: RetainmentMonth
} = {
	month: {
		fromTimestamp: Date.UTC(2026, 6, 1) / 1000,
		netFlow: 2_240,
		selfStakeChange: 50_500,
		retainmentRate: 88,
		compoundRate: 64,
	},
}

export const clampRate = (rate: number) =>
	Number.isFinite(rate) ? Math.min(Math.max(rate, 0), 100) : 0

export const getRateColor = (rate: number): string => {
	if (rate >= 75) {
		return 'var(--status-success)'
	}
	if (rate >= 50) {
		return 'var(--status-warning)'
	}
	if (rate >= 25) {
		return 'color-mix(in srgb, var(--status-warning) 55%, var(--status-danger))'
	}
	return 'var(--status-danger)'
}
