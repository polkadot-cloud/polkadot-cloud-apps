// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createSingletonStore } from 'hooks'
import {
	fetchGetValidatorWarnings,
	fetchValidatorDetailsBatch,
} from 'plugin-staking-api'
import type {
	ValidatorRetainmentResult,
	ValidatorWarnings,
} from 'plugin-staking-api/types'

export interface WarningRequest {
	network: string
	era: number
	erasPerDay: number
	addresses: string[]
}

interface WarningResult {
	status: 'loading' | 'ready' | 'error'
	warnings?: ValidatorWarnings
	retainmentByAddress?: ReadonlyMap<string, ValidatorRetainmentResult | null>
}

export const nominationWarningsStore = createSingletonStore<
	Record<string, WarningResult>
>({})

export const warningRequestKey = ({
	network,
	era,
	erasPerDay,
	addresses,
}: WarningRequest) =>
	JSON.stringify([network, era, erasPerDay, [...new Set(addresses)].sort()])

export const fetchNominationWarnings = async (request: WarningRequest) => {
	const { network, era, erasPerDay } = request
	const addresses = [...new Set(request.addresses)].sort()
	if (addresses.length === 0) {
		return
	}
	const key = warningRequestKey(request)
	const cached = nominationWarningsStore.getSnapshot()[key]
	if (cached && cached.status !== 'error') {
		return
	}
	nominationWarningsStore.patchSnapshot({ [key]: { status: 'loading' } })

	try {
		const [warnings, details] = await Promise.all([
			fetchGetValidatorWarnings(network, addresses, { throwOnError: true }),
			era > 0
				? fetchValidatorDetailsBatch(
						network,
						addresses,
						era - 1,
						erasPerDay,
						30,
						{ throwOnError: true },
					)
				: Promise.resolve({ validatorRetainmentBatch: [] }),
		])
		nominationWarningsStore.patchSnapshot({
			[key]: {
				status: 'ready',
				warnings,
				retainmentByAddress: new Map(
					details.validatorRetainmentBatch.map(({ validator, result }) => [
						validator,
						result,
					]),
				),
			},
		})
	} catch {
		nominationWarningsStore.patchSnapshot({ [key]: { status: 'error' } })
	}
}
