// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getPeopleChainId } from 'consts/util/chains'
import { DedotClient, type SmoldotProvider, type WsProvider } from 'dedot'
import { setApiStatus } from 'global-bus'
import type { IdentityOf, NetworkId, SuperOf, SystemChainId } from 'types'
import { query } from '../query'
import type { PeopleChain } from '../types'
import type { QueueItem } from './types'

// Manages lazy identity connection and people chain interactions
export class IdentityManager<PeopleApi extends PeopleChain> {
	api?: DedotClient<PeopleApi>
	public provider: WsProvider | SmoldotProvider
	public network: NetworkId
	private queue: QueueItem[] = []
	private isProcessingQueue = false
	private connection?: Promise<DedotClient<PeopleApi>>

	constructor(provider: WsProvider | SmoldotProvider, network: NetworkId) {
		this.provider = provider
		this.network = network
	}

	identityOfMulti = async (addresses: string[]): Promise<IdentityOf[]> => {
		return new Promise<IdentityOf[]>((resolve, reject) => {
			this.queue.push({
				type: 'identityOfMulti',
				addresses,
				resolve,
				reject,
			})

			// Handle potential connection errors
			this.lazyConnect().catch(reject)
		})
	}

	superOfMulti = async (addresses: string[]): Promise<SuperOf[]> => {
		return new Promise<SuperOf[]>((resolve, reject) => {
			this.queue.push({
				type: 'superOfMulti',
				addresses,
				resolve,
				reject,
			})

			// Handle potential connection errors
			this.lazyConnect().catch(reject)
		})
	}

	// Lazy connect to the people chain API. Should be called before any queries
	lazyConnect = async () => {
		if (!this.connection) {
			const peopleChainId = getPeopleChainId(this.network) as SystemChainId
			setApiStatus(peopleChainId, 'connecting')
			this.connection = DedotClient.new<PeopleApi>({
				provider: this.provider,
				cacheMetadata: true,
			})
				.then((api) => {
					this.api = api
					setApiStatus(peopleChainId, 'ready')
					return api
				})
				.catch((error) => {
					this.connection = undefined
					setApiStatus(peopleChainId, 'disconnected')
					// If connection fails, reject all queued promises
					const currentQueue = [...this.queue]
					this.queue = []

					for (const item of currentQueue) {
						item.reject(error)
					}

					throw error
				})
		}

		const api = await this.connection
		void this.processQueue()
		return api
	}

	disconnect = async () => {
		const api = await this.connection?.catch(() => undefined)
		await api?.disconnect()
	}

	// Process all queued operations
	private processQueue = async () => {
		if (this.isProcessingQueue || !this.api) {
			return
		}

		this.isProcessingQueue = true

		// Keep processing until the queue is empty
		while (this.queue.length > 0) {
			// Process all items currently in the queue
			const currentQueue = [...this.queue]
			this.queue = []

			for (const item of currentQueue) {
				try {
					if (item.type === 'identityOfMulti') {
						const result = await query.identityOfMulti(this.api, item.addresses)
						item.resolve(result)
					} else if (item.type === 'superOfMulti') {
						const result = await query.superOfMulti(
							this.api,
							item.addresses,
							this.api.consts.system.ss58Prefix,
						)
						item.resolve(result)
					}
				} catch (error) {
					item.reject(error)
				}
			}
		}

		this.isProcessingQueue = false
	}
}
