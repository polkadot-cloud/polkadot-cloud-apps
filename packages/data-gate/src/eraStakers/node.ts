// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { useQuery } from '@tanstack/react-query'
import { getNetwork } from 'global-bus'
import type { Exposure } from 'types'
import { useDataGate } from '../provider'

// Shared node snapshots for source adapters and the remaining legacy overview/pool consumers.
// Calling with enabled=false observes no runnable node queries, including during API failures.
export const useNodeEraStakers = (needsExposures = false, enabled = true) => {
	const { node: serviceApi, era, ready: connected } = useDataGate()
	const network = getNetwork()
	const ready = connected && era > 0
	// Validator activity and totals need only overview entries, never nominator pages.
	const {
		data: overviews,
		isLoading: overviewsLoading,
		error: overviewsError,
	} = useQuery({
		queryKey: ['validator-overviews', network, era],
		queryFn: () => serviceApi.query.erasStakersOverviewEntries(era),
		enabled: ready && enabled,
		staleTime: Infinity,
	})

	// Share exposures in the query cache for this network/era; nothing is persisted across reloads.
	const {
		data: exposures,
		isLoading: exposuresLoading,
		status: exposuresStatus,
		error: exposuresError,
	} = useQuery({
		queryKey: ['era-exposures', network, era],
		enabled: ready && enabled && !!overviews && needsExposures,
		staleTime: Infinity,
		queryFn: async ({ signal }): Promise<Exposure[]> => {
			signal.throwIfAborted()
			const entries = overviews ?? []
			const eraKey = String(era)

			// Fetch every validator's exposure pages in parallel.
			return Promise.all(
				entries.map(async ([[, address], overview]) => {
					const pages = await serviceApi.query.erasStakersPagedEntries(
						era,
						address,
					)
					signal.throwIfAborted()

					// Incomplete pages must not be treated as missing nominator backing.
					if (pages.length !== overview.pageCount) {
						throw new Error(`Incomplete exposure pages for ${address}`)
					}
					return {
						keys: [eraKey, address],
						val: {
							own: overview.own.toString(),
							total: overview.total.toString(),
							others: pages.flatMap(([, { others }]) =>
								others.map(({ who, value }) => ({
									who,
									value: value.toString(),
								})),
							),
						},
					}
				}),
			)
		},
	})

	return {
		overviews,
		exposures,
		overviewsLoading,
		exposuresLoading,
		exposuresStatus: overviewsError ? ('error' as const) : exposuresStatus,
		error: overviewsError ?? exposuresError,
	}
}
