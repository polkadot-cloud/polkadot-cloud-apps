// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { SmoldotProvider } from 'dedot'
import type { Client, ClientOptionsWithBytecode } from 'smoldot'

export type WorkerOpts = Omit<
	ClientOptionsWithBytecode,
	'bytecode' | 'portToWorker'
>

export type RelayChainSetup = {
	provider: SmoldotProvider
	client: Client
	relayChain: Awaited<ReturnType<Client['addChain']>>
}
