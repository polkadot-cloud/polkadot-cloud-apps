// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { getPeopleChainId } from 'consts/util/chains'
import { DedotClient, type SmoldotProvider, type WsProvider } from 'dedot'
import { setApiStatus } from 'global-bus'
import type { IdentityOf, NetworkId, SuperOf, SystemChainId } from 'types'
import { query } from '../query'
import type { PeopleChain } from '../types'

// Manages lazy identity connection and people chain interactions
export class IdentityManager<PeopleApi extends PeopleChain> {
	api?: DedotClient<PeopleApi>
	private connection?: Promise<DedotClient<PeopleApi>>

	constructor(
		public provider: WsProvider | SmoldotProvider,
		public network: NetworkId,
	) {}

	identityOfMulti = async (addresses: string[]): Promise<IdentityOf[]> =>
		query.identityOfMulti(await this.lazyConnect(), addresses)

	superOfMulti = async (addresses: string[]): Promise<SuperOf[]> => {
		const api = await this.lazyConnect()
		return query.superOfMulti(api, addresses, api.consts.system.ss58Prefix)
	}

	// Lazy connect to the people chain API. Should be called before any queries
	lazyConnect = () => {
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
					throw error
				})
		}

		return this.connection
	}

	disconnect = async () => {
		const api = await this.connection?.catch(() => undefined)
		await api?.disconnect()
	}
}
