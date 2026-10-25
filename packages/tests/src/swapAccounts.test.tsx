// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
// @vitest-environment jsdom

import { act, createElement, type SVGProps } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { ImportedAccount } from 'types'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { AccountsButton } from '../../app-swap/src/library/Accounts'
import {
	Accounts,
	type AccountsOptions,
} from '../../app-swap/src/modals/Accounts'

const { state, openModal, closeModal, setActiveAccount, onSelect } = vi.hoisted(
	() => ({
		state: {
			accounts: [] as ImportedAccount[],
			activeAccount: null as { address: string; source: string } | null,
			options: undefined as Partial<AccountsOptions> | undefined,
		},
		openModal: vi.fn(),
		closeModal: vi.fn(),
		setActiveAccount: vi.fn(),
		onSelect: vi.fn(),
	}),
)

vi.mock('../../app-swap/node_modules/@polkadot-cloud/connect/index.js', () => ({
	useActiveAccount: () => ({
		activeAccount: state.activeAccount,
		setActiveAccount,
	}),
	useImportedAccounts: () => ({
		accounts: state.accounts,
		getAccount: (account: { address: string; source: string } | null) =>
			state.accounts.find(
				(item) =>
					item.address === account?.address && item.source === account?.source,
			),
	}),
}))
vi.mock(
	'../../app-swap/node_modules/@polkadot-cloud/ui/polkicon/index.js',
	() => ({ Polkicon: () => null }),
)
vi.mock('../../app-swap/node_modules/react-i18next/dist/es/index.js', () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}))
vi.mock('../../ui-overlay/src/index', () => ({
	useOverlay: () => ({
		modal: { openModal, closeModal, config: { options: state.options } },
	}),
}))
vi.mock('../../ui-app/src/ModalTitle', () => ({
	ModalTitle: ({ title }: { title: string }) =>
		createElement('h2', null, title),
}))
vi.mock('../../ui-app/src/ButtonCopy', () => ({
	ButtonCopy: () => createElement('button', { type: 'button' }, 'Copy'),
}))
vi.mock('../../ui-core/src/base', async () => {
	const { Identity } = await import('../../ui-core/src/base/Identity')
	return { Identity }
})
vi.mock('../../ui-app/src/AccountDropdown', () => ({
	getAccountSourceIcon: (source?: string) => {
		if (!source || source === 'external') return undefined
		return (props: SVGProps<SVGSVGElement>) =>
			createElement('svg', { ...props, 'data-source': source })
	},
	AccountDropdown: ({
		accounts,
		initialAccount,
		onSelect,
		disabled,
	}: {
		accounts: ImportedAccount[]
		initialAccount: ImportedAccount | null
		onSelect: (account: ImportedAccount | null) => void
		disabled: boolean
	}) =>
		createElement(
			'select',
			{
				'aria-label': 'account',
				value: initialAccount
					? `${initialAccount.address}:${initialAccount.source}`
					: '',
				disabled,
				onChange: (event: { currentTarget: HTMLSelectElement }) =>
					onSelect(
						accounts.find(
							(item) =>
								`${item.address}:${item.source}` === event.currentTarget.value,
						) ?? null,
					),
			},
			accounts.map((item) =>
				createElement(
					'option',
					{
						key: `${item.address}:${item.source}`,
						value: `${item.address}:${item.source}`,
					},
					item.name,
				),
			),
		),
}))
vi.mock('../../app-swap/src/library/Balances/BalancesView', () => ({
	BalancesView: ({ account }: { account: ImportedAccount }) =>
		createElement('div', {
			'data-balances': `${account.address}:${account.source}`,
		}),
}))
vi.mock('../../ui-buttons/src/index', async () => {
	const { Standalone } = await import(
		'../../ui-buttons/src/ButtonAccount/Standalone'
	)
	return { ButtonAccount: { Standalone } }
})

const alice = {
	name: 'Alice',
	address: 'alice',
	source: 'extension',
} as ImportedAccount
const bob = { name: 'Bob', address: 'bob', source: 'ledger' } as ImportedAccount
let root: Root
let container: HTMLDivElement
const render = () => act(async () => root.render(createElement(Accounts)))
const accountRows = () => [
	...container.querySelectorAll<HTMLElement>('[role="option"]'),
]
const balanceAccount = () =>
	container.querySelector('[data-balances]')?.getAttribute('data-balances')

beforeEach(() => {
	vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
	vi.clearAllMocks()
	state.accounts = [bob, alice]
	state.activeAccount = { address: bob.address, source: bob.source }
	state.options = { onSelect }
	container = document.createElement('div')
	document.body.append(container)
	root = createRoot(container)
})
afterEach(async () => {
	await act(async () => root.unmount())
	container.remove()
	vi.unstubAllGlobals()
})

