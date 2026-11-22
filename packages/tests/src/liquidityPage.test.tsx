// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
// @vitest-environment jsdom

import { Tooltip as RadixTooltip } from 'radix-ui'
import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import {
	MemoryRouter,
	Route,
	Routes,
	useLocation,
	useNavigate,
} from 'react-router-dom'
import type { AssetHubMarket, ImportedAccount } from 'types'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { Liquidity } from '../../app-swap/src/pages/Liquidity'
import { getFeeTokenIcon } from '../../consts/src/stablecoins'

const mocked = vi.hoisted(() => ({
	serviceApi: { assetHub: { subscribeMarket: vi.fn() } },
	account: {
		address: 'first-account',
		source: 'extension',
	} as ImportedAccount | null,
	canSign: true,
	listeners: [] as {
		address?: string
		onUpdate: (market: AssetHubMarket) => void
		onError: (error: unknown) => void
		stop: ReturnType<typeof vi.fn>
	}[],
}))
const snapshot = (lpBalance = 100_000n): AssetHubMarket => ({
	hash: '0x1234',
	block: 1,
	fetchedAt: Date.now(),
	psm: null,
	pools: [
		{
			asset: 'USDT',
			lpToken: 0,
			reserveDot: 12_878_301_225_779_509n,
			reserveAsset: 2_000_123_456n,
			lpSupply: 1_000_000n,
			lpBalance,
			lpMinBalance: 1n,
			lpFrozen: false,
			fee: 3_000,
			withdrawalFee: 0,
			minLiquidity: 100n,
			fetchedAt: Date.now(),
		},
	],
})

vi.mock('../../hooks/src/index', () => ({
	useApi: () => ({ serviceApi: mocked.serviceApi }),
	useStablecoinBalances: () => ({
		getBalance: () => undefined,
		loading: false,
		refresh: () => Promise.resolve(),
	}),
}))
vi.mock('../../app-swap/src/library/AssetHub', async (importOriginal) => ({
	...(await importOriginal<
		typeof import('../../app-swap/src/library/AssetHub')
	>()),
	TransactionAction: () => null,
}))
vi.mock('../../app-swap/node_modules/@polkadot-cloud/connect/index.js', () => ({
	useActiveAccount: () => ({ activeAccount: mocked.account }),
	useImportedAccounts: () => ({
		getAccount: () => mocked.account,
		accountHasSigner: () => mocked.canSign,
	}),
}))
vi.mock('../../app-swap/src/pages/Liquidity/LiquidityEditor', () => ({
	LiquidityEditor: ({
		pool,
		account,
		canSign,
	}: {
		pool: AssetHubMarket['pools'][number]
		account: ImportedAccount | null
		canSign: boolean
	}) =>
		createElement(
			'section',
			{
				'aria-label': 'liquidity-editor',
				'data-account': account?.address,
				'data-can-sign': canSign,
			},
			pool.lpBalance.toString(),
		),
}))
vi.mock('../../ui-app/src/AccountDropdown', () => ({
	AccountDropdown: () => null,
}))
vi.mock('../../ui-app/src/SubmitTx', () => ({ SubmitTx: () => null }))
vi.mock('../../ui-core/src/base', async () => {
	const { Row } = await import('../../ui-core/src/base/Page/Row')
	const { DataTable } = await import('../../ui-core/src/base/DataTable')
	const { Tooltip } = await import('../../ui-core/src/base/Tooltip')
	return { Page: { Row }, DataTable, Tooltip }
})
vi.mock('../../ui-core/src/input', async () => {
	const { SendForm } = await import('../../ui-core/src/input/SendForm')
	return { SendForm }
})
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string, options?: { pair: string }) =>
			options?.pair ? `${key} ${options.pair}` : key,
	}),
}))

let root: Root
let container: HTMLDivElement
const Location = () => {
	const { pathname, search } = useLocation()
	const navigate = useNavigate()
	return createElement(
		'button',
		{
			type: 'button',
			'aria-label': 'history-back',
			onClick: () => navigate(-1),
		},
		`${pathname}${search}`,
	)
}
const render = (path = '/liquidity') =>
	act(async () => {
		root.render(
			createElement(
				RadixTooltip.Provider,
				null,
				createElement(
					MemoryRouter,
					{ initialEntries: [path] },
					createElement(
						Routes,
						null,
						createElement(Route, {
							path: '/liquidity/:asset?',
							element: createElement(Liquidity),
						}),
					),
					createElement(Location),
				),
			),
		)
	})
const button = (text: string) =>
	[...container.querySelectorAll('button')].find(
		(item) => item.textContent === text,
	)!
const click = (element: HTMLElement) => act(async () => element.click())

