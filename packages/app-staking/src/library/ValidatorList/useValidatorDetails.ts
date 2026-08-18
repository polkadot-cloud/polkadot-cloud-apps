// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useApi } from 'hooks/useApi'
import { useErasPerDay } from 'hooks/useErasPerDay'
import { useNetwork } from 'hooks/useNetwork'
import { fetchValidatorDetailsBatch } from 'plugin-staking-api'
import type { ValidatorDetailsBatchData } from 'plugin-staking-api/types'
import { useEffect, useMemo, useState } from 'react'
import type { ValidatorDetailsData } from './types'

// Number of eras included in validator era-point details.
const ERA_POINTS_DEPTH = 30

interface ValidatorDetailsCacheEntry {
	addresses: string[]
	data: ValidatorDetailsBatchData
}

// Merge newly fetched details into an existing scope cache.
const mergeDetails = (
	current: ValidatorDetailsBatchData | undefined,
	next: ValidatorDetailsBatchData,
): ValidatorDetailsBatchData => ({
	validatorAvgRewardRateBatch: [
		...(current?.validatorAvgRewardRateBatch ?? []),
		...next.validatorAvgRewardRateBatch,
	],
	validatorEraPointsBatch: [
		...(current?.validatorEraPointsBatch ?? []),
		...next.validatorEraPointsBatch,
	],
	validatorRetainmentBatch: [
		...(current?.validatorRetainmentBatch ?? []),
		...next.validatorRetainmentBatch,
	],
})

export const useValidatorDetails = (
	addresses: string[],
	enabled: boolean,
): ValidatorDetailsData => {
	const { network } = useNetwork()
	const { erasPerDay } = useErasPerDay()
	const { activeEra } = useApi()

	// Current era index used to scope and fetch validator details.
	const era = activeEra.index

	// Fetched validator details, cached by network and era scope.
	const [detailsByScope, setDetailsByScope] = useState<
		Record<string, ValidatorDetailsCacheEntry>
	>({})

	// Stable signature for the requested validator addresses.
	const addressesKey = JSON.stringify(addresses)

	// Stable address list that changes only when its contents change.
	const stableAddresses = useMemo(() => [...addresses], [addressesKey])

	// Cache key for the current network, era, and reward-rate depth.
	const scopeKey = `${network}:${era}:${erasPerDay}`

	// Cached details for the current scope.
	const scopedDetails = detailsByScope[scopeKey]

	// Addresses already fetched within the current scope.
	const detailedAddresses = useMemo(
		() => new Set(scopedDetails?.addresses ?? []),
		[scopedDetails],
	)

	// Requested addresses that still need details.
	const pendingAddresses = useMemo(
		() => stableAddresses.filter((address) => !detailedAddresses.has(address)),
		[stableAddresses, detailedAddresses],
	)

	// Fetch and merge details for addresses missing from the current scope cache.
	useEffect(() => {
		if (!enabled || era === 0 || pendingAddresses.length === 0) {
			return
		}

		// Whether this request may still update the cache.
		let active = true
		void fetchValidatorDetailsBatch(
			network,
			pendingAddresses,
			era - 1,
			erasPerDay,
			ERA_POINTS_DEPTH,
		).then((data) => {
			if (!active) {
				return
			}
			setDetailsByScope((current) => {
				// Existing details to merge with this response.
				const cached = current[scopeKey]
				return {
					...current,
					[scopeKey]: {
						addresses: [
							...new Set([...(cached?.addresses ?? []), ...pendingAddresses]),
						],
						data: mergeDetails(cached?.data, data),
					},
				}
			})
		})

		return () => {
			active = false
		}
	}, [enabled, era, erasPerDay, network, pendingAddresses, scopeKey])

	// Validator details indexed by address for list consumption.
	const detailsByAddress = useMemo(
		() => ({
			eraPointsByAddress: new Map(
				(scopedDetails?.data.validatorEraPointsBatch ?? []).map(
					(entry) => [entry.validator, entry.points] as const,
				),
			),
			rateByAddress: new Map(
				(scopedDetails?.data.validatorAvgRewardRateBatch ?? []).map(
					(entry) => [entry.validator, entry.rate] as const,
				),
			),
			retainmentByAddress: new Map(
				(scopedDetails?.data.validatorRetainmentBatch ?? []).map(
					(entry) => [entry.validator, entry.result] as const,
				),
			),
		}),
		[scopedDetails],
	)

	// Whether requested details are still being fetched.
	const isLoading = enabled && era > 0 && pendingAddresses.length > 0

	return {
		...detailsByAddress,
		detailedAddresses,
		isLoading,
	}
}
