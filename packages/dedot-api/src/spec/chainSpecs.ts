// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import type { ChainProperties } from 'dedot/types/json-rpc'
import type { HexString } from 'dedot/utils'
import type { ChainSpecVersion } from 'types'
import type { Chain } from '../types'

export class ChainSpecs<T extends Chain> {
	genesisHash: HexString
	properties: ChainProperties
	existentialDeposit: bigint
	version: ChainSpecVersion

	constructor(public api: DedotClient<T>) {
		this.api = api
	}

	async fetch() {
		this.genesisHash = await this.api.chainSpec.genesisHash()
		this.properties = await this.api.chainSpec.properties()
		this.existentialDeposit = this.api.consts.balances.existentialDeposit
		this.version = this.api.consts.system.version
	}

	get() {
		return {
			genesisHash: this.genesisHash,
			properties: this.properties,
			existentialDeposit: this.existentialDeposit,
			version: this.version,
		}
	}
}
