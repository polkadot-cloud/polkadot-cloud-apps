// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useQueryClient } from '@tanstack/react-query'
import { getNetwork, pluginEnabled } from 'global-bus'
import { fetchEraValidatorOverviews } from 'plugin-staking-api'
import type { ValidatorOverview, ValidatorOverviews } from 'types'
import { requestOptions } from '../eraStakers/requestOptions'
import { useDataGate } from '../provider'
import { useDataPoint } from '../useDataPoint'
import { nodeValidatorOverviewsOptions } from './node'

const EMPTY_OVERVIEWS: ValidatorOverviews = new Map()

// Active validator membership and stake totals, without individual nominator exposure pages.
export const useValidatorOverviews = (
	addresses: string[] = [],
	enabled = true,
) => {
	const client = useQueryClient()
	const { node, era, ready } = useDataGate()
	const network = getNetwork()
	const targets = [...new Set(addresses)].sort()
	const noApiTargets = pluginEnabled('staking_api') && targets.length === 0
	const result = useDataPoint<ValidatorOverviews>({
		key: ['validator-overviews', era, targets],
		node: {
			enabled: enabled && ready && era > 0,
			queryFn: async ({ signal }) => {
				const overviews = await client.fetchQuery(
					nodeValidatorOverviewsOptions(node, network, era),
				)
				signal.throwIfAborted()
				return new Map(
					overviews.map(([[, address], overview]) => [address, overview]),
				)
			},
		},
		stakingApi: {
			enabled: enabled && targets.length > 0 && era > 0,
			// The indexer can publish more records within the same era.
			refreshInterval: 60_000,
			queryFn: async ({ network, signal }) => {
				// Bound each request and combine only the addresses mounted consumers need.
				const entries = new Map<string, ValidatorOverview>()
				for (let offset = 0; offset < targets.length; offset += 100) {
					signal.throwIfAborted()
					const batch = targets.slice(offset, offset + 100)
					const { eraValidatorOverviews } = await fetchEraValidatorOverviews(
						network,
						era,
						batch,
						requestOptions(signal),
					)
					signal.throwIfAborted()
					const remaining = new Set(batch)
					for (const {
						validator,
						own,
						total,
						nominatorCount,
						pageCount,
					} of eraValidatorOverviews) {
						// GraphQL guarantees field types. Check values and reject duplicate or unrequested addresses.
						if (
							!remaining.delete(validator) ||
							!/^\d+$/.test(own) ||
							!/^\d+$/.test(total) ||
							nominatorCount < 0 ||
							pageCount < 0
						) {
							throw new Error(
								'Staking API returned invalid validator overviews',
							)
						}
						entries.set(validator, {
							own: BigInt(own),
							total: BigInt(total),
							nominatorCount,
							pageCount,
						})
					}
				}
				return entries
			},
		},
	})
	return {
		...result,
		data: enabled && noApiTargets ? EMPTY_OVERVIEWS : result.data,
		loading: enabled && !noApiTargets && result.loading,
	}
}
