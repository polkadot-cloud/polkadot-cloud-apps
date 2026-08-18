// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type BigNumber from 'bignumber.js'
import { RetainmentThresholds } from 'consts/retainment'

// Check if the self-stake is at or above the hard cap. If the hard cap is not defined or is zero,
// return false.
export const isMaxSelfStake = (
	selfStakePlanck: BigNumber | undefined,
	hardCapSelfStake: bigint | undefined,
) =>
	hardCapSelfStake !== undefined &&
	hardCapSelfStake > 0n &&
	selfStakePlanck?.gte(hardCapSelfStake.toString()) === true

// Clamp the retainment rate to be between 0 and 100. If the rate is not a finite number, return
// 0.
export const clampRate = (rate: number) =>
	Number.isFinite(rate) ? Math.min(Math.max(rate, 0), 100) : 0

// Get the retainment rate after commission is applied. If either the rate or commission is not a
// finite number, return undefined.
export const getRateAfterCommission = (
	rate?: number,
	commission?: number | null,
) =>
	typeof rate === 'number' &&
	Number.isFinite(rate) &&
	typeof commission === 'number' &&
	Number.isFinite(commission)
		? rate * (1 - commission / 100)
		: undefined

// Get the retainment status based on the retainment rate.
export const getRetainmentStatus = (rate: number) => {
	if (rate >= RetainmentThresholds.high) {
		return 'success'
	}
	if (rate >= RetainmentThresholds.medium) {
		return 'warning'
	}
	return 'danger'
}

// Get the color associated with the retainment rate.
export const getRateColor = (rate: number): string => {
	if (rate >= RetainmentThresholds.high) {
		return 'var(--status-success)'
	}
	if (rate >= RetainmentThresholds.medium) {
		return 'var(--status-warning)'
	}
	if (rate >= RetainmentThresholds.low) {
		return 'color-mix(in srgb, var(--status-warning) 55%, var(--status-danger))'
	}
	return 'var(--status-danger)'
}
