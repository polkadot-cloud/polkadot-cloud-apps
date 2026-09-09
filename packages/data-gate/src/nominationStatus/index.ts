// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { skipToken, useQuery } from '@tanstack/react-query'
import type { MaybeAddress } from 'types'
import { type DataGateConfig, useDataGate } from '../provider'
import { dataPointOptions } from '../query'
import { fetchNodeStatus } from './node'
import { fetchStakingApiStatus } from './stakingApi'

export const nominationStatusOptions = (
	{ node, ready, era }: DataGateConfig,
	who: MaybeAddress,
) =>
	dataPointOptions({
		queryKey: ['nomination-status', era, who],
		// Node requests need a connection and an active era.
		node: {
			enabled: ready && era > 0,
			queryFn: who
				? ({ signal }) => fetchNodeStatus(node.query, era, who, signal)
				: skipToken,
		},
		// The API can start as soon as an address is available.
		stakingApi: {
			queryFn: who
				? ({ network, signal }) => fetchStakingApiStatus(network, who, signal)
				: skipToken,
		},
	})

export const useNominationStatus = (who: MaybeAddress) => {
	// Apply the provider's configuration to this stash's query.
	const config = useDataGate()
	const options = nominationStatusOptions(config, who)
	const { data, isPending, error } = useQuery(options)

	// Keep unresolved data distinct from the staking status 'waiting'.
	return {
		status: options.enabled ? data : undefined,
		loading: !!who && (!options.enabled || isPending),
		error,
	}
}
