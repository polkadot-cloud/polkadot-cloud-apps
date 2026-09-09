// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { skipToken, useQuery } from '@tanstack/react-query'
import { fetchGetNominationStatus } from 'plugin-staking-api'
import type { MaybeAddress, NominationStatus } from 'types'
import { useDataGate } from '../provider'
import { dataPointOptions } from '../query'
import type { DataGateState, DataPointSource } from '../types'
import { fetchNode } from './node'

// Node requests need an address, a connection and an active era.
const nodeSource = (
	{ node, ready, era }: DataGateState,
	who: MaybeAddress,
): DataPointSource<NominationStatus> => ({
	enabled: ready && era > 0,
	queryFn: who ? ({ signal }) => fetchNode(node, era, who, signal) : skipToken,
})

// The API can start as soon as an address is available.
const stakingApiSource = (
	who: MaybeAddress,
): DataPointSource<NominationStatus> => ({
	queryFn: who
		? ({ network, signal }) => fetchGetNominationStatus(network, who, signal)
		: skipToken,
})

export const nominationStatusOptions = (
	state: DataGateState,
	who: MaybeAddress,
) =>
	dataPointOptions({
		key: ['nomination-status', state.era, who],
		node: nodeSource(state, who),
		stakingApi: stakingApiSource(who),
	})

export const useNominationStatus = (who: MaybeAddress) => {
	// Use the provider's current bus state for this stash's query.
	const state = useDataGate()
	const options = nominationStatusOptions(state, who)
	const { data, isPending, error } = useQuery(options)

	// Keep unresolved data distinct from the staking status 'waiting'.
	return {
		status: options.enabled ? data : undefined,
		loading: !!who && (!options.enabled || isPending),
		error,
	}
}
