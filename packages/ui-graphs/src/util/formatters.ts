// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { NominatorReward, PoolReward } from 'plugin-staking-api/types'
import type { FormatRewardsConfig } from '../types'
import { getLatestReward, processPayouts } from './dataProcessing'

/**
 * Internal helper for formatting rewards
 */
const formatRewardsInternal = (config: FormatRewardsConfig) => {
	const { fromDate, days, units, payouts, poolClaims, unclaimedPayouts } =
		config

	// Set the from date to the start of the next day (UTC)
	const adjustedFromDate = new Date(fromDate)
	adjustedFromDate.setUTCDate(adjustedFromDate.getUTCDate() + 1)
	adjustedFromDate.setUTCHours(0, 0, 0, 0)

	// Process nominator payouts
	const allPayouts = processPayouts(
		payouts,
		adjustedFromDate,
		days,
		units,
		'nominate',
	)

	// Process unclaimed nominator payouts
	const allUnclaimedPayouts = processPayouts(
		unclaimedPayouts,
		adjustedFromDate,
		days,
		units,
		'nominate',
	)

	// Process pool claims
	const allPoolClaims = processPayouts(
		poolClaims,
		adjustedFromDate,
		days,
		units,
		'pools',
	)

	return {
		allPayouts,
		allUnclaimedPayouts,
		allPoolClaims,
		lastReward: getLatestReward(payouts, poolClaims),
	}
}

/**
 * Format provided payouts and returns processed rewards for graphs
 * Maintains backward compatibility with the original function signature
 */
export const formatRewardsForGraphs = (
	fromDate: Date,
	days: number,
	units: number,
	payouts: NominatorReward[],
	poolClaims: PoolReward[],
	unclaimedPayouts: NominatorReward[],
) =>
	formatRewardsInternal({
		fromDate,
		days,
		units,
		payouts,
		poolClaims,
		unclaimedPayouts,
	})

/**
 * Format rewards for graphs using a configuration object (alternative API)
 */
export const formatRewardsForGraphsWithConfig = (config: FormatRewardsConfig) =>
	formatRewardsInternal(config)
