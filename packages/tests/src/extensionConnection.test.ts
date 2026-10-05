// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
// @vitest-environment jsdom

import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { afterAll, afterEach, beforeEach, expect, test, vi } from 'vitest'
import * as accounts from '../../ui-app/node_modules/@polkadot-cloud/connect-core/accounts/index.js'
import * as extensions from '../../ui-app/node_modules/@polkadot-cloud/connect-core/extensions/index.js'
import * as core from '../../ui-app/node_modules/@polkadot-cloud/connect-core/index.js'
import { Extension } from '../../ui-app/src/Headers/Popovers/ConnectPopover/Extension'
import type { ButtonMonoInvertProps } from '../../ui-buttons/src/types'
import {
	extensionAccount as account,
	createExtensionWallet,
	extensionId as id,
} from './extensionWallet'

const {
	state,
	connect,
	connectedEvent,
	openModal,
	setOpen,
	alert,
	confirm,
	reload,
} = vi.hoisted(() => {
	vi.stubGlobal('localStorage', window.localStorage)
	const alert = vi.fn()
	const confirm = vi.fn()
	const reload = vi.fn()
	vi.stubGlobal('alert', alert)
	vi.stubGlobal('confirm', confirm)
	vi.stubGlobal('location', { reload })
	return {
		state: {
			status: 'installed',
			network: 'polkadot',
			button: undefined as ButtonMonoInvertProps | undefined,
		},
		connect: vi.fn(),
		connectedEvent: vi.fn(),
		openModal: vi.fn(),
		setOpen: vi.fn(),
		alert,
		confirm,
		reload,
	}
})

vi.mock('../../ui-app/node_modules/@polkadot-cloud/connect/index.js', () => ({
	useExtensionAccounts: () => ({ connectExtension: connect }),
	useExtensions: () => ({
		extensionsStatus: { 'cloud-signer': state.status },
	}),
}))
vi.mock('../../assets/src/index', () => ({ getExtensionIcon: () => null }))
vi.mock('../../event-tracking/src/index', () => ({
	onExtensionConnectedEvent: connectedEvent,
}))
vi.mock('../../hooks/src/useNetwork', () => ({
	useNetwork: () => ({ network: state.network }),
}))
vi.mock('../../ui-app/node_modules/react-i18next/dist/es/index.js', () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}))
vi.mock('../../ui-buttons/src/index', () => ({
	ButtonMonoInvert: (props: ButtonMonoInvertProps) => {
		state.button = props
		return createElement('button', { type: 'button' }, props.text)
	},
}))
vi.mock('../../ui-core/src/popover/index.tsx', () => ({
	ConnectItem: { Item: 'div', Logo: 'span', WebUrl: 'span' },
}))
vi.mock('../../ui-overlay/src/index', () => ({
	useOverlay: () => ({ modal: { openModal } }),
}))

let root: ReturnType<typeof createRoot>
let container: HTMLDivElement

beforeEach(() => {
	vi.resetAllMocks()
	localStorage.clear()
	state.status = 'installed'
	state.network = 'polkadot'
	state.button = undefined
	core.setStatus('cloud-signer', 'installed')
	connect.mockImplementation(async () => {
		core.setStatus('cloud-signer', 'connected')
		return true
	})
	confirm.mockReturnValue(true)
	vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
	container = document.createElement('div')
	document.body.append(container)
	root = createRoot(container)
})

afterEach(() => {
	act(() => root.unmount())
	container.remove()
	accounts.unsubAll()
	core.resetAccounts()
	core.removeStatus(id)
	Reflect.deleteProperty(window, 'injectedWeb3')
})

afterAll(() => vi.unstubAllGlobals())

const renderButton = () => {
	act(() =>
		root.render(
			createElement(Extension, {
				extension: {
					id: 'cloud-signer',
					title: 'Cloud Signer',
					website: 'polkadot.cloud',
					category: 'web-extension',
					features: '*',
				},
				last: true,
				setOpen,
			}),
		),
	)
	return state.button!
}

