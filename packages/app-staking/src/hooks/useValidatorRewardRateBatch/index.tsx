// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getStakingChainData } from 'consts/util/chains'
import { useEraStakers } from 'contexts/EraStakers'
import { useApi } from 'hooks/useApi'
import { useErasPerDay } from 'hooks/useErasPerDay'
import { useNetwork } from 'hooks/useNetwork'
import { usePlugins } from 'hooks/usePlugins'
import { fetchValidatorAvgRewardRateBatch } from 'plugin-staking-api'
import { useEffect, useState } from 'react'
import {
	calculateValidatorEraRewardRate,
	calculateValidatorEraTotalReward,
} from 'utils'

// Calculates validator reward rates in a batch. If Staking API is enabled, rates are fetched from
// it, otherwise they are calculated from the previous era's data
export const useValidatorRewardRateBatch = (
	addresses: string[],
	pageKey: string,
) => {
	const { network } = useNetwork()
	const { erasPerDay } = useErasPerDay()
	const { pluginEnabled } = usePlugins()
	const { prevEraReward } = useEraStakers()
	const { activeEra, serviceApi, isReady } = useApi()

	const { units } = getStakingChainData(network)
	const isStakingApiEnabled = pluginEnabled('staking_api')

	// Store average reward rates, keyed by address
	const [rates, setRates] = useState<Record<string, Record<string, number>>>({})

	// Fetch average reward rate from previous era
	const getPrevEraAvgRewardRates = async (key: string) => {
		if (
			!isReady ||
			!prevEraReward?.payout ||
			!prevEraReward.points?.total ||
			activeEra.index === 0
		) {
			return
		}
		const prevEra = activeEra.index - 1

		// Fetch all overviews data in parallel
		const stakersOverviewPromises = addresses.map((address) =>
			serviceApi.query.erasStakersOverview(prevEra, address),
		)
		const stakersOverviewResults = await Promise.all(stakersOverviewPromises)

		// Calculate total rewards in parallel
		const totalRewardPromises = addresses.map((address, i) => {
			const totalStake = stakersOverviewResults[i]?.total || 0n
			if (totalStake > 0n) {
				return calculateValidatorEraTotalReward(
					prevEra,
					address,
					serviceApi,
					prevEraReward.points,
				)
			}
			return Promise.resolve(0n)
		})
		const totalRewardResults = await Promise.all(totalRewardPromises)

		// Calculate rates
		const newRates: Record<string, number> = {}
		for (let i = 0; i < addresses.length; i++) {
			const address = addresses[i]
			const totalStake = stakersOverviewResults[i]?.total || 0n
			const totalReward = totalRewardResults[i]

			let rate = 0
			if (totalStake > 0n && totalReward > 0n) {
				rate = calculateValidatorEraRewardRate(
					erasPerDay,
					totalStake,
					totalReward,
					units,
				)
			}
			newRates[address] = rate
		}
		setRates((prevRates) => ({ ...prevRates, [key]: newRates }))
	}

	// Fetch average reward rates from staking api
	const getAvgRewardRates = async (key: string) => {
		if (activeEra.index === 0) {
			return
		}
		const results = await fetchValidatorAvgRewardRateBatch(
			network,
			addresses,
			Math.max(activeEra.index - 1, 0),
			erasPerDay,
		)

		// Update rates if key still matches current page key
		if (key === pageKey) {
			const newRates: Record<string, number> = {}
			for (const { validator, rate } of results.validatorAvgRewardRateBatch) {
				newRates[validator] = rate
			}
			setRates((prevRates) => ({ ...prevRates, [key]: newRates }))
		}
	}

	// Fetch average reward rates from staking api when enabled
	useEffect(() => {
		if (isStakingApiEnabled) {
			getAvgRewardRates(pageKey)
		}
	}, [pageKey, isStakingApiEnabled, activeEra.index])

	// Fetch average reward rates from previous era when staking api is disabled
	useEffect(() => {
		if (!isStakingApiEnabled) {
			getPrevEraAvgRewardRates(pageKey)
		}
	}, [
		isReady,
		pageKey,
		isStakingApiEnabled,
		prevEraReward?.points?.total,
		activeEra.index,
	])

	return {
		rates,
	}
}
