// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
// @vitest-environment jsdom

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

const mocked = vi.hoisted(() => ({
	serviceApi: { assetHub: { subscribeMarket: vi.fn() } },
	account: {
		address: 'first-account',
		source: 'extension',
	} as ImportedAccount | null,
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
			reserveDot: 1_000_000_000n,
			reserveAsset: 2_000_000_000n,
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
}))
vi.mock('../../app-swap/src/pages/Send/hooks/useSendAccounts', () => ({
	useSendAccounts: () => ({
		fromAccount: mocked.account,
		accountsWithSigners: mocked.account ? [mocked.account] : [],
		setFromAccount: vi.fn(),
	}),
}))
vi.mock('../../app-swap/src/pages/Liquidity/LiquidityEditor', () => ({
	LiquidityEditor: ({ pool }: { pool: AssetHubMarket['pools'][number] }) =>
		createElement(
			'section',
			{ 'aria-label': 'liquidity-editor' },
			pool.lpBalance.toString(),
		),
}))
vi.mock('../../ui-app/src/AccountDropdown', () => ({
	AccountDropdown: () => null,
}))
vi.mock('../../ui-app/src/SubmitTx', () => ({ SubmitTx: () => null }))
vi.mock('../../ui-core/src/base', async () => {
	const { Row } = await import('../../ui-core/src/base/Page/Row')
	return { Page: { Row } }
})
vi.mock('../../ui-core/src/input', async () => {
	const { SendForm } = await import('../../ui-core/src/input/SendForm')
	return { SendForm }
})
vi.mock('react-i18next', () => ({
	useTranslation: () => ({ t: (key: string) => key }),
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
	expect(container.querySelector('table')).not.toBeNull()
	expect(container.querySelector('[aria-label="liquidity-editor"]')).toBeNull()
	expect(button('refresh')).toBeUndefined()
	await click(button('yourPositions'))
	expect(button('yourPositions').getAttribute('aria-pressed')).toBe('true')
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
	expect(breadcrumb.closest('header')).toBeNull()
	expect(breadcrumb.nextElementSibling?.querySelector('h1')?.textContent).toBe(
		'DOT / USDT',
	)
	await click(container.querySelector('nav a')!)
	expect(container.querySelector('table')).not.toBeNull()
	expect(button('yourPositions').getAttribute('aria-pressed')).toBe('true')
	expect(mocked.serviceApi.assetHub.subscribeMarket).toHaveBeenCalledOnce()
})

test('a direct pool URL and browser back navigation work', async () => {
	await render('/liquidity/USDT')
	expect(container.querySelector('h1')?.textContent).toBe('DOT / USDT')
	await click(container.querySelector('nav a')!)
	await click(button('manage'))
	await click(container.querySelector('[aria-label="history-back"]')!)
	expect(container.querySelector('table')).not.toBeNull()
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
	mocked.account = {
		address: 'second-account',
		source: 'extension',
	} as ImportedAccount
	await render('/liquidity/USDT')
	expect(previous.stop).toHaveBeenCalledOnce()
	expect(mocked.listeners[1].address).toBe('second-account')
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
})
