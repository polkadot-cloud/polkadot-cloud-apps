// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import { setApiStatus } from 'global-bus'
import type { ChainId, NetworkConfig } from 'types'
import type { Chain } from '../types'

export class ApiStatus<T extends Chain> {
	constructor(
		public api: DedotClient<T>,
		public chainId: ChainId,
		public networkConfig: NetworkConfig,
	) {
		this.api = api
		this.networkConfig = networkConfig

		this.api.on('connected', () => {
			setApiStatus(this.chainId, 'connected')
		})
		this.api.on('disconnected', () => {
			setApiStatus(this.chainId, 'disconnected')
		})
		this.api.on('reconnecting', () => {
			setApiStatus(this.chainId, 'connecting')
		})
		this.api.on('ready', () => {
			setApiStatus(this.chainId, 'ready')
		})
		this.api.on('error', (err?: Error) => {
			setApiStatus(this.chainId, 'disconnected')
			console.debug(err)
		})
	}
}
