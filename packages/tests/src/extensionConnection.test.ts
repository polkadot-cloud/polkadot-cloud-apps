// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { afterAll, beforeEach, expect, test, vi } from 'vitest'
import { createElement } from '../../app-staking/node_modules/react/index.js'
import { renderToStaticMarkup } from '../../app-staking/node_modules/react-dom/server.node.js'
import { Extension } from '../../ui-app/src/Headers/Popovers/ConnectPopover/Extension'
import type { ButtonMonoInvertProps } from '../../ui-buttons/src/types'

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
	const stored = new Map<string, string>()
	vi.stubGlobal('localStorage', {
		getItem: (key: string) => stored.get(key) ?? null,
		setItem: (key: string, value: string) => stored.set(key, value),
		removeItem: (key: string) => stored.delete(key),
	})
	const alert = vi.fn()
	const confirm = vi.fn()
	const reload = vi.fn()
	vi.stubGlobal('alert', alert)
	vi.stubGlobal('confirm', confirm)
	vi.stubGlobal('location', { reload })
	return {
		state: {
			stored,
			status: 'installed',
			canConnect: true,
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
		extensionCanConnect: () => state.canConnect,
		extensionInstalled: () => true,
	}),
}))
vi.mock('../../assets/src/index', () => ({ getExtensionIcon: () => null }))
vi.mock('../../event-tracking/src/index', () => ({
	onExtensionConnectedEvent: connectedEvent,
}))
vi.mock('../../hooks/src/useNetwork', () => ({
	useNetwork: () => ({ network: 'polkadot' }),
}))
vi.mock('../../ui-app/node_modules/react-i18next/dist/es/index.js', () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}))
vi.mock('../../ui-buttons/src/index', () => ({
	ButtonMonoInvert: (props: ButtonMonoInvertProps) => {
		state.button = props
		return createElement('button', null, props.text)
	},
}))
vi.mock('../../ui-core/src/popover/index.tsx', () => ({
	ConnectItem: { Item: 'div', Logo: 'span', WebUrl: 'span' },
}))
vi.mock('../../ui-overlay/src/index', () => ({
	useOverlay: () => ({ modal: { openModal } }),
}))

beforeEach(() => {
	vi.resetAllMocks()
	state.stored.clear()
	state.status = 'installed'
	state.canConnect = true
	state.button = undefined
	connect.mockResolvedValue(true)
	confirm.mockReturnValue(true)
})

afterAll(() => vi.unstubAllGlobals())

const renderButton = () => {
	renderToStaticMarkup(
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
	let approve!: (connected: boolean) => void
	connect.mockReturnValue(
		new Promise<boolean>((resolve) => {
			approve = resolve
		}),
	)
	const button = renderButton()
	const connecting = button.onClick?.()
	await button.onClick?.()
	expect(connect).toHaveBeenCalledOnce()
	expect(connectedEvent).not.toHaveBeenCalled()
	expect(setOpen).not.toHaveBeenCalled()
	expect(openModal).not.toHaveBeenCalled()
	approve(true)
	await connecting
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
	const core = await import(
		'../../ui-app/node_modules/@polkadot-cloud/connect-core/index.js'
	)
	const extensions = await import(
		'../../ui-app/node_modules/@polkadot-cloud/connect-core/extensions/index.js'
	)
	const accounts = await import(
		'../../ui-app/node_modules/@polkadot-cloud/connect-core/accounts/index.js'
	)
	const id = 'cloud-signer'
	const account = {
		address: `0x${'11'.repeat(32)}`,
		name: 'Public test account',
	}
	let finish!: (value: (typeof account)[]) => void
	const get = vi.fn(
		() =>
			new Promise<(typeof account)[]>((resolve) => {
				finish = resolve
			}),
	)
	const enable = vi.fn().mockResolvedValue({ accounts: { get }, signer: {} })
	const injectedWeb3 = { [id]: { enable } }
	vi.stubGlobal('window', { injectedWeb3, parent: { injectedWeb3 } })
	core.setStatus(id, 'installed')
	try {
		const reconnect = extensions.connectExtension('Cloud Apps test', 0, id)
		await vi.waitFor(() => expect(get).toHaveBeenCalledOnce())
		// Core has enabled the wallet, but the menu still shows its previous state.
		expect(core.canConnect(id)).toBe(false)
		state.status = 'installed'
		state.canConnect = false
		connect.mockImplementation(() =>
			extensions.connectExtension('Cloud Apps test', 0, id),
		)
		const clicked = renderButton().onClick?.()
		finish([account])
		await Promise.all([reconnect, clicked])
		expect(connect).toHaveBeenCalledOnce()
		expect(enable).toHaveBeenCalledOnce()
		expect(alert).not.toHaveBeenCalled()
		expect(connectedEvent).toHaveBeenCalledOnce()
		expect(openModal).toHaveBeenCalledOnce()
	} finally {
		accounts.unsubAll()
		core.resetAccounts()
		core.removeStatus(id)
		vi.stubGlobal('window', undefined)
	}
})

test('Disconnect removes the canonical reconnect preference and preserves other wallets', async () => {
	state.status = 'connected'
	state.canConnect = false
	state.stored.set(
		'pc_active_extensions',
		JSON.stringify(['cloud-signer', 'talisman']),
	)
	await renderButton().onClick?.()
	expect(state.stored.get('pc_active_extensions')).toBe(
		JSON.stringify(['talisman']),
	)
	expect(state.stored.has('active_extensions')).toBe(false)
	expect(reload).toHaveBeenCalledOnce()
	expect(connect).not.toHaveBeenCalled()
})

test('cancelled Disconnect preserves the reconnect preference', async () => {
	state.status = 'connected'
	confirm.mockReturnValue(false)
	state.stored.set('pc_active_extensions', JSON.stringify(['cloud-signer']))
	await renderButton().onClick?.()
	expect(state.stored.get('pc_active_extensions')).toBe(
		JSON.stringify(['cloud-signer']),
	)
	expect(reload).not.toHaveBeenCalled()
})
