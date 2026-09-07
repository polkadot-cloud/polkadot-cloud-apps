// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useValidatorDetails as useDetails } from 'data-gate/react'
import { useMemo } from 'react'
import type { ValidatorDetailsData } from './types'

export const useValidatorDetails = (
	addresses: string[],
	enabled: boolean,
): ValidatorDetailsData => {
	const result = useDetails(addresses, enabled)
	return useMemo(
		() => ({
			detailedAddresses: new Set(result.loading ? [] : addresses),
			eraPointsByAddress: new Map(
				(result.data?.validatorEraPointsBatch ?? []).map((entry) => [
					entry.validator,
					entry.points,
				]),
			),
			rateByAddress: new Map(
				(result.data?.validatorAvgRewardRateBatch ?? []).map((entry) => [
					entry.validator,
					entry.rate,
				]),
			),
			retainmentByAddress: new Map(
				(result.data?.validatorRetainmentBatch ?? []).map((entry) => [
					entry.validator,
					entry.result,
				]),
			),
			isLoading: result.loading,
		}),
		[result.data, result.loading, JSON.stringify(addresses)],
	)
}
