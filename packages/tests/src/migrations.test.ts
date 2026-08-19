// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { GlobalMigrationVersion, runMigrations } from 'utils'
import { afterEach, describe, expect, test, vi } from 'vitest'

const createStorage = (values: Record<string, string>): Storage => {
	const storage = { ...values } as Record<string, string> & Storage

	Object.defineProperties(storage, {
		clear: {
			value: () => {
				Object.keys(storage).forEach((key) => {
					delete storage[key]
				})
			},
		},
		getItem: {
			value: (key: string) => storage[key] ?? null,
		},
		key: {
			value: (index: number) => Object.keys(storage)[index] ?? null,
		},
		length: {
			get: () => Object.keys(storage).length,
		},
		removeItem: {
			value: (key: string) => delete storage[key],
		},
		setItem: {
			value: (key: string, value: string) => {
				storage[key] = String(value)
			},
		},
	})

	return storage
}

afterEach(() => {
	vi.unstubAllGlobals()
})

describe('runMigrations', () => {
	test('runs the RPC migration for a new global migration state', () => {
		const storage = createStorage({
			autoRpc: 'true',
			polkadotRpcEndpoints: '["wss://legacy.example"]',
		})
		vi.stubGlobal('localStorage', storage)

		runMigrations()

		expect(storage.getItem('migrationVersion')).toBe(
			String(GlobalMigrationVersion),
		)
		expect(storage.getItem('autoRpc')).toBeNull()
		expect(storage.getItem('polkadotRpcEndpoints')).toBeNull()
	})

	test('does not repeat completed global migrations', () => {
		const storage = createStorage({
			autoRpc: 'true',
			migrationVersion: String(GlobalMigrationVersion),
			polkadotRpcEndpoints: '["wss://chosen.example"]',
		})
		vi.stubGlobal('localStorage', storage)

		runMigrations()

		expect(storage.getItem('autoRpc')).toBe('true')
		expect(storage.getItem('polkadotRpcEndpoints')).toBe(
			'["wss://chosen.example"]',
		)
	})

	test('does not downgrade a newer global migration version', () => {
		const newerVersion = GlobalMigrationVersion + 1
		const storage = createStorage({
			autoRpc: 'true',
			migrationVersion: String(newerVersion),
		})
		vi.stubGlobal('localStorage', storage)

		runMigrations()

		expect(storage.getItem('migrationVersion')).toBe(String(newerVersion))
		expect(storage.getItem('autoRpc')).toBe('true')
	})
})