test('lists all accounts in name order and initially shows the active account balances', async () => {
	await render()
	expect(accountRows()).toHaveLength(2)
	expect(accountRows()[0].textContent).toMatch(/^Alice/)
	expect(accountRows()[1].textContent).toMatch(/^Bob/)
	expect(
		accountRows().map((button) => button.getAttribute('aria-selected')),
	).toEqual(['false', 'true'])
	expect(balanceAccount()).toBe('bob:ledger')
	expect(
		accountRows().every((row) => !row.querySelector('[data-source]')),
	).toBe(true)
	expect(
		container.querySelector('h3 [data-source]')?.getAttribute('data-source'),
	).toBe('ledger')
})

test('sidebar selection changes balances in place without activating an account or closing the modal', async () => {
	await render()
	await act(async () => accountRows()[0].click())
	expect(balanceAccount()).toBe('alice:extension')
	expect(onSelect).toHaveBeenCalledWith(alice)
	expect(accountRows()[0].getAttribute('aria-selected')).toBe('true')
	expect(setActiveAccount).not.toHaveBeenCalled()
	expect(closeModal).not.toHaveBeenCalled()
	expect(state.activeAccount).toEqual({ address: 'bob', source: 'ledger' })
})

test('the mobile dropdown uses the same selection as the desktop account list', async () => {
	await render()
	const dropdown = container.querySelector('select')!
	await act(async () => {
		dropdown.value = 'alice:extension'
		dropdown.dispatchEvent(new Event('change', { bubbles: true }))
	})
	expect(balanceAccount()).toBe('alice:extension')
	expect(accountRows()[0].getAttribute('aria-selected')).toBe('true')
	expect(setActiveAccount).not.toHaveBeenCalled()
	expect(closeModal).not.toHaveBeenCalled()
})

test.each(['Enter', ' '])(
	'the shared account row supports selection with %s',
	async (key) => {
		await render()
		const event = new KeyboardEvent('keydown', {
			key,
			bubbles: true,
			cancelable: true,
		})
		await act(async () => accountRows()[0].dispatchEvent(event))
		expect(event.defaultPrevented).toBe(true)
		expect(balanceAccount()).toBe('alice:extension')
		expect(setActiveAccount).not.toHaveBeenCalled()
		expect(closeModal).not.toHaveBeenCalled()
	},
)

test('keeps accounts from different sources distinct even when their addresses match', async () => {
	const ledgerAlice = { ...alice, source: 'ledger', name: 'Alice Ledger' }
	state.accounts = [alice, ledgerAlice]
	state.options = { initialAccount: ledgerAlice }
	await render()
	expect(balanceAccount()).toBe('alice:ledger')
	expect(
		accountRows().map((row) =>
			row.querySelector('[data-source]')?.getAttribute('data-source'),
		),
	).toEqual(['extension', 'ledger'])
	expect(
		accountRows().filter(
			(button) => button.getAttribute('aria-selected') === 'true',
		),
	).toHaveLength(1)
	await act(async () => accountRows()[0].click())
	expect(balanceAccount()).toBe('alice:extension')
	expect(
		container.querySelector('h3 [data-source]')?.getAttribute('data-source'),
	).toBe('extension')
})

test('falls back to an available account if the browsed account is removed', async () => {
	state.options = { initialAccount: alice }
	await render()
	state.accounts = [bob]
	await render()
	expect(balanceAccount()).toBe('bob:ledger')
	expect(setActiveAccount).not.toHaveBeenCalled()
})

test('handles an empty account list without displaying another account balances', async () => {
	state.accounts = []
	state.activeAccount = null
	state.options = undefined
	await render()
	expect(container.textContent).toContain('noAccounts')
	expect(container.querySelector('select')!.disabled).toBe(true)
	expect(balanceAccount()).toBeUndefined()
})

test('the Accounts header opens the combined modal and remembers the last browsed account', async () => {
	await act(async () => root.render(createElement(AccountsButton)))
	const button = container.querySelector('button')!
	expect(button.textContent).toBe('accounts')
	await act(async () => button.click())
	expect(openModal).toHaveBeenLastCalledWith({
		key: 'Accounts',
		size: 'lg',
		options: { initialAccount: null, onSelect: expect.any(Function) },
	})
	await act(async () => openModal.mock.calls.at(-1)![0].options.onSelect(alice))
	await act(async () => button.click())
	expect(openModal.mock.calls.at(-1)![0].options.initialAccount).toEqual(alice)
})