test.each(['false', 'rejection'])(
	'failed connection does not run success effects: %s',
	async (failure) => {
		if (failure === 'false') connect.mockResolvedValue(false)
		else connect.mockRejectedValue(new Error('User rejected request.'))
		await renderButton().onClick?.()
		expect(alert).toHaveBeenCalledOnce()
		expect(connectedEvent).not.toHaveBeenCalled()
		expect(setOpen).not.toHaveBeenCalled()
		expect(openModal).not.toHaveBeenCalled()
	},
)

test('a pending approval waits for success and ignores repeated clicks', async () => {
	const approval = Promise.withResolvers<boolean>()
	connect.mockReturnValue(approval.promise)
	const button = renderButton()
	const connecting = button.onClick?.()
	await button.onClick?.()
	expect(connect).toHaveBeenCalledOnce()
	expect(connectedEvent).not.toHaveBeenCalled()
	expect(setOpen).not.toHaveBeenCalled()
	expect(openModal).not.toHaveBeenCalled()
	expect(renderButton().disabled).toBe(true)
	core.setStatus('cloud-signer', 'connected')
	approval.resolve(true)
	await connecting
	expect(renderButton().disabled).toBe(false)
	expect(connectedEvent).toHaveBeenCalledExactlyOnceWith(
		'polkadot',
		'cloud-signer',
	)
	expect(setOpen).toHaveBeenCalledExactlyOnceWith(false)
	expect(openModal).toHaveBeenCalledExactlyOnceWith({ key: 'Accounts' })
})

test('a failed connection can be retried from the same menu', async () => {
	connect.mockResolvedValueOnce(false)
	const button = renderButton()
	await button.onClick?.()
	await button.onClick?.()
	expect(connect).toHaveBeenCalledTimes(2)
	expect(connectedEvent).toHaveBeenCalledOnce()
	expect(openModal).toHaveBeenCalledOnce()
})

test('the first click joins a pending reconnect despite a stale menu status', async () => {
	const { extension, enable, injectedWeb3 } = createExtensionWallet()
	const loading = Promise.withResolvers<(typeof account)[]>()
	extension.accounts.get.mockReturnValue(loading.promise)
	Reflect.set(window, 'injectedWeb3', injectedWeb3)
	const reconnect = extensions.connectExtension('Cloud Apps test', 0, id)
	await vi.waitFor(() => expect(extension.accounts.get).toHaveBeenCalledOnce())
	// Core has enabled the wallet, but the menu still shows its previous state.
	expect(core.canConnect(id)).toBe(false)
	connect.mockImplementation(() =>
		extensions.connectExtension('Cloud Apps test', 0, id),
	)
	const clicked = renderButton().onClick?.()
	loading.resolve([account])
	await Promise.all([reconnect, clicked])
	expect(connect).toHaveBeenCalledOnce()
	expect(enable).toHaveBeenCalledOnce()
	expect(alert).not.toHaveBeenCalled()
	expect(connectedEvent).toHaveBeenCalledOnce()
	expect(openModal).toHaveBeenCalledOnce()
})

test('Disconnect removes the canonical reconnect preference and preserves other wallets', async () => {
	state.status = 'connected'
	localStorage.setItem(
		'pc_active_extensions',
		JSON.stringify(['cloud-signer', 'talisman']),
	)
	await renderButton().onClick?.()
	expect(localStorage.getItem('pc_active_extensions')).toBe(
		JSON.stringify(['talisman']),
	)
	expect(localStorage.getItem('active_extensions')).toBeNull()
	expect(reload).toHaveBeenCalledOnce()
	expect(connect).not.toHaveBeenCalled()
})

