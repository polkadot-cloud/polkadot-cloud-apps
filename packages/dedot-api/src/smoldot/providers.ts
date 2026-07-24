// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { SmoldotProvider } from 'dedot'
import type { Client } from 'dedot/smoldot'
import { startWithWorker } from 'dedot/smoldot/with-worker'
import type { Network, SystemChain } from 'types'
import type { RelayChainSetup } from './types'

// Instantiate smoldot from worker
const initSmWorker = () => {
	const client = startWithWorker(
		new Worker(new URL('dedot/smoldot/worker', import.meta.url), {
			type: 'module',
		}),
	)
	return client
}

// Instantiate a new relay chain smoldot provider and return the setup for reuse
export const newRelayChainSmProvider = async (
	networkData: Network,
): Promise<RelayChainSetup> => {
	const client = initSmWorker()
	const { chainSpec } = await networkData.endpoints.getLightClient()
	const relayChain = await client.addChain({ chainSpec })
	return {
		provider: new SmoldotProvider(relayChain),
		client,
		relayChain,
	}
}

// Instantiate a new system chain smoldot provider using an existing relay chain
export const newSystemChainSmProvider = async (
	client: Client,
	relayChain: Awaited<ReturnType<Client['addChain']>>,
	systemChainData: SystemChain,
) => {
	const { chainSpec } = await systemChainData.endpoints.getLightClient()

	const chain = await client.addChain({
		chainSpec,
		potentialRelayChains: [relayChain],
	})
	return new SmoldotProvider(chain)
}
