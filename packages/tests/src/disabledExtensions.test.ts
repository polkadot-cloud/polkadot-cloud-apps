// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { afterEach, beforeEach, expect, test, vi } from 'vitest'

let core: typeof import('../../ui-app/node_modules/@polkadot-cloud/connect-core/index.js')
let extensions: typeof import('../../ui-app/node_modules/@polkadot-cloud/connect-core/extensions/index.js')
let util: typeof import('../../ui-app/src/util')
let stored: Map<string, string>

beforeEach(async () => {
	vi.resetModules()
	stored = new Map<string, string>()
	vi.stubGlobal('localStorage', {
		getItem: (key: string) => stored.get(key) ?? null,
		setItem: (key: string, value: string) => stored.set(key, value),
		removeItem: (key: string) => stored.delete(key),
	})
	core = await import(
		'../../ui-app/node_modules/@polkadot-cloud/connect-core/index.js'
	)
	extensions = await import(
		'../../ui-app/node_modules/@polkadot-cloud/connect-core/extensions/index.js'
	)
	// Test the exclusion mechanism independently of which extensions are currently disabled.
	vi.doMock('../../consts/src/extensions', async (importOriginal) => ({
		...(await importOriginal<object>()),
		DisabledExtensions: ['talisman'],
	}))
	util = await import('../../ui-app/src/util')
	core.resetAccounts()
	core.setReconnectSync('unsynced')
})

afterEach(() => {
	vi.unstubAllGlobals()
})

test('disabled extensions are removed from the saved reconnect list', () => {
	stored.set(
		'pc_active_extensions',
		JSON.stringify(['cloud-signer', 'talisman', 'subwallet-js']),
	)
	util.clearDisabledExtensionsLocal()
	expect(core.getActiveExtensionsLocal()).toEqual([
		'cloud-signer',
		'subwallet-js',
	])
})

test('no saved reconnect list is left untouched', () => {
	util.clearDisabledExtensionsLocal()
	expect(stored.has('pc_active_extensions')).toBe(false)
})

test('a saved Talisman-only session does not reconnect and syncs as disconnected', async () => {
	const enable = vi.fn()
	const injectedWeb3 = { talisman: { enable } }
	vi.stubGlobal('window', { injectedWeb3, parent: { injectedWeb3 } })
	core.setStatus('talisman', 'installed')
	stored.set('pc_active_extensions', JSON.stringify(['talisman']))

	util.clearDisabledExtensionsLocal()
	await extensions.reconnectExtensions('Cloud Apps test', 0)

	expect(enable).not.toHaveBeenCalled()
	expect(core.getActiveExtensionsLocal()).toEqual([])
	expect(core.getReconnectSync()).toBe('synced')
	expect(core.getStatus('talisman')).toBe('installed')
	expect(extensions.getExtensionConnectionError('talisman')).toBeUndefined()
})
