// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { MaximumPayoutDays } from 'consts'
import type { Locale } from 'date-fns'
import { format, fromUnixTime, getUnixTime } from 'date-fns'
import type { RewardResult, RewardResults } from 'plugin-staking-api/types'
import { addUTCDays, daysPassed, startOfUTCDay, subUTCDays } from 'utils'
import type { RewardRecord } from '../types'

/**
 * Normalize payout timestamps to start of day
 */
export const normalizePayouts = (payouts: RewardResults): RewardResults =>
	payouts.map((p) => ({
		...p,
		timestamp: getUnixTime(startOfUTCDay(fromUnixTime(p.timestamp))),
	}))

/**
 * Fill missing days from the earliest payout day to maxDays
 * Takes the last (earliest) payout and fills missing days from that payout day to maxDays
 */
export const prefillMissingDays = (
	payouts: RewardRecord[],
	fromDate: Date,
	maxDays: number,
): RewardResults => {
	const newPayouts = []
	const payoutStartDay = subUTCDays(startOfUTCDay(fromDate), maxDays)
	const payoutEndDay = !payouts.length
		? startOfUTCDay(fromDate)
		: startOfUTCDay(fromUnixTime(payouts[payouts.length - 1].timestamp))

	const daysToPreFill = daysPassed(payoutStartDay, payoutEndDay)

	if (daysToPreFill > 0) {
		for (let i = 1; i < daysToPreFill; i++) {
			newPayouts.push({
				who: '',
				poolId: 0,
				reward: '0',
				timestamp: getUnixTime(subUTCDays(payoutEndDay, i)),
			})
		}
	}
	return newPayouts
}

/**
 * Fill missing days from the current day to the last payout
 * Takes the first payout (most recent) and fills missing days from current day
 */
export const postFillMissingDays = (
	payouts: RewardResults,
	fromDate: Date,
	maxDays: number,
): RewardResults => {
	const newPayouts = []
	const payoutsEndDay = startOfUTCDay(fromUnixTime(payouts[0].timestamp))
	const daysSinceLast = Math.min(
		daysPassed(payoutsEndDay, startOfUTCDay(fromDate)),
		maxDays,
	)

	for (let i = daysSinceLast; i > 0; i--) {
		newPayouts.push({
			who: '',
			poolId: 0,
			reward: '0',
			timestamp: getUnixTime(addUTCDays(payoutsEndDay, i)),
		})
	}
	return newPayouts
}

/**
 * Fill gap days within payouts with zero rewards
 */
export const fillGapDays = (payouts: RewardRecord[], fromDate: Date) => {
	const finalPayouts: RewardRecord[] = []
	let curDay = fromDate

	for (const p of payouts) {
		const thisDay = fromUnixTime(p.timestamp)
		const gapDays = Math.max(0, daysPassed(thisDay, curDay) - 1)

		if (gapDays > 0) {
			for (let j = 1; j <= gapDays; j++) {
				finalPayouts.push({
					reward: '0',
					timestamp: getUnixTime(subUTCDays(curDay, j)),
				})
			}
		}

		finalPayouts.push(p)
		curDay = thisDay
	}
	return finalPayouts
}

/**
 * Filter payouts to remove those older than MaximumPayoutDays and sort by timestamp
 */
export const filterAndSortRewards = (payouts: RewardResults) => {
	const list = payouts
		.filter((p) => Number(p.reward) > 0)
		.sort((a, b) => b.timestamp - a.timestamp)

	const fromTimestamp = getUnixTime(subUTCDays(new Date(), MaximumPayoutDays))
	return list.filter(({ timestamp }) => timestamp >= fromTimestamp)
}

/**
 * Calculate the earliest date of a payout list
 */
export const getPayoutsFromDate = (payouts: RewardResults, locale: Locale) => {
	if (!payouts.length) {
		return undefined
	}
	const filtered = filterAndSortRewards(payouts)
	if (!filtered.length) {
		return undefined
	}
	return format(
		fromUnixTime(filtered[filtered.length - 1].timestamp),
		'do MMM',
		{ locale },
	)
}

/**
 * Calculate the latest date of a payout list
 */
export const getPayoutsToDate = (payouts: RewardResults, locale: Locale) => {
	if (!payouts.length) {
		return undefined
	}
	const filtered = filterAndSortRewards(payouts || [])
	if (!filtered.length) {
		return undefined
	}
	return format(fromUnixTime(filtered[0].timestamp), 'do MMM', { locale })
}

/**
 * Get payouts within a specific time range for average calculations
 */
export const getPayoutsInTimeRange = (
	payouts: RewardResults,
	fromDate: Date,
	days: number,
	avgDays: number,
) =>
	payouts.filter(
		(p: RewardResult) =>
			daysPassed(fromUnixTime(p.timestamp), fromDate) > days &&
			daysPassed(fromUnixTime(p.timestamp), fromDate) <= days + avgDays,
	)
