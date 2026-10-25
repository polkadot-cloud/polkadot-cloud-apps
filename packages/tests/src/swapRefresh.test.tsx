// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
// @vitest-environment jsdom

import type { SubmittableExtrinsic } from 'dedot'
import { act, createElement, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type {
	AssetHubMarket,
	AssetHubSwapQuote,
	ImportedAccount,
	ServiceInterface,
	SubmitTxProps,
} from 'types'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { Swap } from '../../app-swap/src/pages/Swap'
import { _uids } from '../../global-bus/src/txSubmit/private'

const { state, market, quotes, swap, estimate, refreshBalances, views } =
	vi.hoisted(() => ({
		state: {
			serviceApi: undefined as unknown as ServiceInterface,
			account: { address: 'alice', source: 'extension' } as ImportedAccount,
		},
		market: vi.fn(),
		quotes: vi.fn(),
		swap: vi.fn(),
		estimate: vi.fn(),
		refreshBalances: vi.fn(),
		views: [] as { valid: boolean; fee: bigint; uid: number }[],
	}))

vi.mock(
	'../../app-swap/node_modules/@polkadot-cloud/util-dedot/index.js',
	() => ({
		isValidAddress: (address: string) => Boolean(address),
	}),
)
vi.mock('../../hooks/src/useApi', () => ({
	useApi: () => ({ serviceApi: state.serviceApi }),
}))
vi.mock('../../hooks/src/index', async () => {
	const { useTxMeta } = await import('../../hooks/src/useTxMeta')
	const balances = ['DOT', 'USDT', 'dotUSD', 'USDC'].map((symbol) => ({
		chain: 'statemint',
		symbol,
		free: 1_000_000_000_000n,
		frozen: 0n,
		existentialDeposit: 1n,
		decimals: symbol === 'DOT' ? 10 : 6,
	}))
	return {
		useApi: () => ({ serviceApi: state.serviceApi }),
		useTxMeta,
		useStablecoinBalances: () => ({
			balances,
			getBalance: (_chain: string, symbol: string) =>
				balances.find((balance) => balance.symbol === symbol),
			loading: false,
			refresh: refreshBalances,
		}),
		useTheme: () => ({ themeElementRef: { current: null } }),
	}
})
vi.mock('../../app-swap/src/pages/Send/hooks/useSendAccounts', () => ({
	useSendAccounts: () => ({
		fromAccount: state.account,
		accounts: [state.account],
		accountsWithSigners: [state.account],
		setFromAccount: vi.fn(),
	}),
}))
vi.mock(
	'../../tx-submit/node_modules/@polkadot-cloud/connect/index.js',
	() => ({
		useExtensionAccounts: () => ({ getExtensionAccount: vi.fn() }),
		useExtensions: () => ({ extensionsStatus: {} }),
		useImportedAccounts: () => ({
			getAccount: () => state.account,
			requiresManualSign: () => false,
		}),
	}),
)
vi.mock(
	'../../tx-submit/node_modules/@polkadot-cloud/connect-ledger/index.js',
	() => ({ useLedger: () => ({}), signLedgerPayload: vi.fn() }),
)
vi.mock('../../hooks/src/useAccountBalances', () => ({
	useAccountBalances: () => ({
		balances: { balanceTxFees: 1_000_000_000_000n },
	}),
}))
vi.mock('../../hooks/src/useNetwork', () => ({
	useNetwork: () => ({ network: 'polkadot' }),
}))
vi.mock('../../hooks/src/useProxySupported', () => ({
	useProxySupported: () => ({ isProxySupported: () => false }),
}))
vi.mock('../../ui-overlay/src/index', () => ({ usePrompt: () => ({}) }))
vi.mock('../../tx-submit/src/QRSignPrompt', () => ({
	QRSignPrompt: () => null,
}))
vi.mock('../../app-swap/node_modules/react-i18next/dist/es/index.js', () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}))
vi.mock('../../ui-app/src/AccountDropdown', () => ({
	AccountDropdown: () => null,
}))
vi.mock('../../ui-app/src/Dropdown', () => ({ Dropdown: () => null }))
vi.mock('../../ui-app/src/BalanceInput', () => ({
	BalanceInputMulti: ({
		label,
		value,
		onChange,
		readOnly,
	}: {
		label: string
		value: string
		onChange?: (value: string) => void
		readOnly?: boolean
	}) =>
		createElement('input', {
			'aria-label': label,
			value,
			readOnly,
			onInput: (event: { currentTarget: HTMLInputElement }) =>
				onChange?.(event.currentTarget.value),
		}),
}))
vi.mock('../../ui-app/src/SubmitTx', async () => {
	const { useTxMeta } = await import('../../hooks/src/useTxMeta')
	return {
		SubmitTx: ({ uid, valid, submitText }: SubmitTxProps) => {
			const { getTxSubmission } = useTxMeta()
			const fee = getTxSubmission(uid)?.fee ?? 0n
			views.push({ uid, fee, valid })
			return createElement(
				'button',
				{ type: 'button', 'data-submit': uid, disabled: !valid },
				submitText,
				createElement('span', { 'data-fee': true }, fee.toString()),
			)
		},
	}
})
vi.mock('../../ui-buttons/src/index', async () => {
	const { ButtonSecondary } = await import(
		'../../ui-buttons/src/ButtonSecondary'
	)
	return { ButtonSecondary }
})
vi.mock('../../ui-core/src/base', async () => {
	const { ShineText } = await import('../../ui-core/src/base/ShineText')
	const Wrapper = ({ children }: { children: ReactNode }) =>
		createElement('div', null, children)
	return {
		Page: { Row: Wrapper },
		ShineText,
		Tooltip: Wrapper,
		StatusCard: Wrapper,
	}
})
vi.mock('../../ui-core/src/input', () => {
	const Wrapper = ({ children }: { children: ReactNode }) =>
		createElement('div', null, children)
	return {
		SendForm: {
			Container: Wrapper,
			Card: Wrapper,
			Segment: Wrapper,
			DirectionIndicator: Wrapper,
			Notes: Wrapper,
			Note: ({ label, children }: { label: string; children: ReactNode }) =>
				createElement('div', { 'data-note': label }, label, children),
			Action: Wrapper,
			Header: () => null,
		},
	}
})

