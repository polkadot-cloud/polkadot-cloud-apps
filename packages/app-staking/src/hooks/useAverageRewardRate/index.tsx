// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { planckToUnit } from '@w3ux/utils'
import BigNumber from 'bignumber.js'
import { getStakingChainData } from 'consts/util'
import { useValidators } from 'contexts/Validators/ValidatorEntries'
import { useErasPerDay } from 'hooks/useErasPerDay'
import { useNetwork } from 'hooks/useNetwork'
import { usePlugins } from 'hooks/usePlugins'
import { useStakingMetrics } from 'hooks/useStakingMetrics'
import type { UseAverageRewardRate } from './types'

export const useAverageRewardRate = (): UseAverageRewardRate => {
	const { totalIssuance, lastTotalStake } = useStakingMetrics()
	const { network } = useNetwork()
	const { erasPerDay } = useErasPerDay()
	const { pluginEnabled } = usePlugins()
	const { averageEraValidatorReward, avgRewardRate } = useValidators()

	const { units } = getStakingChainData(network)

	const normalizeStakingApiRate = (rate: number): number => {
		if (!Number.isFinite(rate) || rate <= 0) {
			return 0
		}
		return rate
	}

	const getCalculatedAverageRewardRate = (
		compounded: boolean = false,
	): number => {
		if (
			totalIssuance === 0n ||
			erasPerDay === 0 ||
			averageEraValidatorReward.reward === 0n
		) {
			return 0
		}

		// Total supply as percent
		const totalIssuanceUnit = Number(planckToUnit(totalIssuance, units))
		const lastTotalStakeUnit = Number(planckToUnit(lastTotalStake, units))
		const supplyStaked =
			lastTotalStakeUnit === 0 || totalIssuanceUnit === 0
				? 0
				: lastTotalStakeUnit / totalIssuanceUnit

		// Calculate average daily reward as a percentage of total issuance
		const averageRewardPerDay =
			averageEraValidatorReward.reward * BigInt(erasPerDay)

		const dayRewardRate =
			totalIssuance === 0n
				? 0
				: new BigNumber(averageRewardPerDay)
						.div(new BigNumber(totalIssuance).div(100))
						.toNumber()

		let inflationToStakers = 0
		if (!compounded) {
			// Base rate without compounding
			inflationToStakers = dayRewardRate * 365
		} else {
			// Daily Compound Interest: A = P[(1+r)^t]
			// Where:
			// A = the future value of the investment
			// P = the principal investment amount
			// r = the daily interest rate (decimal)
			// t = the number of days the money is invested for
			// ^ = ... to the power of ...

			const multipilier = new BigNumber(dayRewardRate)
				.dividedBy(100)
				.plus(1)
				.exponentiatedBy(365)

			inflationToStakers = 100 * Number(multipilier.toString()) - 100
		}

		const rate =
			supplyStaked === 0 ? 0 : Number(inflationToStakers) / supplyStaked

		return rate
	}

	// Get average reward rate based on the current staking metrics. Prefer staking API when available,
	// but gracefully fall back to chain-derived metrics if API returns zero/stale data.
	const getAverageRewardRate = (compounded: boolean = false): number => {
		if (pluginEnabled('staking_api')) {
			const normalizedRate = normalizeStakingApiRate(avgRewardRate)
			if (normalizedRate > 0) {
				return normalizedRate
			}
		}
		return getCalculatedAverageRewardRate(compounded)
	}

	const formatRateAsPercent = (rate: number) => {
		return `${new BigNumber(rate).decimalPlaces(2).toFormat()}%`
	}

	return {
		getAverageRewardRate,
		formatRateAsPercent,
	}
}
