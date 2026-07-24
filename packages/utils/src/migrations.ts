// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

/**
 * Migrates legacy localStorage keys to their new pc_-prefixed versions.
 * Handles static keys and dynamic network-based keys.
 *
 * Migrations:
 * - active_extensions -> pc_active_extensions
 * - hardware_accounts -> pc_hardware_accounts
 * - external_accounts -> pc_external_accounts
 * - activeProxies -> pc_activeProxies
 * - {network}_active_account -> pc_{network}_active_account
 */
export const migrateLocalStorageKeys = (): void => {
	// Static key migrations
	const staticMigrations = [
		{ oldKey: 'active_extensions', newKey: 'pc_active_extensions' },
		{ oldKey: 'hardware_accounts', newKey: 'pc_hardware_accounts' },
		{ oldKey: 'external_accounts', newKey: 'pc_external_accounts' },
		{ oldKey: 'activeProxies', newKey: 'pc_activeProxies' },
	]

	staticMigrations.forEach(({ oldKey, newKey }) => {
		const value = localStorage.getItem(oldKey)
		if (value !== null) {
			localStorage.setItem(newKey, value)
			localStorage.removeItem(oldKey)
		}
	})

	// Dynamic network-based migrations
	// Find all keys matching the pattern: {network}_active_account
	const allKeys = Object.keys(localStorage)
	const networkActiveAccountKeys = allKeys.filter(
		(key) => key.match(/^[a-z]+_active_account$/) && !key.startsWith('pc_'),
	)

	networkActiveAccountKeys.forEach((oldKey) => {
		const newKey = `pc_${oldKey}`
		const value = localStorage.getItem(oldKey)
		if (value !== null) {
			localStorage.setItem(newKey, value)
			localStorage.removeItem(oldKey)
		}
	})
}
