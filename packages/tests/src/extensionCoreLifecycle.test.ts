// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import {
	extensionAccount as account,
	createExtensionWallet,
	extensionId as id,
} from './extensionWallet'

let core: typeof import('../../ui-app/node_modules/@polkadot-cloud/connect-core/index.js')
let extensions: typeof import('../../ui-app/node_modules/@polkadot-cloud/connect-core/extensions/index.js')
let accounts: typeof import('../../ui-app/node_modules/@polkadot-cloud/connect-core/accounts/index.js')

beforeEach(async () => {
	vi.resetModules()
	const stored = new Map<string, string>()
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
	accounts = await import(
		'../../ui-app/node_modules/@polkadot-cloud/connect-core/accounts/index.js'
	)
	core.resetAccounts()
	core.setReconnectSync('unsynced')
	core.setStatus(id, 'installed')
})

afterEach(() => {
	try {
		accounts.unsubAll()
	} finally {
		vi.unstubAllGlobals()
	}
})

const provider = () => {
	const wallet = createExtensionWallet()
	const { injectedWeb3 } = wallet
	vi.stubGlobal('window', { injectedWeb3, parent: { injectedWeb3 } })
	return wallet
}

const snapshot = () => {
	let result: {
		address: string
		source: string
		name?: string
		signer?: unknown
	}[] = []
	const sub = core.extensionAccounts$.subscribe((value: typeof result) => {
		result = value
	})
	sub.unsubscribe()
	return result
}

test('a second Connect after an automatic connection completes is successful without re-enabling', async () => {
	const wallet = provider()
	core.addExtensionToLocal(id)
	await extensions.reconnectExtensions('Cloud Apps test', 0)
	expect(await extensions.connectExtension('Cloud Apps test', 0, id)).toBe(true)
	expect(wallet.enable).toHaveBeenCalledOnce()
})

test('connected status during account loading still joins the pending request', async () => {
	const wallet = provider()
	wallet.extension.accounts.subscribe.mockImplementation(
		() => wallet.unsubscribe,
	)
	const loading = Promise.withResolvers<(typeof account)[]>()
	wallet.extension.accounts.get.mockReturnValue(loading.promise)
	const first = extensions.connectExtension('Cloud Apps test', 0, id)
	await vi.waitFor(() =>
		expect(wallet.extension.accounts.get).toHaveBeenCalledOnce(),
	)
	expect(core.getStatus(id)).toBe('connected')
	expect(snapshot()).toEqual([])
	const second = extensions.connectExtension('Cloud Apps test', 0, id)
	expect(second).toBe(first)
	loading.resolve([])
	expect(await second).toBe(false)
	expect(core.getStatus(id)).toBe('not_authenticated')
})

test('a stale connected status after cleanup does not become a successful Connect', async () => {
	provider()
	expect(await extensions.connectExtension('Cloud Apps test', 0, id)).toBe(true)
	accounts.unsubAll()
	core.resetAccounts()
	expect(core.getStatus(id)).toBe('connected')
	expect(await extensions.connectExtension('Cloud Apps test', 0, id)).toBe(
		false,
	)
})

test('account updates refresh a renamed account and preserve another wallet', async () => {
	const wallet = provider()
	accounts.processExtensionAccounts({ source: 'talisman', ss58: 0 }, {}, [
		account,
	])
	await extensions.connectExtension('Cloud Apps test', 0, id)
	wallet.publish([{ ...account, name: 'Renamed account' }])
	expect(snapshot()).toEqual(
		expect.arrayContaining([
			expect.objectContaining({ source: id, name: 'Renamed account' }),
			expect.objectContaining({ source: 'talisman', name: account.name }),
		]),
	)
})

test('a reconnect replaces an old signer even when its accounts are unchanged', async () => {
	const wallet = provider()
	await extensions.connectExtension('Cloud Apps test', 0, id)
	const replacementSigner = { signPayload: vi.fn() }
	wallet.enable.mockResolvedValue({
		...wallet.extension,
		signer: replacementSigner,
	})
	await extensions.reconnectExtensions('Cloud Apps test', 0)
	expect(snapshot()).toEqual([
		expect.objectContaining({ source: id, signer: replacementSigner }),
	])
	expect(wallet.unsubscribe).toHaveBeenCalledOnce()
})

test('a throwing wallet unsubscribe cannot interrupt other wallet cleanup', () => {
	const otherUnsubscribe = vi.fn()
	accounts.addUnsub(id, () => {
		throw new Error('Extension context invalidated')
	})
	accounts.addUnsub('talisman', otherUnsubscribe)
	expect(() => accounts.unsubAll()).not.toThrow()
	expect(otherUnsubscribe).toHaveBeenCalledOnce()
	expect(Object.keys(accounts.unsubs)).toEqual([])
})

test('a failed account fetch still clears accounts when unsubscribe throws', async () => {
	const wallet = provider()
	wallet.unsubscribe.mockImplementation(() => {
		throw new Error('Extension context invalidated')
	})
	wallet.extension.accounts.get.mockRejectedValue(
		new Error('Wallet session closed'),
	)
	expect(await extensions.connectExtension('Cloud Apps test', 0, id)).toBe(
		false,
	)
	expect(snapshot()).toEqual([])
	expect(core.getStatus(id)).toBe('not_authenticated')
	expect(core.getActiveExtensionsLocal()).toEqual([])
})

test('Disconnect cancels a pending wallet without disturbing other accounts or preferences', async () => {
	const wallet = provider()
	const loading = Promise.withResolvers<(typeof account)[]>()
	wallet.extension.accounts.get.mockReturnValue(loading.promise)
	accounts.processExtensionAccounts({ source: 'talisman', ss58: 0 }, {}, [
		account,
	])
	core.addExtensionToLocal('talisman')
	const connecting = extensions.connectExtension('Cloud Apps test', 0, id)
	await vi.waitFor(() =>
		expect(wallet.extension.accounts.get).toHaveBeenCalledOnce(),
	)
	extensions.disconnectExtension(id)
	loading.resolve([account])
	expect(await connecting).toBe(false)
	wallet.publish([account])
	expect(snapshot()).toEqual([expect.objectContaining({ source: 'talisman' })])
	expect(core.getActiveExtensionsLocal()).toEqual(['talisman'])
	expect(core.getStatus(id)).toBe('installed')
	expect(wallet.unsubscribe).toHaveBeenCalledOnce()
})