test('cancelled Disconnect preserves the reconnect preference', async () => {
	state.status = 'connected'
	confirm.mockReturnValue(false)
	localStorage.setItem('pc_active_extensions', JSON.stringify(['cloud-signer']))
	await renderButton().onClick?.()
	expect(localStorage.getItem('pc_active_extensions')).toBe(
		JSON.stringify(['cloud-signer']),
	)
	expect(reload).not.toHaveBeenCalled()
})

test.each(['approved', 'failed', 'rejected'])(
	'a request finishing after the menu closes has no UI effects: %s',
	async (outcome) => {
		const approval = Promise.withResolvers<boolean>()
		connect.mockReturnValue(approval.promise)
		const pending = renderButton().onClick?.()
		act(() => root.render(null))
		core.setStatus('cloud-signer', 'connected')
		if (outcome === 'rejected')
			approval.reject(new Error('User rejected request.'))
		else approval.resolve(outcome === 'approved')
		await pending
		expect(alert).not.toHaveBeenCalled()
		expect(connectedEvent).not.toHaveBeenCalled()
		expect(setOpen).not.toHaveBeenCalled()
		expect(openModal).not.toHaveBeenCalled()
	},
)

test('reopening the menu during approval only completes the current menu action', async () => {
	const approval = Promise.withResolvers<boolean>()
	connect.mockReturnValue(approval.promise)
	const oldClick = renderButton().onClick?.()
	act(() => root.render(null))
	const newClick = renderButton().onClick?.()
	core.setStatus('cloud-signer', 'connected')
	approval.resolve(true)
	await Promise.all([oldClick, newClick])
	expect(connectedEvent).toHaveBeenCalledOnce()
	expect(setOpen).toHaveBeenCalledOnce()
	expect(openModal).toHaveBeenCalledOnce()
})

test('a network change invalidates the old menu action and leaves the new one usable', async () => {
	const approval = Promise.withResolvers<boolean>()
	connect.mockReturnValueOnce(approval.promise)
	const oldClick = renderButton().onClick?.()
	state.network = 'kusama'
	const currentButton = renderButton()
	expect(currentButton.disabled).toBe(false)
	core.setStatus('cloud-signer', 'connected')
	approval.resolve(true)
	await oldClick
	expect(connectedEvent).not.toHaveBeenCalled()
	expect(openModal).not.toHaveBeenCalled()
	await currentButton.onClick?.()
	expect(connectedEvent).toHaveBeenCalledExactlyOnceWith(
		'kusama',
		'cloud-signer',
	)
})

test('revocation before the connection result reaches the menu does not fire success effects', async () => {
	connect.mockImplementation(async () => {
		core.setStatus('cloud-signer', 'not_authenticated')
		return true
	})
	await renderButton().onClick?.()
	expect(connectedEvent).not.toHaveBeenCalled()
	expect(openModal).not.toHaveBeenCalled()
	expect(alert).toHaveBeenCalledOnce()
})

test('an Accounts UI failure is not reported as a wallet connection failure', async () => {
	openModal.mockImplementation(() => {
		throw new Error('Accounts UI failed')
	})
	await expect(renderButton().onClick?.()).rejects.toThrow('Accounts UI failed')
	expect(alert).not.toHaveBeenCalled()
	expect(core.getStatus('cloud-signer')).toBe('connected')
})

test('Disconnect stops live updates from restoring the reconnect preference before reload', async () => {
	const { injectedWeb3, publish, unsubscribe } = createExtensionWallet()
	Reflect.set(window, 'injectedWeb3', injectedWeb3)
	expect(await extensions.connectExtension('Cloud Apps test', 0, id)).toBe(true)
	state.status = 'connected'
	await renderButton().onClick?.()
	publish([account])
	expect(core.getActiveExtensionsLocal()).toEqual([])
	expect(unsubscribe).toHaveBeenCalledOnce()
	expect(core.getStatus(id)).not.toBe('connected')
	expect(reload).toHaveBeenCalledOnce()
})
