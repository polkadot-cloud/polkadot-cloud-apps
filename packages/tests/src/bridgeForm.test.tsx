// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
// @vitest-environment jsdom

import { encodeAddress } from 'dedot/utils'
import { Tooltip } from 'radix-ui'
import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { CrossChainTransferInput, StablecoinBalance } from 'types'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { Bridge } from '../../app-swap/src/pages/Bridge'

const mocked = vi.hoisted(() => ({
	refresh: vi.fn(),
	prepare: vi.fn(),
	balancesLoading: false,
	feeCurrencyLoading: false,
	submissions: [] as (() => void)[],
}))
const account = {
	address: encodeAddress(new Uint8Array(32).fill(1)),
	source: 'extension',
}
const balance: StablecoinBalance = {
	chain: 'statemint',
	symbol: 'DOT',
	free: 50_000_000_000n,
	frozen: 0n,
	existentialDeposit: 100_000_000n,
	decimals: 10,
}
vi.mock('../../hooks/src/index', () => ({
	useApi: () => ({ serviceApi: {} }),
	useTheme: () => ({ themeElementRef: { current: null } }),
	useTxMeta: () => ({ getTxSubmission: () => undefined }),
	useStablecoinBalances: () => ({
		balances: [balance],
		loading: mocked.balancesLoading,
		refresh: mocked.refresh,
		getBalance: (chain: string, symbol: string) =>
			chain === balance.chain && symbol === balance.symbol
				? balance
				: undefined,
	}),
}))
vi.mock('../../app-swap/src/pages/Send/hooks/useSendAccounts', () => ({
	useSendAccounts: () => ({
		fromAccount: account,
		accounts: [account],
		accountsWithSigners: [account],
	}),
}))
vi.mock('../../app-swap/src/pages/Send/hooks/useHydrationFeeSetup', () => ({
	useHydrationFeeSetup: () => ({
		ready: !mocked.feeCurrencyLoading,
		status: mocked.feeCurrencyLoading ? 'loading' : 'ready',
		submission: {},
	}),
}))
vi.mock('../../hooks/src/useCrossChainTransfer', () => ({
	useCrossChainTransfer: (...args: unknown[]) => mocked.prepare(...args),
}))
vi.mock('../../app-swap/src/pages/Bridge/TransferAction', () => ({
	TransferAction: ({ onSubmitted }: { onSubmitted: () => void }) => {
		mocked.submissions.push(onSubmitted)
		return null
	},
}))
vi.mock('../../ui-app/src/AccountDropdown', () => ({
	AccountDropdown: () => null,
}))
vi.mock('../../ui-app/src/SubmitTx', () => ({ SubmitTx: () => null }))
vi.mock('../../ui-app/src/EstimatedTxFee', () => ({
	EstimatedTxFee: () => null,
}))
vi.mock('../../ui-core/src/base', async () => {
	const { Row } = await import('../../ui-core/src/base/Page/Row')
	const { Spinner } = await import('../../ui-core/src/base/Spinner')
	return { Page: { Row }, Spinner }
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
const render = () =>
	act(async () =>
		root.render(createElement(Tooltip.Provider, null, createElement(Bridge))),
	)
const click = (button: HTMLButtonElement) => act(async () => button.click())
const enterAmount = (value: string) =>
	act(async () => {
		const amount = container.querySelector<HTMLInputElement>(
			'[aria-label="amountToSend"]',
		)!
		Object.getOwnPropertyDescriptor(
			HTMLInputElement.prototype,
			'value',
		)!.set!.call(amount, value)
		amount.dispatchEvent(new Event('input', { bubbles: true }))
	})
const selectOption = async (dropdown: number, label: string) => {
	const trigger =
		container.querySelectorAll<HTMLButtonElement>('[aria-expanded]')[dropdown]
	await click(trigger)
	await click(
		[...trigger.parentElement!.querySelectorAll('button')].find(
			(button) => button.textContent === label,
		)!,
	)
}
const selectDot = (dropdown: number) => selectOption(dropdown, 'DOT')

beforeEach(() => {
	vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
	vi.clearAllMocks()
	mocked.balancesLoading = false
	mocked.feeCurrencyLoading = false
	mocked.submissions.length = 0
	mocked.prepare.mockImplementation((input: CrossChainTransferInput) => ({
		quote: {
			originFee: { amount: 1_000_000n, symbol: 'DOT', decimals: 10 },
			originFeeFromAmount:
				input.from === 'statemint' && input.feeAsset === input.symbol,
			destinationFee: { amount: 1_000_000n, symbol: 'DOT', decimals: 10 },
			receivedAmount: 9_980_000_001n,
		},
		networkFee: 2_000_000n,
		key: `${input.from}:${input.to}:${input.symbol}:${input.amount}:${input.sender}:${input.recipient}:${input.feeAsset}`,
	}))
	container = document.createElement('div')
	document.body.append(container)
	root = createRoot(container)
})
afterEach(async () => {
	await act(async () => root.unmount())
	container.remove()
	vi.unstubAllGlobals()
})

test('People routes switch assets and fees to DOT, preserve precision, and reverse through Hub', async () => {
	await render()
	await enterAmount('1')
	await selectOption(1, 'Polkadot People')
	expect(mocked.prepare).toHaveBeenLastCalledWith(
		expect.objectContaining({
			from: 'statemint',
			to: 'people-polkadot',
			symbol: 'DOT',
			feeAsset: 'DOT',
			amount: 0n,
		}),
		false,
	)
	await enterAmount('1.2345678901')
	expect(mocked.prepare).toHaveBeenLastCalledWith(
		expect.objectContaining({ amount: 12_345_678_901n }),
		true,
	)
	await click(
		container.querySelector<HTMLButtonElement>('[aria-label="reverseChains"]')!,
	)
	expect(mocked.prepare).toHaveBeenLastCalledWith(
		expect.objectContaining({
			from: 'people-polkadot',
			to: 'statemint',
			symbol: 'DOT',
			feeAsset: 'DOT',
			amount: 0n,
		}),
		false,
	)
	const trigger =
		container.querySelectorAll<HTMLButtonElement>('[aria-expanded]')[1]
	await click(trigger)
	expect(trigger.parentElement!.textContent).not.toContain('Hydration')
	expect(trigger.parentElement!.textContent).not.toContain('Polkadot People')
})

test('changing the source to People replaces an unsupported Hydration destination with Hub', async () => {
	await render()
	await selectOption(0, 'Polkadot People')
	expect(mocked.prepare).toHaveBeenLastCalledWith(
		expect.objectContaining({
			from: 'people-polkadot',
			to: 'statemint',
			symbol: 'DOT',
			feeAsset: 'DOT',
		}),
		false,
	)
	await selectOption(0, 'Hydration')
	expect(mocked.prepare).toHaveBeenLastCalledWith(
		expect.objectContaining({
			from: 'hydration',
			to: 'statemint',
			symbol: 'DOT',
		}),
		false,
	)
})

test('DOT selection preserves ten-decimal amounts, formats received DOT, and max-fills after fees and minimum balance', async () => {
	await render()
	await selectDot(2)
	await selectDot(3)
	expect(container.textContent).toContain('0.9980000001 DOT')
	expect(container.textContent).toContain('4.98978 DOT')
	const amount = container.querySelector<HTMLInputElement>(
		'[aria-label="amountToSend"]',
	)!
	await act(async () => {
		Object.getOwnPropertyDescriptor(
			HTMLInputElement.prototype,
			'value',
		)!.set!.call(amount, '1.2345678901')
		amount.dispatchEvent(new Event('input', { bubbles: true }))
	})
	expect(mocked.prepare).toHaveBeenLastCalledWith(
		expect.objectContaining({ symbol: 'DOT', amount: 12_345_678_901n }),
		true,
	)
	await click(
		[...container.querySelectorAll('button')].find((button) =>
			button.textContent?.includes('4.98978 DOT'),
		)!,
	)
	expect(amount.value).toBe('4.98978')
	expect(mocked.prepare).toHaveBeenLastCalledWith(
		expect.objectContaining({ symbol: 'DOT', amount: 49_897_800_000n }),
		true,
	)
})

test.each(['quote', 'fee currency'])(
	'%s loading appears in the route value at the top of the summary',
	async (state) => {
		mocked.prepare.mockReturnValue({ loading: state === 'quote' })
		mocked.feeCurrencyLoading = state === 'fee currency'
		await render()
		await enterAmount('1')
		const route = container.querySelector('[role="group"][aria-label="route"]')!
		expect(route.parentElement!.firstElementChild).toBe(route)
		const status = route.querySelector('[role="status"]')!
		expect(status.textContent).toBe('checkingCrossChain')
		expect(
			status.querySelector('[aria-hidden] [style="width: 1rem;"]'),
		).not.toBeNull()
		expect(container.querySelectorAll('[role="status"]')).toHaveLength(1)
		expect(container.querySelector('[role="alert"]')).toBeNull()
	},
)

test('an idle form and unrelated balance syncing do not keep the route loader active', async () => {
	mocked.balancesLoading = true
	mocked.feeCurrencyLoading = true
	mocked.prepare.mockReturnValue({ loading: false })
	await render()
	expect(
		container.querySelector(
			'[role="group"][aria-label="route"] [role="status"]',
		),
	).toBeNull()
	mocked.feeCurrencyLoading = false
	mocked.prepare.mockReturnValue({
		loading: false,
		error: 'Fee unavailable',
		refresh: mocked.refresh,
	})
	await enterAmount('1')
	expect(
		container.querySelector(
			'[role="group"][aria-label="route"] [role="status"]',
		),
	).toBeNull()
	expect(container.querySelector('[role="alert"]')?.textContent).toContain(
		'Fee unavailable',
	)
	expect(
		[...container.querySelectorAll('button')].some(
			(button) => button.textContent === 'retry',
		),
	).toBe(true)
})

test('revalidation uses the shared route loader and retains fee and received values', async () => {
	await render()
	const route = container.querySelector('[role="group"][aria-label="route"]')!
	const notes = route.parentElement!
	const values = [...notes.children].slice(1).map((row) => row.textContent)
	const prepared = mocked.prepare.mock.results.at(-1)!.value
	mocked.prepare.mockReturnValue({ ...prepared, loading: true })
	await render()
	expect(container.querySelector('[role="group"][aria-label="route"]')).toBe(
		route,
	)
	expect(route.querySelector('[role="status"]')!.textContent).toBe(
		'checkingCrossChain',
	)
	expect(route.textContent).not.toContain('Hydration')
	expect([...notes.children].slice(1).map((row) => row.textContent)).toEqual(
		values,
	)
	expect(container.querySelectorAll('[role="status"]')).toHaveLength(1)
	mocked.prepare.mockReturnValue(prepared)
	await render()
	expect(route.querySelector('[role="status"]')).toBeNull()
	expect(route.textContent).toContain('Polkadot Hub → Hydration')
})

test('broadcasting clears the entered amount and disables quote preparation immediately', async () => {
	await render()
	await enterAmount('1.234567')
	await act(async () => mocked.submissions.at(-1)!())
	expect(
		container.querySelector<HTMLInputElement>('[aria-label="amountToSend"]')!
			.value,
	).toBe('')
	expect(mocked.prepare).toHaveBeenLastCalledWith(
		expect.objectContaining({ amount: 0n }),
		false,
	)
})

test.each(['amount', 'asset'])(
	'a late broadcast cannot clear a new draft after the %s changes',
	async (change) => {
		await render()
		await enterAmount('1')
		const onSubmitted = mocked.submissions.at(-1)!
		if (change === 'asset') await selectDot(2)
		await enterAmount(change === 'amount' ? '2' : '1')
		await act(async () => onSubmitted())
		expect(
			container.querySelector<HTMLInputElement>('[aria-label="amountToSend"]')!
				.value,
		).toBe(change === 'amount' ? '2' : '1')
		expect(mocked.prepare).toHaveBeenLastCalledWith(
			expect.objectContaining({
				symbol: change === 'asset' ? 'DOT' : 'USDC',
				amount: change === 'asset' ? 10_000_000_000n : 2_000_000n,
			}),
			true,
		)
	},
)
