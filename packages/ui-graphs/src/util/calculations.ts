// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { fromUnixTime } from 'date-fns'
import { daysPassed } from 'utils'
import type { RewardRecord } from '../types'

/**
 * Calculate percentage of n1 relative to n2
 */
export const percentageOf = (n1: number, n2: number): number => {
	if (n2 === 0) {
		return 0
	}
	const p = (n1 / n2) * 100
	return p > 100 ? 100 : p
}

/**
 * Calculate moving average payouts over a specified number of days
 */
export const calculatePayoutAverages = (
	payouts: RewardRecord[],
	fromDate: Date,
	days: number,
	avgDays: number,
) => {
	// If we don't need to take an average, just return payouts
	if (avgDays <= 1) {
		return payouts
	}

	// Create moving average value over avgDays past days, if any
	let payoutsAverages: { reward: number; timestamp: number }[] = []

	for (let i = 0; i < payouts.length; i++) {
		// Average period end
		const end = Math.max(0, i - avgDays)

		// The total reward earned in period
		let total = 0
		// period length to be determined
		let num = 0

		for (let j = i; j >= end; j--) {
			if (payouts[j]) {
				total += Number(payouts[j].reward)
			}
			// Increase by one to treat non-existent as zero value
			num += 1
		}

		if (total === 0) {
			total = Number(payouts[i].reward)
		}

		// If on last reward and is a zero (current era still processing), use previous reward to
		// prevent misleading dip
		const reward =
			i === payouts.length - 1 && Number(payouts[i].reward) === 0
				? payoutsAverages[i - 1].reward
				: total / num

		payoutsAverages.push({
			reward,
			timestamp: payouts[i].timestamp,
		})
	}

	// Return an array with the expected number of items
	payoutsAverages = payoutsAverages.filter(
		(p) => daysPassed(fromUnixTime(p.timestamp), fromDate) <= days,
	)

	return payoutsAverages
}