const snapshot = (): AssetHubMarket => ({
	hash: `0x${Date.now().toString(16)}`,
	block: 1,
	fetchedAt: Date.now(),
	pools: [],
	psm: null,
})
const quote = (fetchedAt: number, amountOut = 99_000n): AssetHubSwapQuote => ({
	assetIn: 'USDT',
	assetOut: 'dotUSD',
	amount: 100_000n,
	mode: 'exactIn',
	kind: 'amm',
	path: ['USDT', 'DOT', 'dotUSD'],
	amountIn: 100_000n,
	amountOut,
	fee: 3_000,
	priceImpactBps: 0,
	hash: '0x1234',
	fetchedAt,
})
const deferred = <T,>() => {
	let resolve!: (value: T) => void
	let reject!: (error: Error) => void
	const promise = new Promise<T>((done, fail) => {
		resolve = done
		reject = fail
	})
	return { promise, resolve, reject }
}

let root: Root
let container: HTMLDivElement
const advance = (milliseconds: number) =>
	act(async () => vi.advanceTimersByTimeAsync(milliseconds))
const enterAmount = (value: string, label = 'youPay') =>
	act(async () => {
		const input = container.querySelector<HTMLInputElement>(
			`input[aria-label="${label}"]`,
		)!
		input.value = value
		input.dispatchEvent(new Event('input', { bubbles: true }))
	})
const submitButton = () =>
	container.querySelector<HTMLButtonElement>('[data-submit]')!
const feeText = () => container.querySelector('[data-fee]')!.textContent
const routeView = () =>
	container.querySelector<HTMLElement>('section[aria-label="route"]')!
const configure = async () => {
	await act(async () => root.render(createElement(Swap)))
	await enterAmount('0.1')
	await advance(250)
	expect(submitButton().disabled).toBe(false)
	expect(feeText()).toBe('100')
}

beforeEach(() => {
	vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
	vi.useFakeTimers()
	vi.setSystemTime(100_000)
	vi.resetAllMocks()
	_uids.next([])
	views.length = 0
	market.mockImplementation(async () => snapshot())
	quotes.mockImplementation(async (data: AssetHubMarket) => [
		quote(data.fetchedAt),
	])
	estimate.mockResolvedValue(100n)
	refreshBalances.mockResolvedValue(undefined)
	swap.mockImplementation(
		(data: AssetHubSwapQuote) =>
			({
				toHex: () => `0x${data.amountOut.toString(16)}`,
				call: { pallet: 'AssetConversion', palletCall: { name: 'Swap' } },
			}) as SubmittableExtrinsic,
	)
	state.serviceApi = {
		assetHub: { market, quotes, swap },
		stablecoins: {
			fee: { estimate, paymentOptions: () => undefined },
		},
	} as unknown as ServiceInterface
	container = document.createElement('div')
	document.body.append(container)
	root = createRoot(container)
})

