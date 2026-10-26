// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
// @vitest-environment jsdom

import type { SubmittableExtrinsic } from 'dedot'
import type { TxStatus } from 'dedot/types'
import { act, createElement, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type {
	ImportedAccount,
	ServiceInterface,
	SubmitTxProps,
	SwapQuote,
} from 'types'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { Sync } from '../../app-swap/src/library/Sync'
import { Swap } from '../../app-swap/src/pages/Swap'
import { getUid, removeSub, subs } from '../../global-bus/src/txSubmit'
import { _uids } from '../../global-bus/src/txSubmit/private'

const { state, quotes, swap, estimate, refreshBalances, signAndSend, views } =
	vi.hoisted(() => ({
		state: {
			serviceApi: undefined as unknown as ServiceInterface,
			account: { address: 'alice', source: 'extension' } as ImportedAccount,
		},
		quotes: vi.fn(),
		swap: vi.fn(),
		estimate: vi.fn(),
		refreshBalances: vi.fn(),
		signAndSend: vi.fn(),
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
		useExtensionAccounts: () => ({
			getExtensionAccount: () => ({ signer: {} }),
		}),
		useExtensions: () => ({ extensionsStatus: { extension: 'connected' } }),
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
vi.mock('../../hooks/src/useSyncing', () => ({
	useSyncing: () => ({ syncing: false }),
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
		selected,
	}: {
		label: string
		value: string
		onChange?: (value: string) => void
		readOnly?: boolean
		selected: { value: string }
	}) =>
		createElement('input', {
			'aria-label': label,
			'data-token': selected.value,
			value,
			readOnly,
			onInput: (event: { currentTarget: HTMLInputElement }) =>
				onChange?.(event.currentTarget.value),
		}),
}))
vi.mock('../../ui-app/src/SubmitTx', async () => {
	const { useTxMeta } = await import('../../hooks/src/useTxMeta')
	return {
		SubmitTx: ({ uid, valid, submitText, onSubmit }: SubmitTxProps) => {
			const { getTxSubmission } = useTxMeta()
			const fee = getTxSubmission(uid)?.fee ?? 0n
			views.push({ uid, fee, valid })
			return createElement(
				'button',
				{
					type: 'button',
					'data-submit': uid,
					disabled: !valid || getTxSubmission(uid)?.submitted,
					onClick: onSubmit,
				},
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
vi.mock('../../ui-core/src/base/Tooltip', () => ({
	Tooltip: ({ children }: { children: ReactNode }) => children,
}))
vi.mock('../../ui-core/src/base', async () => ({
	Page: { Row: (await import('../../ui-core/src/base/Page/Row')).Row },
	Spinner: (await import('../../ui-core/src/base/Spinner')).Spinner,
	Tooltip: (await import('../../ui-core/src/base/Tooltip')).Tooltip,
}))
vi.mock('../../ui-core/src/input', async () => ({
	SendForm: (await import('../../ui-core/src/input/SendForm')).SendForm,
}))

const quote = (fetchedAt: number, amountOut = 99_000n): SwapQuote => ({
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
const note = (label: string) =>
	[...container.querySelectorAll('span')].find(
		(span) => span.textContent === label,
	)!.parentElement!
const input = (label: string) =>
	container.querySelector<HTMLInputElement>(`input[aria-label="${label}"]`)!
const click = (label: string) =>
	act(async () =>
		container
			.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!
			.click(),
	)
const render = () =>
	act(async () =>
		root.render(
			<>
				<div data-sync>
					<Sync />
				</div>
				<Swap />
			</>,
		),
	)
const submitButton = () =>
	container.querySelector<HTMLButtonElement>('[data-submit]')!
const feeText = () => container.querySelector('[data-fee]')!.textContent
const routeView = () =>
	container.querySelector<HTMLElement>('[role="group"][aria-label="route"]')!
const isSpinning = () =>
	container.querySelector('[data-sync]')!.childElementCount > 0
const emitStatus = (status: TxStatus, attempt = -1) =>
	act(async () => {
		await signAndSend.mock.calls.at(attempt)![2]({ status, events: [] })
	})
const configure = async () => {
	await render()
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
	quotes.mockImplementation(async () => [quote(Date.now())])
	estimate.mockResolvedValue(100n)
	refreshBalances.mockResolvedValue(undefined)
	signAndSend.mockResolvedValue(async () => {})
	window.injectedWeb3 = {
		extension: {
			id: 'extension',
			title: 'Test wallet',
			icon: () => null,
			url: '',
			enable: vi.fn(),
		},
	}
	swap.mockImplementation(
		(data: SwapQuote) =>
			({
				client: {
					runtimeVersion: { specName: 'asset-hub-polkadot' },
					query: { system: { account: async () => ({ nonce: 0 }) } },
				},
				toHex: () => `0x${data.amountOut.toString(16)}`,
				call: { pallet: 'AssetConversion', palletCall: { name: 'Swap' } },
				signAndSend,
			}) as unknown as SubmittableExtrinsic,
	)
	state.serviceApi = {
		swap: { quotes, swap },
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
	for (const uid of Object.keys(subs)) removeSub(Number(uid))
	_uids.next([])
	delete window.injectedWeb3
	vi.useRealTimers()
	vi.unstubAllGlobals()
})

test.each(['exactIn', 'exactOut'] as const)(
	'%s moves the top asset and amount to the bottom and recalculates the new top amount',
	async (mode) => {
		const exactIn = mode === 'exactIn'
		const initial = {
			...quote(Date.now()),
			mode,
			amountIn: exactIn ? 100_000n : 101_001n,
			amountOut: exactIn ? 99_001n : 100_000n,
		}
		const reversed: SwapQuote = {
			...initial,
			assetIn: 'dotUSD',
			assetOut: 'USDT',
			path: ['dotUSD', 'DOT', 'USDT'],
			mode: exactIn ? 'exactOut' : 'exactIn',
			amount: 100_000n,
			amountIn: exactIn ? 102_002n : 100_000n,
			amountOut: exactIn ? 100_000n : 98_002n,
		}
		quotes.mockResolvedValueOnce([initial]).mockResolvedValueOnce([reversed])
		await render()
		if (!exactIn) {
			await click('exactOutput')
		}
		await enterAmount('0.100000', exactIn ? 'youPay' : 'youReceive')
		await advance(250)
		expect(submitButton().disabled).toBe(false)
		await click('reverseAssets')
		const [top, bottom] =
			container.querySelectorAll<HTMLInputElement>('input[data-token]')
		expect(bottom.value).toBe('0.100000')
		expect(bottom.dataset.token).toBe(exactIn ? 'USDT' : 'dotUSD')
		expect(bottom.readOnly).toBe(false)
		expect(top.dataset.token).toBe(exactIn ? 'dotUSD' : 'USDT')
		expect(top.getAttribute('aria-label')).toBe(
			exactIn ? 'youPay' : 'youReceive',
		)
		expect(top.readOnly).toBe(true)
		expect(top.value).toBe('0.00')
		expect(submitButton().disabled).toBe(true)
		await advance(250)
		expect(quotes).toHaveBeenLastCalledWith({
			assetIn: 'dotUSD',
			assetOut: 'USDT',
			amount: reversed.amount,
			mode: reversed.mode,
		})
		expect(bottom.value).toBe('0.100000')
		expect(top.value).toBe(exactIn ? '0.102002' : '0.098002')
		expect(swap.mock.calls.at(-1)?.[0]).toBe(reversed)
		expect(submitButton().disabled).toBe(false)
		await enterAmount('0.2', exactIn ? 'youReceive' : 'youPay')
		expect(bottom.value).toBe('0.2')
		expect(submitButton().disabled).toBe(true)
		await advance(250)
		expect(quotes).toHaveBeenLastCalledWith({
			assetIn: 'dotUSD',
			assetOut: 'USDT',
			amount: 200_000n,
			mode: reversed.mode,
		})
	},
)

test('reversing the assets before a quote is ready moves the entered amount and its asset to the bottom', async () => {
	await render()
	await enterAmount('0.123456')
	await click('reverseAssets')
	const [top, bottom] =
		container.querySelectorAll<HTMLInputElement>('input[data-token]')
	expect(top.dataset.token).toBe('dotUSD')
	expect(top.value).toBe('0.00')
	expect(bottom.value).toBe('0.123456')
	expect(bottom.dataset.token).toBe('USDT')
	await advance(250)
	expect(quotes).toHaveBeenCalledExactlyOnceWith({
		assetIn: 'dotUSD',
		assetOut: 'USDT',
		amount: 123_456n,
		mode: 'exactOut',
	})
})

test('reversing again moves the current calculated top amount to the bottom', async () => {
	await configure()
	quotes.mockResolvedValueOnce([
		{
			...quote(Date.now()),
			assetIn: 'dotUSD',
			assetOut: 'USDT',
			mode: 'exactOut',
			amountIn: 102_002n,
			amountOut: 100_000n,
		},
	])
	const reverse = container.querySelector<HTMLButtonElement>(
		'[aria-label="reverseAssets"]',
	)!
	await act(async () => reverse.click())
	await advance(250)
	await act(async () => reverse.click())
	const [top, bottom] =
		container.querySelectorAll<HTMLInputElement>('input[data-token]')
	expect(top.dataset.token).toBe('USDT')
	expect(bottom.dataset.token).toBe('dotUSD')
	expect(bottom.value).toBe('0.102002')
	await advance(250)
	expect(quotes).toHaveBeenLastCalledWith({
		assetIn: 'USDT',
		assetOut: 'dotUSD',
		amount: 102_002n,
		mode: 'exactOut',
	})
})

test('polling retains the route, slippage, fee and enabled button until the replacement quote and fee are ready', async () => {
	await configure()
	const button = submitButton()
	const stableSelectors = [
		'[data-fee]',
		'[role="group"][aria-label="route"]',
		'[role="slider"]',
	]
	const stableNodes = stableSelectors.map((selector) =>
		container.querySelector(selector),
	)
	const stableNotes = ['conversionFee', 'minimumReceived'].map(note)
	const assertStable = () => {
		for (const [index, selector] of stableSelectors.entries()) {
			expect(container.querySelector(selector)).toBe(stableNodes[index])
		}
		expect(['conversionFee', 'minimumReceived'].map(note)).toEqual(stableNotes)
	}
	expect(
		[...routeView().querySelectorAll('img')].map((icon) => icon.alt),
	).toEqual(['USDT', 'DOT', 'dotUSD'])
	const uid = button.dataset.submit
	const pendingQuotes = deferred<SwapQuote[]>()
	const pendingFee = deferred<bigint>()
	quotes.mockReturnValueOnce(pendingQuotes.promise)
	estimate.mockReturnValueOnce(pendingFee.promise)
	views.length = 0
	await advance(15_000)
	await advance(250)
	expect(submitButton()).toBe(button)
	expect(button.disabled).toBe(false)
	assertStable()
	expect(feeText()).toBe('100')

	await act(async () => pendingQuotes.resolve([quote(115_000, 98_000n)]))
	expect(feeText()).toBe('100')
	expect(button.disabled).toBe(false)
	expect(input('youReceive').value).toBe('0.099')
	await act(async () => pendingFee.resolve(120n))
	expect(submitButton()).toBe(button)
	expect(button.dataset.submit).toBe(uid)
	expect(button.disabled).toBe(false)
	expect(feeText()).toBe('120')
	assertStable()
	expect(input('youReceive').value).toBe('0.098')
	expect(views.every((view) => view.valid && view.fee > 0n)).toBe(true)
	expect(estimate).toHaveBeenCalledTimes(2)
})

test('editing the input invalidates the old quote immediately and ignores an in-flight refresh', async () => {
	await configure()
	const route = routeView()
	const minimum = note('minimumReceived')
	const slippage = container.querySelector<HTMLDivElement>('[role="slider"]')!
	const pendingQuotes = deferred<SwapQuote[]>()
	quotes.mockReturnValueOnce(pendingQuotes.promise)
	await advance(15_000)
	await advance(250)
	await enterAmount('0.2')
	expect(submitButton().disabled).toBe(true)
	expect(routeView()).toBe(route)
	expect(route.textContent).toContain('fetchingQuote')
	expect(note('minimumReceived')).toBe(minimum)
	expect(minimum.textContent).toBe('minimumReceived—')
	expect(slippage.getAttribute('aria-disabled')).toBe('false')
	expect(note('conversionFee').textContent).toBe('conversionFee—')
	await act(async () => pendingQuotes.resolve([quote(115_000, 98_000n)]))
	expect(submitButton().disabled).toBe(true)
	expect(routeView()).toBe(route)
	expect(route.textContent).toContain('fetchingQuote')
})

test('the automatic route and quote rows keep their placeholders until the quote and network fee are ready', async () => {
	const pendingFee = deferred<bigint>()
	estimate.mockReturnValueOnce(pendingFee.promise)
	await render()
	const route = routeView()
	const minimum = note('minimumReceived')
	const slippage = container.querySelector<HTMLDivElement>('[role="slider"]')!
	expect(route.querySelector('[aria-live="polite"]')!.textContent).toBe('—')
	expect(minimum.textContent).toBe('minimumReceived—')
	expect(slippage.getAttribute('aria-disabled')).toBe('false')
	for (const label of ['networkFee', 'conversionFee', 'priceImpact']) {
		expect(note(label).textContent).toBe(`${label}—`)
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
	expect(note('minimumReceived')).toBe(minimum)
	expect(minimum.textContent).toBe('minimumReceived0.098505 dotUSD')
	expect(slippage.getAttribute('aria-disabled')).toBe('false')
	expect(submitButton().disabled).toBe(false)
	const networkFee = note('networkFee')
	expect(networkFee.nextElementSibling?.firstElementChild?.textContent).toBe(
		'conversionFee',
	)
	expect(
		networkFee.nextElementSibling?.nextElementSibling?.firstElementChild
			?.textContent,
	).toBe('priceImpact')
})

test.each(['exactIn', 'exactOut'] as const)(
	'%s slippage starts collapsed, updates the quote, keeps its value when toggled and resets to the default',
	async (mode) => {
		quotes.mockResolvedValue([{ ...quote(Date.now()), mode }])
		await render()
		const toggle = container.querySelector<HTMLButtonElement>(
			'button[aria-controls][aria-expanded]',
		)!
		const panel = document.getElementById(
			toggle.getAttribute('aria-controls')!,
		)!
		const slider = panel.querySelector<HTMLDivElement>('[role="slider"]')!
		const reset = panel.querySelector<HTMLButtonElement>(
			'[aria-label="resetSlippage"]',
		)!
		expect(toggle.textContent).toBe('slippageSettings')
		expect(toggle.getAttribute('aria-expanded')).toBe('false')
		expect(panel.hidden).toBe(true)
		expect(slider.getAttribute('aria-valuenow')).toBe('50')
		expect(slider.getAttribute('aria-valuetext')).toBe('0.5%')
		expect(reset.disabled).toBe(true)
		if (mode === 'exactOut') {
			await click('exactOutput')
		}
		await enterAmount('0.1', mode === 'exactIn' ? 'youPay' : 'youReceive')
		await advance(250)
		await act(async () => toggle.click())
		expect(panel.hidden).toBe(false)
		expect(toggle.getAttribute('aria-expanded')).toBe('true')
		for (let step = 0; step < 5; step++) {
			await act(async () => {
				slider.dispatchEvent(
					new KeyboardEvent('keydown', {
						key: 'ArrowRight',
						keyCode: 39,
						bubbles: true,
					}),
				)
			})
		}
		expect(submitButton().disabled).toBe(true)
		await advance(250)
		expect(submitButton().disabled).toBe(false)
		expect(swap.mock.calls.at(-1)?.[3]).toBe(100)
		expect(slider.getAttribute('aria-valuetext')).toBe('1%')
		expect(reset.disabled).toBe(false)
		expect(
			note(mode === 'exactIn' ? 'minimumReceived' : 'maximumSpent').textContent,
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
		expect(slider.getAttribute('aria-valuenow')).toBe('100')
		await act(async () => reset.click())
		expect(slider.getAttribute('aria-valuenow')).toBe('50')
		expect(slider.getAttribute('aria-valuetext')).toBe('0.5%')
		expect(reset.disabled).toBe(true)
		expect(submitButton().disabled).toBe(true)
		await advance(250)
		expect(submitButton().disabled).toBe(false)
		expect(swap.mock.calls.at(-1)?.[3]).toBe(50)
		expect(
			note(mode === 'exactIn' ? 'minimumReceived' : 'maximumSpent').textContent,
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
			path: ['USDT', 'dotUSD'] as SwapQuote['path'],
		}
		quotes.mockResolvedValueOnce([best, quote(Date.now())])
		await render()
		if (mode === 'exactOut') {
			await click('exactOutput')
		}
		await enterAmount('0.1', mode === 'exactIn' ? 'youPay' : 'youReceive')
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
		const slider = container.querySelector<HTMLDivElement>('[role="slider"]')!
		expect(slider.getAttribute('aria-disabled')).toBe('true')
		await act(async () => {
			slider.dispatchEvent(
				new KeyboardEvent('keydown', {
					key: 'ArrowRight',
					keyCode: 39,
					bubbles: true,
				}),
			)
		})
		expect(slider.getAttribute('aria-valuenow')).toBe('50')
		expect(submitButton().disabled).toBe(false)
	},
)

test('an unavailable market refresh keeps the visible details but blocks submission once the last quote expires', async () => {
	await configure()
	const button = submitButton()
	const route = routeView()
	const slippage = container.querySelector<HTMLDivElement>('[role="slider"]')
	quotes.mockRejectedValue(new Error('Network unavailable'))
	await advance(15_000)
	expect(button.disabled).toBe(false)
	expect(feeText()).toBe('100')
	await advance(15_001)
	expect(submitButton()).toBe(button)
	expect(button.disabled).toBe(true)
	expect(feeText()).toBe('100')
	expect(routeView()).toBe(route)
	expect(container.querySelector<HTMLDivElement>('[role="slider"]')).toBe(
		slippage,
	)
	const refresh = [...container.querySelectorAll('button')].find(
		(item) => item.textContent === 'refreshQuote',
	)!
	expect(refresh.disabled).toBe(false)
	expect(button.previousElementSibling).toBe(refresh)
	expect(refresh.closest('[role="status"]')).toBeNull()
	quotes.mockImplementation(async () => [quote(Date.now())])
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
	expect(input('youReceive').value).toBe('0.099')
	expect(container.textContent).toContain('feeUnavailable')
})

test('an initial fee estimation failure blocks submission until retry succeeds', async () => {
	estimate.mockRejectedValueOnce(new Error('Fee RPC unavailable'))
	await render()
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

test('an empty amount makes no market requests and stops polling after clearing the input', async () => {
	await render()
	await advance(30_000)
	expect(quotes).not.toHaveBeenCalled()
	await enterAmount('0.1')
	await advance(250)
	expect(quotes).toHaveBeenCalledOnce()
	await enterAmount('')
	await advance(30_000)
	expect(quotes).toHaveBeenCalledOnce()
	expect(submitButton().disabled).toBe(true)
})

test('polling does not overlap an unfinished quote request', async () => {
	const pending = deferred<SwapQuote[]>()
	quotes.mockReturnValueOnce(pending.promise)
	await render()
	await enterAmount('0.1')
	await advance(30_000)
	expect(quotes).toHaveBeenCalledOnce()
	await act(async () => pending.resolve([quote(Date.now())]))
	expect(submitButton().disabled).toBe(false)
	await advance(15_000)
	expect(quotes).toHaveBeenCalledTimes(2)
})

test('replacing the service invalidates a pending fee and the old quote immediately', async () => {
	await configure()
	const pending = deferred<bigint>()
	estimate.mockReturnValueOnce(pending.promise)
	await advance(15_000)
	state.serviceApi = { ...state.serviceApi }
	await render()
	expect(submitButton().disabled).toBe(true)
	await act(async () => pending.resolve(999n))
	expect(submitButton().disabled).toBe(true)
	await advance(250)
	expect(submitButton().disabled).toBe(false)
	expect(feeText()).toBe('100')
})

test.each(['exactIn', 'exactOut'] as const)(
	'%s clears both amounts on broadcast and keeps the spinner through inclusion and finalization',
	async (mode) => {
		await render()
		if (mode === 'exactOut') await click('exactOutput')
		const editable = mode === 'exactIn' ? 'youPay' : 'youReceive'
		await enterAmount('0.1', editable)
		await advance(250)
		refreshBalances.mockClear()
		const uid = Number(submitButton().dataset.submit)
		expect(isSpinning()).toBe(false)
		await act(async () => submitButton().click())
		expect(signAndSend).toHaveBeenCalledOnce()
		expect(input(editable).value).toBe('0.1')
		expect(isSpinning()).toBe(true)
		expect(getUid(uid)?.submitted).toBe(true)

		await emitStatus({ type: 'Broadcasting' })
		expect(input(editable).value).toBe('')
		expect(input(mode === 'exactIn' ? 'youReceive' : 'youPay').value).toBe(
			'0.00',
		)
		expect(routeView().textContent).toBe('route—')
		expect(Number(submitButton().dataset.submit)).not.toBe(uid)
		expect(getUid(uid)?.pending).toBe(true)
		expect(submitButton().disabled).toBe(true)
		expect(isSpinning()).toBe(true)
		expect(refreshBalances).not.toHaveBeenCalled()
		expect(container.textContent).not.toContain('transactionInProgress')

		// A new draft must survive callbacks from the already submitted swap.
		await enterAmount('0.2', editable)
		await advance(250)
		expect(submitButton().disabled).toBe(false)
		expect(isSpinning()).toBe(true)
		const block = { blockHash: '0x01' as const, blockNumber: 1, txIndex: 0 }
		await emitStatus({ type: 'BestChainBlockIncluded', value: block })
		expect(refreshBalances).toHaveBeenCalledOnce()
		expect(input(editable).value).toBe('0.2')
		expect(isSpinning()).toBe(true)
		await emitStatus({ type: 'NoLongerInBestChain' })
		expect(isSpinning()).toBe(true)
		await emitStatus({ type: 'BestChainBlockIncluded', value: block })
		await emitStatus({ type: 'Finalized', value: block })
		expect(isSpinning()).toBe(false)
		expect(getUid(uid)).toBeUndefined()
		expect(input(editable).value).toBe('0.2')
		expect(submitButton().disabled).toBe(false)

		await act(async () => submitButton().click())
		expect(signAndSend).toHaveBeenCalledTimes(2)
		await emitStatus({ type: 'Broadcasting' })
		expect(input(editable).value).toBe('')
		expect(isSpinning()).toBe(true)
		await emitStatus({ type: 'Finalized', value: block })
		expect(isSpinning()).toBe(false)
	},
)

test('cancelling signing preserves the amounts, clears the spinner and permits retry', async () => {
	await configure()
	const signing = deferred<never>()
	signAndSend.mockReturnValueOnce(signing.promise)
	await act(async () => submitButton().click())
	expect(input('youPay').value).toBe('0.1')
	expect(input('youReceive').value).toBe('0.099')
	expect(isSpinning()).toBe(true)
	await act(async () => signing.reject(new Error('User cancelled')))
	expect(input('youPay').value).toBe('0.1')
	expect(input('youReceive').value).toBe('0.099')
	expect(isSpinning()).toBe(false)
	expect(submitButton().disabled).toBe(false)
	await act(async () => submitButton().click())
	await emitStatus({ type: 'Broadcasting' })
	expect(input('youPay').value).toBe('')
	expect(isSpinning()).toBe(true)
})

test.each(['Invalid', 'Drop'] as const)(
	'a %s status clears the spinner after the form reset without discarding a new draft',
	async (type) => {
		await configure()
		await act(async () => submitButton().click())
		await emitStatus({ type: 'Broadcasting' })
		await enterAmount('0.2')
		await advance(250)
		expect(isSpinning()).toBe(true)
		expect(submitButton().disabled).toBe(false)
		await emitStatus({ type, value: { error: 'Rejected' } })
		expect(input('youPay').value).toBe('0.2')
		expect(isSpinning()).toBe(false)
		expect(submitButton().disabled).toBe(false)
	},
)

test('a second swap can be submitted before the first is included, using the next nonce', async () => {
	await configure()
	const firstUid = Number(submitButton().dataset.submit)
	await act(async () => {
		submitButton().click()
		submitButton().click()
	})
	expect(signAndSend).toHaveBeenCalledOnce()
	expect(signAndSend.mock.calls[0][1].nonce).toBe(0)

	// Changing the draft must not open a second signer before broadcast.
	await enterAmount('0.2')
	await advance(250)
	expect(submitButton().disabled).toBe(true)
	await emitStatus({ type: 'Broadcasting' }, 0)
	await enterAmount('0.2')
	await advance(250)
	expect(submitButton().disabled).toBe(false)
	const secondUid = Number(submitButton().dataset.submit)
	await act(async () => submitButton().click())
	expect(signAndSend).toHaveBeenCalledTimes(2)
	expect(signAndSend.mock.calls[1][1].nonce).toBe(1)
	expect(getUid(firstUid)?.pending).toBe(true)
	expect(getUid(secondUid)?.submitted).toBe(true)
	expect(isSpinning()).toBe(true)

	// Late broadcasts and completion of the first swap must not reset the second.
	await emitStatus({ type: 'Broadcasting' }, 0)
	expect(input('youPay').value).toBe('0.2')
	const block = { blockHash: '0x01' as const, blockNumber: 1, txIndex: 0 }
	await emitStatus({ type: 'BestChainBlockIncluded', value: block }, 0)
	await emitStatus({ type: 'Finalized', value: block }, 0)
	expect(getUid(firstUid)).toBeUndefined()
	expect(getUid(secondUid)?.submitted).toBe(true)
	expect(submitButton().disabled).toBe(true)
	expect(input('youPay').value).toBe('0.2')
	expect(isSpinning()).toBe(true)

	await emitStatus({ type: 'Broadcasting' }, 1)
	expect(input('youPay').value).toBe('')
	await emitStatus({ type: 'Finalized', value: block }, 1)
	expect(isSpinning()).toBe(false)
	expect(getUid(secondUid)).toBeUndefined()
})

test('an inclusion without a preceding broadcast status releases the form before finalization', async () => {
	await configure()
	await act(async () => submitButton().click())
	await emitStatus({
		type: 'BestChainBlockIncluded',
		value: { blockHash: '0x01', blockNumber: 1, txIndex: 0 },
	})
	expect(input('youPay').value).toBe('')
	await enterAmount('0.2')
	await advance(250)
	expect(submitButton().disabled).toBe(false)
	expect(isSpinning()).toBe(true)
})
