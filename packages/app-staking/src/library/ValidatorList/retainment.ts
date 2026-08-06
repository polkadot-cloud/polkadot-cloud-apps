// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

export const MAX_SELF_STAKE_DOT = 100_000

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