afterEach(async () => {
	await act(async () => root.unmount())
	container.remove()
	_uids.next([])
	vi.useRealTimers()
	vi.unstubAllGlobals()
})

test('polling retains the route, slippage, fee and enabled button until the replacement quote and fee are ready', async () => {
	await configure()
	const button = submitButton()
	const fee = container.querySelector('[data-fee]')
	const route = routeView()
	expect([...route.querySelectorAll('img')].map((icon) => icon.alt)).toEqual([
		'USDT',
		'DOT',
		'dotUSD',
	])
	const slippage = container.querySelector<HTMLInputElement>(
		'input[type="range"]',
	)
	const conversion = container.querySelector('[data-note="conversionFee"]')
	const minimum = container.querySelector('[data-note="minimumReceived"]')
	const uid = button.dataset.submit
	const pendingQuotes = deferred<AssetHubSwapQuote[]>()
	const pendingFee = deferred<bigint>()
	quotes.mockReturnValueOnce(pendingQuotes.promise)
	estimate.mockReturnValueOnce(pendingFee.promise)
	views.length = 0
	await advance(15_000)
	await advance(250)
	expect(submitButton()).toBe(button)
	expect(button.disabled).toBe(false)
	expect(routeView()).toBe(route)
	expect(container.querySelector<HTMLInputElement>('input[type="range"]')).toBe(
		slippage,
	)
	expect(container.querySelector('[data-note="conversionFee"]')).toBe(
		conversion,
	)
	expect(container.querySelector('[data-note="minimumReceived"]')).toBe(minimum)
	expect(container.querySelector('[data-fee]')).toBe(fee)
	expect(feeText()).toBe('100')

	await act(async () => pendingQuotes.resolve([quote(115_000, 98_000n)]))
	expect(feeText()).toBe('100')
	expect(button.disabled).toBe(false)
	expect(
		container.querySelector<HTMLInputElement>('[aria-label="youReceive"]')!
			.value,
	).toBe('0.099')
	await act(async () => pendingFee.resolve(120n))
	expect(submitButton()).toBe(button)
	expect(button.dataset.submit).toBe(uid)
	expect(button.disabled).toBe(false)
	expect(feeText()).toBe('120')
	expect(routeView()).toBe(route)
	expect(container.querySelector<HTMLInputElement>('input[type="range"]')).toBe(
		slippage,
	)
	expect(container.querySelector('[data-note="conversionFee"]')).toBe(
		conversion,
	)
	expect(container.querySelector('[data-note="minimumReceived"]')).toBe(minimum)
	expect(
		container.querySelector<HTMLInputElement>('[aria-label="youReceive"]')!
			.value,
	).toBe('0.098')
	expect(views.every((view) => view.valid && view.fee > 0n)).toBe(true)
	expect(estimate).toHaveBeenCalledTimes(2)
})

test('editing the input invalidates the old quote immediately and ignores an in-flight refresh', async () => {
	await configure()
	const route = routeView()
	const minimum = container.querySelector('[data-note="minimumReceived"]')!
	const slippage = container.querySelector<HTMLInputElement>(
		'input[type="range"]',
	)!
	const pendingQuotes = deferred<AssetHubSwapQuote[]>()
	quotes.mockReturnValueOnce(pendingQuotes.promise)
	await advance(15_000)
	await advance(250)
	await enterAmount('0.2')
	expect(submitButton().disabled).toBe(true)
	expect(routeView()).toBe(route)
	expect(route.textContent).toContain('fetchingQuote')
	expect(container.querySelector('[data-note="minimumReceived"]')).toBe(minimum)
	expect(minimum.textContent).toBe('minimumReceived—')
	expect(slippage.disabled).toBe(false)
	expect(
		container.querySelector('[data-note="conversionFee"]')!.textContent,
	).toBe('conversionFee—')
	await act(async () => pendingQuotes.resolve([quote(115_000, 98_000n)]))
	expect(submitButton().disabled).toBe(true)
	expect(routeView()).toBe(route)
	expect(route.textContent).toContain('fetchingQuote')
})