beforeEach(() => {
	vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
	vi.clearAllMocks()
	mocked.account = {
		address: 'first-account',
		source: 'extension',
	} as ImportedAccount
	mocked.canSign = true
	mocked.listeners.length = 0
	mocked.serviceApi.assetHub.subscribeMarket.mockImplementation(
		(address, onUpdate, onError) => {
			const stop = vi.fn()
			mocked.listeners.push({ address, onUpdate, onError, stop })
			onUpdate(snapshot())
			return stop
		},
	)
	container = document.createElement('div')
	document.body.append(container)
	root = createRoot(container)
})
afterEach(async () => {
	await act(async () => root.unmount())
	container.remove()
	vi.unstubAllGlobals()
})

test('pool management has its own URL and breadcrumb, returning to the selected list tab', async () => {
	await render()
	const listBreadcrumb = container.querySelector('nav[aria-label="liquidity"]')!
	const listView = listBreadcrumb.nextElementSibling
	expect(
		listBreadcrumb.querySelector('[aria-current="page"]')?.textContent,
	).toBe('overview')
	expect(listView?.querySelector('h1')?.textContent).toBe('liquidity')
	expect(
		listBreadcrumb.querySelector(
			'[aria-current="page"] svg[aria-hidden="true"]',
		),
	).not.toBeNull()
	expect(listBreadcrumb.querySelector('a')).toBeNull()
	const table = container.querySelector('table[aria-label="pools"]')!
	expect(
		Array.from(
			table.querySelectorAll('thead th[scope="col"]'),
			(cell) => cell.textContent,
		),
	).toEqual(['pool', 'reserves', 'swapFee', 'yourShare', 'options'])
	const poolHeader = table.querySelector('tbody th[scope="row"]')!
	expect(poolHeader.textContent).toContain('DOT / USDT')
	expect(
		Array.from(poolHeader.querySelectorAll('img'), (icon) =>
			icon.getAttribute('src'),
		),
	).toEqual([getFeeTokenIcon('DOT'), getFeeTokenIcon('USDT')])
	expect(container.querySelector('[aria-label="liquidity-editor"]')).toBeNull()
	expect(button('refresh')).toBeUndefined()
	await click(button('yourPositions'))
	expect(button('yourPositions').getAttribute('aria-pressed')).toBe('true')
	expect(listBreadcrumb.nextElementSibling).toBe(listView)
	await click(button('manage'))
	expect(
		container.querySelector('[aria-label="history-back"]')?.textContent,
	).toBe('/liquidity/USDT?tab=positions')
	expect(container.querySelector('table')).toBeNull()
	expect(
		container.querySelector('[aria-label="liquidity-editor"]'),
	).not.toBeNull()
	expect(container.querySelector('[aria-current="page"]')?.textContent).toBe(
		'DOT / USDT',
	)
	const breadcrumb = container.querySelector('nav')!
	expect(breadcrumb).toBe(listBreadcrumb)
	expect(breadcrumb.querySelector('a')?.textContent).toBe('overview')
	expect(breadcrumb.querySelector('a svg[aria-hidden="true"]')).not.toBeNull()
	expect(breadcrumb.nextElementSibling).not.toBe(listView)
	expect(breadcrumb.closest('header')).toBeNull()
	expect(breadcrumb.nextElementSibling?.querySelector('h1')?.textContent).toBe(
		'DOT / USDT',
	)
	expect(breadcrumb.nextElementSibling?.querySelector('p')?.textContent).toBe(
		'manageLiquidity DOT / USDT',
	)
	await click(container.querySelector('nav a')!)
	expect(container.querySelector('table')).not.toBeNull()
	expect(button('yourPositions').getAttribute('aria-pressed')).toBe('true')
	expect(mocked.serviceApi.assetHub.subscribeMarket).toHaveBeenCalledOnce()
})

test('pool reserves use K and M with up to four decimal places and reveal exact amounts on focus', async () => {
	vi.stubGlobal(
		'ResizeObserver',
		class {
			observe = vi.fn()
			unobserve = vi.fn()
			disconnect = vi.fn()
		},
	)
	await render()
	const trigger = container.querySelector<HTMLButtonElement>('tbody td button')!
	expect(Array.from(trigger.children, (amount) => amount.textContent)).toEqual([
		'1.2878M',
		'2.0001K',
	])
	const reserveIcons = Array.from(trigger.querySelectorAll('img'), (icon) => [
		icon.alt,
		icon.getAttribute('src'),
	])
	expect(reserveIcons).toEqual([
		['DOT', getFeeTokenIcon('DOT')],
		['USDT', getFeeTokenIcon('USDT')],
	])
	await act(async () => trigger.focus())
	const tooltip = document.getElementById(
		trigger.getAttribute('aria-describedby') ?? '',
	)
	expect(tooltip?.getAttribute('role')).toBe('tooltip')
	expect(tooltip?.textContent).toContain('1,287,830.1225779509 DOT')
	expect(tooltip?.textContent).toContain('2,000.123456 USDT')
})

