// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
// @vitest-environment jsdom

import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, test, vi } from 'vitest'
import {
	ConnectProvider,
	useImportedAccounts,
} from '../../ui-app/node_modules/@polkadot-cloud/connect/index.js'
import { reconnectExtensions } from '../../ui-app/node_modules/@polkadot-cloud/connect-core/extensions/index.js'
import { addExtensionToLocal } from '../../ui-app/node_modules/@polkadot-cloud/connect-core/index.js'

vi.hoisted(() => {
	vi.stubGlobal('localStorage', window.localStorage)
	vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
})

test('the installed providers expose a refreshed signer to getAccount after reconnect', async () => {
	vi.useFakeTimers()
	localStorage.clear()
	const id = 'cloud-signer'
	const account = {
		address: `0x${'11'.repeat(32)}`,
		name: 'Public test account',
	}
	const originalSigner = { signPayload: vi.fn() }
	const extension = {
		accounts: {
			get: async () => [account],
			subscribe: (callback: (value: (typeof account)[]) => void) => {
				callback([account])
				return vi.fn()
			},
		},
		signer: originalSigner,
	}
	const enable = vi.fn().mockResolvedValue(extension)
	Reflect.set(window, 'injectedWeb3', { [id]: { enable } })
	addExtensionToLocal(id)
	let imported!: ReturnType<typeof useImportedAccounts>
	const Probe = () => {
		imported = useImportedAccounts()
		return null
	}
	const container = document.createElement('div')
	document.body.append(container)
	const root = createRoot(container)
	try {
		await act(async () =>
			root.render(
				<ConnectProvider dappName="Lifecycle test" network="polkadot" ss58={0}>
					<Probe />
				</ConnectProvider>,
			),
		)
		await act(async () => vi.advanceTimersByTimeAsync(1000))
		const identity = { address: imported.accounts[0].address, source: id }
		expect(imported.getAccount(identity)).toHaveProperty(
			'signer',
			originalSigner,
		)
		const replacementSigner = { signPayload: vi.fn() }
		enable.mockResolvedValue({ ...extension, signer: replacementSigner })
		await act(async () => {
			await reconnectExtensions('Lifecycle test', 0)
		})
		expect(imported.accounts[0]).toHaveProperty('signer', replacementSigner)
		expect(imported.getAccount(identity)).toHaveProperty(
			'signer',
			replacementSigner,
		)
	} finally {
		await act(async () => root.unmount())
		container.remove()
		Reflect.deleteProperty(window, 'injectedWeb3')
		vi.clearAllTimers()
		vi.useRealTimers()
		vi.unstubAllGlobals()
	}
})
