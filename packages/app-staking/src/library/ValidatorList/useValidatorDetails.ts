// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useApi } from 'hooks/useApi'
import { useErasPerDay } from 'hooks/useErasPerDay'
import { useNetwork } from 'hooks/useNetwork'
import { fetchValidatorDetailsBatch } from 'plugin-staking-api'
import type { ValidatorDetailsBatchData } from 'plugin-staking-api/types'
import { useEffect, useMemo, useState } from 'react'
import type { ValidatorDetailsData } from './types'

interface ValidatorDetailsCacheEntry {
	addresses: string[]
	data: ValidatorDetailsBatchData
	scopeKey: string
}

export const useValidatorDetails = (
	addresses: string[],
	enabled: boolean,
): ValidatorDetailsData => {
	const { network } = useNetwork()
	const { erasPerDay } = useErasPerDay()
	const { activeEra } = useApi()
	const [detailsByKey, setDetailsByKey] = useState<
		Record<string, ValidatorDetailsCacheEntry>
	>({})
	const addressesKey = JSON.stringify(addresses)
	const stableAddresses = useMemo(() => [...addresses], [addressesKey])
	const scopeKey = useMemo(
		() =>
			JSON.stringify({
				network,
				era: activeEra.index,
				rewardRateDepth: erasPerDay,
			}),
		[network, activeEra.index, erasPerDay],
	)
	const scopedDetails = useMemo(
		() =>
			Object.values(detailsByKey).filter(
				(entry) => entry.scopeKey === scopeKey,
			),
		[detailsByKey, scopeKey],
	)
	const detailedAddresses = useMemo(
		() => new Set(scopedDetails.flatMap((entry) => entry.addresses)),
		[scopedDetails],
	)
	const pendingAddresses = useMemo(
		() => stableAddresses.filter((address) => !detailedAddresses.has(address)),
		[stableAddresses, detailedAddresses],
	)
	const detailsKey = useMemo(
		() => JSON.stringify({ scopeKey, validators: pendingAddresses }),
		[scopeKey, pendingAddresses],
	)

	useEffect(() => {
		if (
			!enabled ||
			activeEra.index === 0 ||
			pendingAddresses.length === 0 ||
			detailsByKey[detailsKey] !== undefined
		) {
			return
		}

		let active = true
		void fetchValidatorDetailsBatch(
			network,
			pendingAddresses,
			Math.max(activeEra.index - 1, 0),
			erasPerDay,
			30,
		).then((data) => {
			if (!active) {
				return
			}
			setDetailsByKey((current) => ({
				...current,
				[detailsKey]: {
					addresses: pendingAddresses,
					data,
					scopeKey,
				},
			}))
		})

		return () => {
			active = false
		}
	}, [
		activeEra.index,
		detailsByKey,
		detailsKey,
		enabled,
		erasPerDay,
		network,
		pendingAddresses,
		scopeKey,
	])

	const eraPointsByAddress = useMemo(
		() =>
			new Map(
				scopedDetails.flatMap(({ data }) =>
					data.validatorEraPointsBatch.map(
						(entry) => [entry.validator, entry.points] as const,
					),
				),
			),
		[scopedDetails],
	)
	const rateByAddress = useMemo(
		() =>
			new Map(
				scopedDetails.flatMap(({ data }) =>
					data.validatorAvgRewardRateBatch.map(
						(entry) => [entry.validator, entry.rate] as const,
					),
				),
			),
		[scopedDetails],
	)
	const retainmentByAddress = useMemo(
		() =>
			new Map(
				scopedDetails.flatMap(({ data }) =>
					data.validatorRetainmentBatch.map(
						(entry) => [entry.validator, entry.result] as const,
					),
				),
			),
		[scopedDetails],
	)

	return {
		detailedAddresses,
		eraPointsByAddress,
		isLoading: enabled && activeEra.index > 0 && pendingAddresses.length > 0,
		rateByAddress,
		retainmentByAddress,
	}
}
