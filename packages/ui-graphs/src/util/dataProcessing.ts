// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BigNumber from 'bignumber.js'
import { MaximumPayoutDays } from 'consts'
import { fromUnixTime, getUnixTime } from 'date-fns'
import type {
	NominatorReward,
	PoolReward,
	RewardResults,
} from 'plugin-staking-api/types'
import { daysPassed, planckToUnitBn, startOfUTCDay, subUTCDays } from 'utils'
import type {
	DailyPayoutConfig,
	PayoutDayCursor,
	ProcessPayoutsConfig,
	RewardRecord,
} from '../types'
import {
	fillGapDays,
	getPayoutsInTimeRange,
	normalizePayouts,
	postFillMissingDays,
	prefillMissingDays,
} from './dateUtils'

/**
 * Internal implementation of daily payout calculation
 */
const calculateDailyPayoutsInternal = (config: DailyPayoutConfig) => {
	const { payouts, fromDate, maxDays, units } = config
	let dailyPayouts: RewardRecord[] = []

	// Remove days that are beyond end day limit
	const filteredPayouts = payouts.filter(
		(p) => daysPassed(fromUnixTime(p.timestamp), fromDate) <= maxDays,
	)

	// Return now if no payouts
	if (!filteredPayouts.length) {
		return filteredPayouts
	}

	// Post-fill any missing days. [current day -> last payout]
	dailyPayouts = postFillMissingDays(filteredPayouts, fromDate, maxDays)

	// Start iterating payouts, most recent first
	let p = 0
	let curDay: Date = fromDate
	let curPayout: PayoutDayCursor = { reward: new BigNumber(0) }

	for (const payout of filteredPayouts) {
		p++

		// Extract day from current payout
		const thisDay = startOfUTCDay(fromUnixTime(payout.timestamp))

		// Initialize current day if first payout
		if (p === 1) {
			curDay = thisDay
		}

		// Handle surpassed maximum days
		if (daysPassed(thisDay, fromDate) >= maxDays) {
			dailyPayouts.push({
				reward: planckToUnitBn(curPayout.reward, units).toString(),
				timestamp: getUnixTime(curDay),
			})
			break
		}

		// get day difference between cursor and current payout
		const daysDiff = daysPassed(thisDay, curDay)

		// Handle new day
		if (daysDiff > 0) {
			// Add current payout cursor to dailyPayouts
			dailyPayouts.push({
				reward: planckToUnitBn(curPayout.reward, units).toString(),
				timestamp: getUnixTime(curDay),
			})

			// Update day cursor to the new day
			curDay = thisDay
			// Reset current payout cursor for the new day
			curPayout = { reward: new BigNumber(payout.reward) }
		} else {
			// in same day. Add payout reward to current payout cursor
			curPayout.reward = curPayout.reward.plus(payout.reward)
		}

		// If only 1 payout exists, or at the last unresolved payout, exit here
		if (
			filteredPayouts.length === 1 ||
			(p === filteredPayouts.length && !curPayout.reward.isZero())
		) {
			dailyPayouts.push({
				reward: planckToUnitBn(curPayout.reward, units).toString(),
				timestamp: getUnixTime(curDay),
			})
			break
		}
	}

	// Return payout rewards as plain numbers
	return dailyPayouts.map((payout) => ({
		reward: payout.reward.toString(),
		timestamp: payout.timestamp,
	}))
}

/**
 * Calculate daily payouts by aggregating rewards within each day
 * Maintains backward compatibility with the original function signature
 */
export const calculateDailyPayouts = (
	payouts: RewardResults,
	fromDate: Date,
	maxDays: number,
	units: number,
	subject: 'pools' | 'nominate',
) =>
	calculateDailyPayoutsInternal({
		payouts,
		fromDate,
		maxDays,
		units,
		subject,
	})

/**
 * Calculate daily payouts using a configuration object (alternative API)
 */
export const calculateDailyPayoutsWithConfig = (config: DailyPayoutConfig) =>
	calculateDailyPayoutsInternal(config)

/**
 * Internal implementation of process payouts
 */
