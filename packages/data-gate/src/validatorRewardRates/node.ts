// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getStakingChainData } from 'consts/util/chains'
import { calculateValidatorEraRewardRate } from 'utils'
import type { DataGateState, DataSourceContext } from '../types'

// Return annualized reward percentages before commission, using the previous era's data.
export const fetchNode = async (
	node: DataGateState['node'],
	prevEra: number,
	validators: string[],
	erasPerDay: number,
	{ network, signal }: DataSourceContext,
): Promise<Record<string, number>> => {
	const { units, ss58 } = getStakingChainData(network)

	// Fetch the era's reward points and payout once for the batch, alongside each validator's total
	// stake. Overviews supply that total without downloading individual exposure pages.
	const [points, payout, overviews] = await Promise.all([
		node.query.erasRewardPoints(prevEra),
		node.query.erasValidatorReward(prevEra),
		Promise.all(
			validators.map((address) =>
				node.query.erasStakersOverview(prevEra, address),
			),
		),
	])
	signal.throwIfAborted()

	// Encode reward-point accounts for this network so they match the requested validator addresses.
	const byValidator = new Map(
		points?.individual.map(([who, value]) => [who.address(ss58), value]),
	)
	return Object.fromEntries(
		validators.map((address, index) => {
			// Promise.all preserves input order, so each overview matches the validator at this index.
			const totalStake = overviews[index]?.total ?? 0n

			// Allocate the era payout in proportion to this validator's reward points. Keep amounts in
			// bigint planck to avoid floating-point precision loss; division rounds down.
			const reward =
				points?.total && payout
					? (payout * BigInt(byValidator.get(address) ?? 0)) /
						BigInt(points.total)
					: 0n

			// Annualize the reward using eras per day and express it as a percentage of total stake.
			// Missing stake or reward inputs yield zero rather than an undefined rate.
			return [
				address,
				totalStake > 0n && reward > 0n
					? calculateValidatorEraRewardRate(
							erasPerDay,
							totalStake,
							reward,
							units,
						)
					: 0,
			]
		}),
	)
}