test('the automatic route and quote rows keep their placeholders until the quote and network fee are ready', async () => {
	const pendingFee = deferred<bigint>()
	estimate.mockReturnValueOnce(pendingFee.promise)
	await act(async () => root.render(createElement(Swap)))
	const route = routeView()
	const minimum = container.querySelector('[data-note="minimumReceived"]')!
	const slippage = container.querySelector<HTMLInputElement>(
		'input[type="range"]',
	)!
	expect(route.querySelector('[aria-live="polite"]')!.textContent).toBe('—')
	expect(minimum.textContent).toBe('minimumReceived—')
	expect(slippage.disabled).toBe(false)
	for (const label of ['networkFee', 'conversionFee', 'priceImpact']) {
		expect(container.querySelector(`[data-note="${label}"]`)!.textContent).toBe(
			`${label}—`,
		)
	}
	await enterAmount('0.1')
	await advance(250)
	expect(routeView()).toBe(route)
	expect(route.querySelector('[aria-live="polite"]')!.textContent).toBe(
		'fetchingQuote',
	)
	expect(minimum.textContent).toBe('minimumReceived—')
	expect(submitButton().disabled).toBe(true)
	await act(async () => pendingFee.resolve(100n))
	expect(routeView()).toBe(route)
	expect([...route.querySelectorAll('img')].map((icon) => icon.alt)).toEqual([
		'USDT',
		'DOT',
		'dotUSD',
	])
	expect(container.querySelector('[data-note="minimumReceived"]')).toBe(minimum)
	expect(minimum.textContent).toBe('minimumReceived0.098505 dotUSD')
	expect(slippage.disabled).toBe(false)
	expect(submitButton().disabled).toBe(false)
	const networkFee = container.querySelector('[data-note="networkFee"]')!
	expect(networkFee.nextElementSibling?.getAttribute('data-note')).toBe(
		'conversionFee',
	)
	expect(
		networkFee.nextElementSibling?.nextElementSibling?.getAttribute(
			'data-note',
		),
	).toBe('priceImpact')
})

test.each(['exactIn', 'exactOut'] as const)(
	'%s slippage starts collapsed, updates the quote, keeps its value when toggled and resets to the default',
	async (mode) => {
		quotes.mockResolvedValue([{ ...quote(Date.now()), mode }])
		await act(async () => root.render(createElement(Swap)))
		const toggle = container.querySelector<HTMLButtonElement>(
			'button[aria-controls][aria-expanded]',
		)!
		const panel = document.getElementById(
			toggle.getAttribute('aria-controls')!,
		)!
		const slider = panel.querySelector('input')!
		const reset = panel.querySelector<HTMLButtonElement>(
			'[aria-label="resetSlippage"]',
		)!
		expect(toggle.textContent).toBe('slippageSettings')
		expect(toggle.getAttribute('aria-expanded')).toBe('false')
		expect(panel.hidden).toBe(true)
		expect(slider.value).toBe('50')
		expect(slider.getAttribute('aria-valuetext')).toBe('0.5%')
		expect(reset.disabled).toBe(true)
		if (mode === 'exactOut') {
			await act(async () =>
				container
					.querySelector<HTMLButtonElement>('[aria-label="exactOutput"]')!
					.click(),
			)
		}
		await enterAmount('0.1', mode === 'exactIn' ? 'youPay' : 'youReceive')
		await advance(250)
		await act(async () => toggle.click())
		expect(panel.hidden).toBe(false)
		expect(toggle.getAttribute('aria-expanded')).toBe('true')
		await act(async () => {
			Object.getOwnPropertyDescriptor(
				HTMLInputElement.prototype,
				'value',
			)!.set!.call(slider, '100')
			slider.dispatchEvent(new Event('input', { bubbles: true }))
		})
		expect(submitButton().disabled).toBe(true)
		await advance(250)
		expect(submitButton().disabled).toBe(false)
		expect(swap.mock.calls.at(-1)?.[3]).toBe(100)
		expect(slider.getAttribute('aria-valuetext')).toBe('1%')
		expect(reset.disabled).toBe(false)
		expect(
			container.querySelector(
				`[data-note="${mode === 'exactIn' ? 'minimumReceived' : 'maximumSpent'}"]`,
			)!.textContent,
		).toBe(
			mode === 'exactIn'
				? 'minimumReceived0.09801 dotUSD'
				: 'maximumSpent0.101 USDT',
		)
		await act(async () => toggle.click())
		expect(panel.hidden).toBe(true)
		expect(submitButton().disabled).toBe(false)
		await act(async () => toggle.click())
		expect(panel.hidden).toBe(false)
		expect(slider.value).toBe('100')
		await act(async () => reset.click())
		expect(slider.value).toBe('50')
		expect(slider.getAttribute('aria-valuetext')).toBe('0.5%')
		expect(reset.disabled).toBe(true)
		expect(submitButton().disabled).toBe(true)
		await advance(250)
		expect(submitButton().disabled).toBe(false)
		expect(swap.mock.calls.at(-1)?.[3]).toBe(50)
		expect(
			container.querySelector(
				`[data-note="${mode === 'exactIn' ? 'minimumReceived' : 'maximumSpent'}"]`,
			)!.textContent,
		).toBe(
			mode === 'exactIn'
				? 'minimumReceived0.098505 dotUSD'
				: 'maximumSpent0.1005 USDT',
		)
	},
)

