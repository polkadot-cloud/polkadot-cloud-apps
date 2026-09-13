// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query'
import { getNetwork } from 'global-bus'
import type { ErasStakersPagedEntries, Exposure } from 'types'
import { useDataGate } from '../provider'
import { nodeValidatorOverviewsOptions } from '../validatorOverviews/node'

// Shared node snapshots for source adapters and the remaining legacy overview/pool consumers.
// Calling with enabled=false observes no runnable node queries, including during API failures.
export const useNodeEraStakers = (needsExposures = false, enabled = true) => {
	const client = useQueryClient()
	const { node: serviceApi, era, ready: connected } = useDataGate()
	const network = getNetwork()
	const ready = connected && era > 0
	const overviewOptions = queryOptions({
		...nodeValidatorOverviewsOptions(serviceApi, network, era),
		enabled: ready && enabled,
	})
	// Validator activity and totals need only overview entries, never nominator pages.
	const {
		data: overviews,
		isLoading: overviewsLoading,
		error: overviewsError,
	} = useQuery(overviewOptions)

	// Share exposures in the query cache for this network/era; nothing is persisted across reloads.
	const exposureOptions = queryOptions({
		queryKey: ['era-exposures', network, era],
		enabled: ready && enabled && !!overviews && needsExposures,
		staleTime: Infinity,
		queryFn: async ({ signal }): Promise<Exposure[]> => {
			signal.throwIfAborted()
			// Resolve prerequisites from the shared cache at execution time, including on retry.
			const entries = await client.fetchQuery(overviewOptions)
			signal.throwIfAborted()
			const eraKey = String(era)
			if (!entries.length) return []

			// One era-wide scan avoids queuing hundreds of chainHead operations. Every pool tab and data
			// point reuses this same complete snapshot from the query cache.
			const allPages = await serviceApi.query.erasStakersPagedEntries(era)
			signal.throwIfAborted()
			const pagesByValidator = new Map<string, ErasStakersPagedEntries>()
			for (const page of allPages) {
				const address = page[0][1]
				const pages = pagesByValidator.get(address) ?? []
				pages.push(page)
				pagesByValidator.set(address, pages)
			}

			return entries.map(([[, address], overview]) => {
				const pages = pagesByValidator.get(address) ?? []
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
			})
		},
	})
	const {
		data: exposures,
		isLoading: exposuresLoading,
		status: exposuresStatus,
		error: exposuresError,
	} = useQuery(exposureOptions)

	return {
		overviews,
		exposures,
		overviewsLoading,
		exposuresLoading,
		exposuresStatus: overviewsError ? ('error' as const) : exposuresStatus,
		error: overviewsError ?? exposuresError,
		// Successful era snapshots stay cached; failed or pending requests retry/share their I/O.
		fetchExposures: () => client.fetchQuery(exposureOptions),
	}
}
