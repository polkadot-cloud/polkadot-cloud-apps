// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { fetchValidatorAvgRewardRateBatch } from 'plugin-staking-api'
import { useDataGate } from '../provider'
import type { DataGateState, DataPointSource } from '../types'
import { useDataPoint } from '../useDataPoint'
import { fetchNode } from './node'

// Convert the API batch response into the same address-to-rate map as the node source.
const stakingApiSource = (
	prevEra: number,
	validators: string[],
	erasPerDay: number,
	enabled: boolean,
): DataPointSource<Record<string, number>> => ({
	enabled,
	queryFn: async ({ network, signal }) => {
		const data = await fetchValidatorAvgRewardRateBatch(
			network,
			validators,
			prevEra,
			erasPerDay,
			signal,
		)
		return Object.fromEntries(
			data.validatorAvgRewardRateBatch.map(({ validator, rate }) => [
				validator,
				rate,
			]),
		)
	},
})

// Node calculations also require a ready connection; the API source can run without one.
const nodeSource = (
	{ node, ready }: DataGateState,
	prevEra: number,
	validators: string[],
	erasPerDay: number,
	enabled: boolean,
): DataPointSource<Record<string, number>> => ({
	enabled: enabled && ready,
	queryFn: (context) =>
		fetchNode(node, prevEra, validators, erasPerDay, context),
})

// Each validator's annualized reward rate as a percentage of total backing stake, based on the
// previous era's rewards and before validator commission.
export const useValidatorRewardRates = (
	addresses: string[],
	erasPerDay: number,
	enabled = true,
) => {
	const state = useDataGate()
	// Equivalent validator sets share a cache entry regardless of order or duplicate addresses.
	const validators = [...new Set(addresses)].sort()
	const prevEra = state.era - 1
	const requested = enabled && prevEra >= 0 && validators.length > 0

	// Cache the previous era's calculated rates; data gate adds network/source scoping and
	// runs only the selected source.
	const result = useDataPoint({
		key: ['validator-reward-rates', prevEra, validators, erasPerDay],
		node: nodeSource(state, prevEra, validators, erasPerDay, requested),
		stakingApi: stakingApiSource(prevEra, validators, erasPerDay, requested),
	})

	return { ...result, loading: requested && result.loading }
}