test.each(['exactIn', 'exactOut'] as const)(
	'%s always uses the best route without manual route choices',
	async (mode) => {
		const best = {
			...quote(Date.now()),
			mode,
			kind: 'psm' as const,
			path: ['USDT', 'dotUSD'] as AssetHubSwapQuote['path'],
		}
		quotes.mockResolvedValueOnce([best, quote(Date.now())])
		await act(async () => root.render(createElement(Swap)))
		if (mode === 'exactOut') {
			await act(async () =>
				container
					.querySelector<HTMLButtonElement>('[aria-label="exactOutput"]')!
					.click(),
			)
			await act(async () => {
				const input = container.querySelector<HTMLInputElement>(
					'input[aria-label="youReceive"]',
				)!
				input.value = '0.1'
				input.dispatchEvent(new Event('input', { bubbles: true }))
			})
		} else await enterAmount('0.1')
		await advance(250)
		expect(swap.mock.calls[0][0]).toBe(best)
		const route = routeView()
		expect(route.querySelectorAll('button')).toHaveLength(0)
		expect(container.querySelector('details, summary')).toBeNull()
		expect([...route.querySelectorAll('img')].map((icon) => icon.alt)).toEqual([
			'USDT',
			'dotUSD',
		])
		expect(route.getAttribute('aria-description')).toBe(
			mode === 'exactIn' ? 'bestOutput' : 'bestInput',
		)
		expect(
			container.querySelector<HTMLInputElement>('input[type="range"]')!
				.disabled,
		).toBe(true)
		expect(submitButton().disabled).toBe(false)
	},
)

test('an unavailable market refresh keeps the visible details but blocks submission once the last quote expires', async () => {
	await configure()
	const button = submitButton()
	const route = routeView()
	const slippage = container.querySelector<HTMLInputElement>(
		'input[type="range"]',
	)
	market.mockRejectedValue(new Error('Network unavailable'))
	await advance(15_000)
	expect(button.disabled).toBe(false)
	expect(feeText()).toBe('100')
	await advance(15_001)
	expect(submitButton()).toBe(button)
	expect(button.disabled).toBe(true)
	expect(feeText()).toBe('100')
	expect(routeView()).toBe(route)
	expect(container.querySelector<HTMLInputElement>('input[type="range"]')).toBe(
		slippage,
	)
	const refresh = [...container.querySelectorAll('button')].find(
		(item) => item.textContent === 'refreshQuote',
	)!
	expect(refresh.disabled).toBe(false)
	expect(button.previousElementSibling).toBe(refresh)
	expect(refresh.closest('[role="status"]')).toBeNull()
	market.mockImplementation(async () => snapshot())
	await act(async () => refresh.click())
	await advance(250)
	expect(submitButton().disabled).toBe(false)
	expect(container.contains(refresh)).toBe(false)
})

test('a failed background fee estimate retains the last complete quote and never enables an unestimated replacement', async () => {
	await configure()
	const button = submitButton()
	estimate.mockRejectedValueOnce(new Error('Fee RPC unavailable'))
	quotes.mockResolvedValueOnce([quote(115_000, 98_000n)])
	await advance(15_000)
	await advance(250)
	expect(submitButton()).toBe(button)
	expect(button.disabled).toBe(false)
	expect(feeText()).toBe('100')
	expect(
		container.querySelector<HTMLInputElement>('[aria-label="youReceive"]')!
			.value,
	).toBe('0.099')
	expect(container.textContent).toContain('feeUnavailable')
})

test('an initial fee estimation failure blocks submission until retry succeeds', async () => {
	estimate.mockRejectedValueOnce(new Error('Fee RPC unavailable'))
	await act(async () => root.render(createElement(Swap)))
	await enterAmount('0.1')
	await advance(250)
	expect(submitButton().disabled).toBe(true)
	expect(container.textContent).toContain('feeUnavailable')
	const retry = [...container.querySelectorAll('button')].find(
		(button) => button.textContent === 'retry',
	)!
	await act(async () => retry.click())
	await advance(250)
	expect(submitButton().disabled).toBe(false)
	expect(feeText()).toBe('100')
})
