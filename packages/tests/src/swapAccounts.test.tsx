// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
// @vitest-environment jsdom

import { act, type ComponentType, createElement, Suspense } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { ImportedAccount, StablecoinBalance } from 'types'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { AccountsButton } from '../../app-swap/src/library/Accounts'
import { Overlays } from '../../app-swap/src/Overlays'
import {
	resetStablecoinBalances,
	setStablecoinBalance,
	setStablecoinBalances,
	setStablecoinBalancesError,
	setStablecoinBalancesSyncing,
} from '../../global-bus/src/stablecoinBalances'
import { useDefaultCategories } from '../../hooks/src/useDefaultCategories'
import type { UseAccountListCategories } from '../../hooks/src/useStakingAccountCategories'
import {
	AccountBalances,
	type AccountBalancesOptions,
} from '../../ui-modals/src/AccountBalances'

const { state, openModal, closeModal, setActiveAccount, onSelect, serviceApi } =
	vi.hoisted(() => ({
		state: {
			accounts: [] as ImportedAccount[],
			activeAccount: null as { address: string; source: string } | null,
			options: undefined as Partial<AccountBalancesOptions> | undefined,
			dotPrice: 2,
		},
		openModal: vi.fn(),
		closeModal: vi.fn(),
		setActiveAccount: vi.fn(),
		onSelect: vi.fn(),
		serviceApi: {
			stablecoins: {
				query: { balances: vi.fn().mockResolvedValue(undefined) },
			},
		},
	}))

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
			) ?? null,
	}),
}))
vi.mock(
	'../../app-swap/node_modules/@polkadot-cloud/ui/polkicon/index.js',
	() => ({ Polkicon: () => null }),
)
vi.mock('../../app-swap/node_modules/react-i18next/dist/es/index.js', () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}))
vi.mock('../../ui-overlay/src/index', async () => {
	const { lazyNamed } = await import('../../ui-overlay/src/lazyNamed')
	return {
		lazyNamed,
		useOverlay: () => ({
			modal: { openModal, closeModal, config: { options: state.options } },
		}),
		Overlay: ({ modals }: { modals: Record<string, ComponentType> }) =>
			createElement(
				Suspense,
				{ fallback: null },
				createElement(modals.AccountBalances),
			),
	}
})
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
vi.mock('../../hooks/src/index', async () => {
	const { useStablecoinBalancesState } = await import(
		'../../hooks/src/useStablecoinBalances'
	)
	return {
		useStablecoinBalancesState,
		useTokenPrices: () => ({ price: state.dotPrice }),
	}
})
vi.mock('../../hooks/src/useApi', () => ({
	useApi: () => ({ serviceApi }),
}))
vi.mock('../../ui-app/src/AccountDropdown', () => ({
	AccountSourceIcon: ({
		source,
		className,
	}: {
		source: string
		className: string
	}) =>
		createElement(
			'span',
			{ className },
			createElement('svg', { 'data-source': source }),
		),
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
vi.mock('../../ui-modals/src/AccountBalances/AllBalances', () => ({
	AllBalances: ({ account }: { account: ImportedAccount }) =>
		createElement('div', {
			'data-balances': `${account.address}:${account.source}`,
		}),
}))
vi.mock('../../ui-modals/src/AccountBalances/StablecoinMix', () => ({
	StablecoinMix: ({ account }: { account: ImportedAccount }) =>
		createElement('div', {
			'data-mix': `${account.address}:${account.source}`,
		}),
}))
vi.mock('../../ui-buttons/src/index', async () => {
	const { Standalone } = await import(
		'../../ui-buttons/src/ButtonAccount/Standalone'
	)
	const { PopoverTab } = await import('../../ui-buttons/src/PopoverTab')
	return { ButtonAccount: { Standalone }, PopoverTab }
})

const alice = {
	name: 'Alice',
	address: 'alice',
	source: 'extension',
} as ImportedAccount
const bob = { name: 'Bob', address: 'bob', source: 'ledger' } as ImportedAccount
const balance = (
	symbol: StablecoinBalance['symbol'],
	free: bigint,
	chain: StablecoinBalance['chain'] = 'statemint',
): StablecoinBalance => ({
	chain,
	symbol,
	free,
	frozen: 0n,
	existentialDeposit: 0n,
	decimals: symbol === 'DOT' ? 10 : 6,
})
const setBalances = (address: string, balances: StablecoinBalance[]) => {
	const requestId = setStablecoinBalancesSyncing(address)
	setStablecoinBalances(address, balances, requestId)
}
let root: Root
let container: HTMLDivElement
const render = (useCategories?: UseAccountListCategories) =>
	act(async () =>
		root.render(createElement(AccountBalances, { useCategories })),
	)
const accountRows = () => [
	...container.querySelectorAll<HTMLElement>('[role="option"]'),
]
const balanceAccount = () =>
	container.querySelector('[data-balances]')?.getAttribute('data-balances')

beforeEach(() => {
	vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
	vi.clearAllMocks()
	resetStablecoinBalances()
	state.dotPrice = 2
	setBalances('alice', [balance('DOT', 0n)])
	setBalances('bob', [balance('DOT', 0n)])
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
	resetStablecoinBalances()
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

test('supports name ordering without category headings using the default categories hook', async () => {
	await render(useDefaultCategories)
	expect(accountRows().map((row) => row.textContent)).toEqual(['Alice', 'Bob'])
	expect(container.querySelector('legend')).toBeNull()
	expect(balanceAccount()).toBe('bob:ledger')
})

test('falls back to name order when both selected and active accounts are unavailable', async () => {
	const removed = { ...alice, address: 'removed' }
	state.options = { initialAccount: removed }
	state.activeAccount = removed
	setBalances('bob', [balance('USDC', 30_000_000n)])
	await render()
	expect(accountRows().map((row) => row.textContent)).toEqual(['Bob', 'Alice'])
	expect(balanceAccount()).toBe('alice:extension')
	expect(state.accounts).toEqual([bob, alice])
})

test('accepts custom category labels and ordering while omitting empty or removed accounts', async () => {
	await render(() => [
		{ key: 'empty', labelKey: 'emptyLabel', items: [] },
		{
			key: 'stale',
			labelKey: 'staleLabel',
			items: [{ address: 'removed', source: 'ledger' }],
		},
		{ key: 'featured', labelKey: 'featuredLabel', items: [bob] },
		{ key: 'other', items: [alice] },
	])
	expect(accountRows().map((row) => row.textContent)).toEqual(['Bob', 'Alice'])
	expect(
		[...container.querySelectorAll('legend')].map((item) => item.textContent),
	).toEqual(['featuredLabel'])
	expect(container.querySelectorAll('fieldset')).toHaveLength(2)
	await act(async () => accountRows()[1].click())
	expect(balanceAccount()).toBe('alice:extension')
})

test('the swap overlay loads AccountBalances with its default stablecoin categories', async () => {
	setBalances('bob', [balance('USDC', 30_000_000n)])
	await act(async () => root.render(createElement(Overlays)))
	await act(async () => vi.dynamicImportSettled())
	expect(accountRows().map((row) => row.textContent)).toEqual(['Bob', 'Alice'])
	expect(container.querySelector('legend')?.textContent).toBe('withBalances')
	expect(balanceAccount()).toBe('bob:ledger')
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

test('switching views preserves selection and only refreshes balances when the account address changes', async () => {
	const refresh = serviceApi.stablecoins.query.balances
	await render()
	expect(refresh).toHaveBeenCalledExactlyOnceWith('bob')
	await act(async () => accountRows()[0].click())
	expect(refresh).toHaveBeenLastCalledWith('alice')
	expect(refresh).toHaveBeenCalledTimes(2)
	const tab = (label: string) =>
		[...container.querySelectorAll('button')].find(
			(button) => button.textContent === label,
		)!
	await act(async () => tab('mix').click())
	expect(container.querySelector('[data-mix]')?.getAttribute('data-mix')).toBe(
		'alice:extension',
	)
	expect(tab('mix').getAttribute('aria-pressed')).toBe('true')
	expect(refresh).toHaveBeenCalledTimes(2)
	await act(async () => accountRows()[1].click())
	expect(container.querySelector('[data-mix]')?.getAttribute('data-mix')).toBe(
		'bob:ledger',
	)
	expect(refresh).toHaveBeenLastCalledWith('bob')
	expect(refresh).toHaveBeenCalledTimes(3)
	await act(async () => tab('balances').click())
	expect(balanceAccount()).toBe('bob:ledger')
	expect(tab('balances').getAttribute('aria-pressed')).toBe('true')
	expect(refresh).toHaveBeenCalledTimes(3)
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

test('the Accounts header opens AccountBalances and remembers the last browsed account', async () => {
	await act(async () => root.render(createElement(AccountsButton)))
	const button = container.querySelector('button')!
	expect(button.textContent).toBe('accounts')
	await act(async () => button.click())
	expect(openModal).toHaveBeenLastCalledWith({
		key: 'AccountBalances',
		size: 'lg',
		options: { initialAccount: null, onSelect: expect.any(Function) },
	})
	await act(async () => openModal.mock.calls.at(-1)![0].options.onSelect(alice))
	await act(async () => button.click())
	expect(openModal.mock.calls.at(-1)![0].options.initialAccount).toEqual(alice)
})

test('groups funded Hub accounts first by stablecoin balance and ignores DOT and Hydration holdings', async () => {
	const charlie = { ...alice, name: 'Charlie', address: 'charlie' }
	const zoe = { ...alice, name: 'Zoe', address: 'zoe' }
	state.accounts = [alice, bob, charlie, zoe]
	setBalances('alice', [
		balance('USDC', 5_000_000n),
		balance('USDT', 10_000_000n),
		balance('DOT', 1_000_000_000_000n),
	])
	setBalances('bob', [balance('DOT', 100_000_000_000n)])
	setBalances('charlie', [balance('USDT', 30_000_000n)])
	setBalances('zoe', [balance('USDC', 999_000_000n, 'hydration')])
	await render()

	expect(accountRows().map((row) => row.textContent)).toEqual([
		'Charlie',
		'Alice',
		'Bob',
		'Zoe',
	])
	expect(
		[...container.querySelectorAll('legend')].map((item) => item.textContent),
	).toEqual(['withBalances', 'noBalance'])
	expect(
		[...container.querySelectorAll('fieldset')].map((group) =>
			[...group.querySelectorAll('[role="option"]')].map(
				(row) => row.textContent,
			),
		),
	).toEqual([
		['Charlie', 'Alice'],
		['Bob', 'Zoe'],
	])
	expect(balanceAccount()).toBe('bob:ledger')
})

test('live stablecoin balances reorder the menu without changing the selected account', async () => {
	setBalances('alice', [balance('USDC', 30_000_000n)])
	setBalances('bob', [
		balance('USDT', 20_000_000n),
		balance('DOT', 100_000_000_000n),
	])
	await render()
	expect(accountRows()[0].textContent).toBe('Alice')
	state.dotPrice = 4
	await render()
	expect(accountRows()[0].textContent).toBe('Alice')
	await act(async () =>
		setStablecoinBalance('bob', balance('USDT', 40_000_000n)),
	)
	expect(accountRows()[0].textContent).toBe('Bob')
	await act(async () =>
		setStablecoinBalance('alice', balance('USDC', 50_000_000n)),
	)
	expect(accountRows()[0].textContent).toBe('Alice')
	expect(balanceAccount()).toBe('bob:ledger')
	expect(setActiveAccount).not.toHaveBeenCalled()
	expect(closeModal).not.toHaveBeenCalled()
})

test('unloaded or failed balances are not labelled as empty', async () => {
	const pending = { ...alice, address: 'pending', name: 'Pending' }
	const failed = { ...alice, address: 'failed', name: 'Failed' }
	state.accounts = [alice, pending, failed]
	const requestId = setStablecoinBalancesSyncing('failed')
	setStablecoinBalancesError('failed', requestId)
	await render()
	const groups = [...container.querySelectorAll('fieldset')]
	expect(
		groups.map((group) => group.querySelector('legend')?.textContent),
	).toEqual(['syncingBalances', 'balanceUnavailable', 'noBalance'])
	expect(groups[2].querySelector('[role="option"]')?.textContent).toBe('Alice')
	await act(async () => setBalances('pending', [balance('DOT', 0n)]))
	expect(container.querySelector('legend')?.textContent).toBe(
		'balanceUnavailable',
	)
})

test('tiny stablecoin balances and duplicate sources remain in the funded group without a DOT price', async () => {
	state.dotPrice = 0
	const ledgerAlice = { ...alice, source: 'ledger', name: 'Alice Ledger' }
	state.accounts = [bob, alice, ledgerAlice]
	setBalances('alice', [balance('DOT', 1n), balance('dotUSD', 1n)])
	setBalances('bob', [balance('DOT', 100_000_000_000n)])
	await render()
	const funded = container.querySelector('fieldset')!
	expect(funded.querySelector('legend')?.textContent).toBe('withBalances')
	expect(
		[...funded.querySelectorAll('[role="option"]')].map(
			(row) => row.textContent,
		),
	).toEqual(['Alice', 'Alice Ledger'])
	expect(funded.querySelectorAll('[data-source]')).toHaveLength(2)
})