test('a direct pool URL and browser back navigation work', async () => {
	await render('/liquidity/USDT')
	expect(container.querySelector('h1')?.textContent).toBe('DOT / USDT')
	await click(container.querySelector('nav a')!)
	await click(button('manage'))
	await click(container.querySelector('[aria-label="history-back"]')!)
	expect(container.querySelector('table')).not.toBeNull()
})

test('liquidity mode tabs sit above the card and switch the form inside it', async () => {
	const { LiquidityEditor } = await vi.importActual<
		typeof import('../../app-swap/src/pages/Liquidity/LiquidityEditor')
	>('../../app-swap/src/pages/Liquidity/LiquidityEditor')
	await act(async () => {
		root.render(
			createElement(LiquidityEditor, {
				pool: snapshot().pools[0],
				exchange: {
					...mocked.serviceApi.assetHub,
					market: vi.fn(),
					quotes: vi.fn(),
					swap: vi.fn(),
					addLiquidity: vi.fn(),
					removeLiquidity: vi.fn(),
				},
				account: null,
				canSign: false,
				fresh: false,
			}),
		)
	})
	const addTab = button('addLiquidity')
	const removeTab = button('removeLiquidity')
	const tabs = addTab.closest('section')!
	const card = tabs.nextElementSibling!
	expect(tabs.contains(removeTab)).toBe(true)
	expect(addTab.getAttribute('aria-pressed')).toBe('true')
	expect(card.textContent).toContain('depositDot')
	await click(removeTab)
	expect(removeTab.getAttribute('aria-pressed')).toBe('true')
	const slider = card.querySelector<HTMLInputElement>('input[type="range"]')!
	expect(slider.value).toBe('100')
	const half = button('50%')
	await click(half)
	expect(half.getAttribute('aria-pressed')).toBe('true')
	expect(slider.value).toBe('50')
	expect(slider.getAttribute('aria-valuetext')).toBe('50%')
	await act(async () => {
		Object.getOwnPropertyDescriptor(
			HTMLInputElement.prototype,
			'value',
		)!.set!.call(slider, '60')
		slider.dispatchEvent(new Event('input', { bubbles: true }))
	})
	expect(slider.getAttribute('aria-valuetext')).toBe('60%')
	expect(half.getAttribute('aria-pressed')).toBe('false')
	await click(addTab)
	expect(card.textContent).toContain('depositDot')
})

test('invalid pool URLs return to Liquidity', async () => {
	await render('/liquidity/unsupported')
	expect(
		container.querySelector('[aria-label="history-back"]')?.textContent,
	).toBe('/liquidity')
	expect(container.querySelector('table')).not.toBeNull()
})

test('subscription updates remove closed positions and recover from errors without refreshing', async () => {
	await render('/liquidity?tab=positions')
	const listener = mocked.listeners[0]
	await act(async () => listener.onError(new Error('Connection interrupted')))
	expect(container.querySelector('[role="alert"]')?.textContent).toBe(
		'Connection interrupted',
	)
	await act(async () => listener.onUpdate(snapshot(0n)))
	expect(container.querySelector('[role="alert"]')).toBeNull()
	expect(container.querySelector('tbody')?.children).toHaveLength(0)
	expect(container.textContent).toContain('noPositions')
	await click(button('pools'))
	expect(container.querySelector('tbody')?.children).toHaveLength(1)
})

test('account changes unsubscribe and ignore late updates from the previous account', async () => {
	await render('/liquidity/USDT')
	const previous = mocked.listeners[0]
	expect(previous.address).toBe('first-account')
	mocked.account = {
		address: 'second-account',
		source: 'extension',
	} as ImportedAccount
	await render('/liquidity/USDT')
	expect(previous.stop).toHaveBeenCalledOnce()
	expect(mocked.listeners[1].address).toBe('second-account')
	expect(
		container
			.querySelector('[aria-label="liquidity-editor"]')
			?.getAttribute('data-account'),
	).toBe('second-account')
	await act(async () => mocked.listeners[1].onUpdate(snapshot(50n)))
	await act(async () => previous.onUpdate(snapshot(9_999n)))
	expect(
		container.querySelector('[aria-label="liquidity-editor"]')?.textContent,
	).toBe('50')
	await act(async () => root.unmount())
	expect(mocked.listeners[1].stop).toHaveBeenCalledOnce()
	root = createRoot(container)
})

test('the positions tab prompts for an account when none is connected', async () => {
	mocked.account = null
	await render('/liquidity?tab=positions')
	expect(container.textContent).toContain('selectAccountForPositions')
	expect(container.querySelector('table')).toBeNull()
	expect(mocked.listeners[0].address).toBeUndefined()
})

test('read-only active accounts can view their positions without enabling signing', async () => {
	mocked.canSign = false
	await render('/liquidity/USDT')
	expect(mocked.listeners[0].address).toBe('first-account')
	expect(
		container
			.querySelector('[aria-label="liquidity-editor"]')
			?.getAttribute('data-can-sign'),
	).toBe('false')
})