const processPayoutsInternal = (config: ProcessPayoutsConfig) => {
	const { payouts, fromDate, days, units, subject } = config

	// Normalize payout timestamps
	const normalised = normalizePayouts(payouts)

	// Calculate payouts per day from the current day
	let processedPayouts = calculateDailyPayouts(
		normalised,
		fromDate,
		days,
		units,
		subject,
	)

	// Ensure payouts don't go beyond end of current day
	processedPayouts = processedPayouts.filter(
		({ timestamp }) => timestamp < getUnixTime(fromDate),
	)

	// Pre-fill payouts if max days have not been reached
	processedPayouts = processedPayouts.concat(
		prefillMissingDays(processedPayouts, fromDate, days),
	)

	// Fill in gap days between payouts with zero values
	processedPayouts = fillGapDays(processedPayouts, fromDate)

	// Reverse payouts: most recent last
	processedPayouts = processedPayouts.reverse()

	// Calculate averages using normalized payouts for the 10-day average prior to the start
	const avgDays = 10
	const preNormalised = getPayoutsInTimeRange(
		normalised,
		fromDate,
		days,
		avgDays,
	)
	const averageFromDate = subUTCDays(fromDate, MaximumPayoutDays)

	let averages = calculateDailyPayouts(
		preNormalised,
		averageFromDate,
		avgDays,
		units,
		subject,
	)

	// Ensure averages don't go beyond end of current day
	averages = averages.filter(
		({ timestamp }) => timestamp < getUnixTime(fromDate),
	)

	// Prefill payouts if we are missing the earlier dates
	averages = averages.concat(
		prefillMissingDays(averages, averageFromDate, avgDays),
	)

	// Fill in gap days between payouts with zero values
	averages = fillGapDays(averages, averageFromDate)

	// Reverse payouts: most recent last
	averages = averages.reverse()

	return { p: processedPayouts, a: averages }
}

/**
 * Process payouts through the complete transformation pipeline
 * Maintains backward compatibility with the original function signature
 */
export const processPayouts = (
	payouts: RewardResults,
	fromDate: Date,
	days: number,
	units: number,
	subject: 'pools' | 'nominate',
) =>
	processPayoutsInternal({
		payouts,
		fromDate,
		days,
		units,
		subject,
	})

/**
 * Process payouts using a configuration object (alternative API)
 */
export const processPayoutsWithConfig = (config: ProcessPayoutsConfig) =>
	processPayoutsInternal(config)

/**
 * Combine payouts and pool claims into unified daily records
 */
export const combineRewards = (
	payouts: RewardRecord[],
	poolClaims: RewardRecord[],
) => {
	// Check if actual payouts exist
	const poolClaimExists = poolClaims.find((p) => Number(p.reward) > 0)
	const payoutExists = payouts.find((p) => Number(p.reward) > 0)

	// If no pool claims exist but payouts do, return payouts
	if (
		(!poolClaimExists && payoutExists) ||
		(!payoutExists && !poolClaimExists)
	) {
		return payouts.map((p) => ({
			reward: p.reward,
			timestamp: p.timestamp,
		}))
	}

	// If no payouts exist but pool claims do, return pool claims
	if (!payoutExists && poolClaimExists) {
		return poolClaims.map((p) => ({
			reward: p.reward,
			timestamp: p.timestamp,
		}))
	}

	// Both payouts and pool claims exist - combine them
	let payoutDays: number[] = []

	// Collect all unique days from both pool claims and payouts
	poolClaims.forEach((p) => {
		const dayStart = getUnixTime(startOfUTCDay(fromUnixTime(p.timestamp)))
		if (!payoutDays.includes(dayStart)) {
			payoutDays.push(dayStart)
		}
	})

	payouts.forEach((p) => {
		const dayStart = getUnixTime(startOfUTCDay(fromUnixTime(p.timestamp)))
		if (!payoutDays.includes(dayStart)) {
			payoutDays.push(dayStart)
		}
	})

	// Sort payoutDays by timestamp
	payoutDays = payoutDays.sort((a, b) => a - b)

	// Combine rewards for each day
	const rewards: RewardRecord[] = []

	payoutDays.forEach((d) => {
		let reward = 0

		// Check payouts exist on this day (compare UTC-normalised timestamps)
		const payoutsThisDay = payouts.filter(
			(p) => getUnixTime(startOfUTCDay(fromUnixTime(p.timestamp))) === d,
		)

		// Check pool claims exist on this day
		const poolClaimsThisDay = poolClaims.filter(
			(p) => getUnixTime(startOfUTCDay(fromUnixTime(p.timestamp))) === d,
		)

		// Add rewards
		if (payoutsThisDay.concat(poolClaimsThisDay).length) {
			for (const payout of payoutsThisDay) {
				reward += Number(payout.reward)
			}
		}

		rewards.push({
			reward: reward.toString(),
			timestamp: d,
		})
	})

	return rewards
}

/**
 * Get the most recent reward from pool claims and nominator payouts
 */
export const getLatestReward = (
	payouts: NominatorReward[],
	poolClaims: PoolReward[],
) => {
	// Get most recent payout
	const payoutExists =
		payouts.find((p) => new BigNumber(p.reward).isGreaterThan(0)) ?? null
	const poolClaimExists =
		poolClaims.find((p) => new BigNumber(p.reward).isGreaterThan(0)) ?? null

	// Calculate which payout was most recent
	let lastReward = null
	if (!payoutExists || !poolClaimExists) {
		if (payoutExists) {
			lastReward = payoutExists
		}
		if (poolClaimExists) {
			lastReward = poolClaimExists
		}
	} else {
		// Both payoutExists and poolClaimExists are present
		lastReward =
			payoutExists.timestamp > poolClaimExists.timestamp
				? payoutExists
				: poolClaimExists
	}
	return lastReward
}
