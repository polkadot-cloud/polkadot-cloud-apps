// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import { encodeAddress } from 'dedot/utils'
import type { StakingChain } from '../types'

export const validatorExists = async <T extends StakingChain>(
	api: DedotClient<T>,
	address: string,
) => {
	const storageKey = api.query.staking.validators.rawKey(address)

	try {
		// Validators is a value query, so its decoded default cannot prove that a
		// storage entry exists. Query the raw key to preserve that distinction.
		const storage = await api.rpc.state_getStorage(storageKey)
		return storage !== undefined
	} catch {
		// Some JSON-RPC v2 endpoints may not expose the legacy raw-storage method.
		// Entries only contains real storage keys, so it is a safe fallback.
		const prefix = api.consts.system.ss58Prefix
		const formattedAddress = encodeAddress(address, prefix)
		const entries = await api.query.staking.validators.entries()

		return entries.some(
			([account]) => account.address(prefix) === formattedAddress,
		)
	}
}
