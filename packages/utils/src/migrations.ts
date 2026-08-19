// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { AutoRpcKey, rpcEndpointKey } from 'consts'
import { NetworkList } from 'consts/networks'

export const GlobalMigrationVersion = 1

const GlobalMigrationVersionKey = 'migrationVersion'

/**
 * Clears persisted RPC choices so the current defaults can be applied.
 */
const migrateRpcConfig = (): void => {
	localStorage.removeItem(AutoRpcKey)
	Object.keys(NetworkList).forEach((network) => {
		localStorage.removeItem(rpcEndpointKey(network))
	})
}

const migrations: Record<number, () => void> = {
	1: migrateRpcConfig,
}

/**
 * Runs pending storage migrations using a version shared by every app.
 */
export const runMigrations = (): void => {
	const storedVersion = Number.parseInt(
		localStorage.getItem(GlobalMigrationVersionKey) || '0',
		10,
	)
	const currentVersion = Number.isNaN(storedVersion) ? 0 : storedVersion

	if (currentVersion >= GlobalMigrationVersion) {
		return
	}

	for (
		let version = currentVersion + 1;
		version <= GlobalMigrationVersion;
		version++
	) {
		migrations[version]?.()
	}

	localStorage.setItem(
		GlobalMigrationVersionKey,
		String(GlobalMigrationVersion),
	)
}
