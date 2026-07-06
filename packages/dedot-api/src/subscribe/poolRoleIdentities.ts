// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { setPoolRoleIdentities } from 'global-bus'
import type {
	IdentityOf,
	RoleIdentities,
	ServiceInterface,
	SuperOf,
} from 'types'
import { formatIdentities, formatSuperIdentities } from 'utils'

export class PoolRoleIdentities {
	constructor(
		public poolId: number,
		public roleAddresses: string[],
		public serviceInterface: ServiceInterface,
	) {
		this.fetch()
	}

	async fetch() {
		try {
			const [identities, supers] = (await Promise.all([
				this.serviceInterface.query.identityOfMulti(this.roleAddresses),
				this.serviceInterface.query.superOfMulti(this.roleAddresses),
			])) as [IdentityOf[], SuperOf[]]

			const roleIdentities: RoleIdentities = {
				identities: formatIdentities(this.roleAddresses, identities || []),
				supers: formatSuperIdentities(supers || []),
			}

			setPoolRoleIdentities(this.poolId, roleIdentities)
		} catch (err) {
			// Silently fail - identities are optional and will be retried on next pool update
			console.warn(`Failed to fetch pool ${this.poolId} role identities:`, err)
		}
	}
}
