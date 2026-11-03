// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
// @vitest-environment jsdom

import { act, createElement, Fragment, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type {
	CrossChainTransfer,
	CrossChainTransferInput,
	ServiceInterface,
	StablecoinBalance,
} from 'types'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { Sync } from '../../app-swap/src/library/Sync'
import { TransferAction } from '../../app-swap/src/pages/Bridge/TransferAction'
import { trackCrossChainDelivery } from '../../tx-submit/src/trackCrossChainDelivery'
import type { UseSubmitExtrinsicProps } from '../../tx-submit/src/useSubmitExtrinsic/types'

const mocked = vi.hoisted(() => ({
	serviceApi: undefined as unknown as ServiceInterface,
	handlers: [] as UseSubmitExtrinsicProps[],
	refresh: vi.fn(),
}))
vi.mock('../../hooks/src/index', () => ({
	useApi: () => ({ serviceApi: mocked.serviceApi }),
	useTxMeta: () => ({ uids: [] }),
	useStablecoinBalances: () => ({
		balances: [
			{
				chain: 'statemint',
				symbol: 'USDC',
				free: 100_000_000n,
				frozen: 0n,
				existentialDeposit: 10_000n,
				decimals: 6,
			},
		],
		getBalance: () => ({ free: 100_000_000n }),
		loading: false,
		refresh: mocked.refresh,
	}),
}))
vi.mock('../../hooks/src/useSyncing', () => ({
	useSyncing: () => ({ syncing: false }),
}))
vi.mock('../../hooks/src/useTxMeta', () => ({
	useTxMeta: () => ({ uids: [] }),
}))
vi.mock('../../tx-submit/src/index', async () => ({
	trackCrossChainDelivery: (
		await import('../../tx-submit/src/trackCrossChainDelivery')
	).trackCrossChainDelivery,
	useSubmitExtrinsic: (props: UseSubmitExtrinsicProps) => {
		mocked.handlers.push(props)
		return { uid: 0 }
	},
}))
vi.mock('../../ui-app/src/SubmitTx', () => ({ SubmitTx: () => null }))
vi.mock('../../ui-core/src/input', () => ({
	SendForm: { Action: ({ children }: { children: ReactNode }) => children },
}))
vi.mock('../../ui-core/src/base', () => ({
	Spinner: () => createElement('span', { 'data-spinner': true }),
}))
vi.mock('../../app-swap/src/library/Swap', () => ({
	ExchangeNotice: ({ children }: { children: ReactNode }) =>
		createElement('div', { role: 'status' }, children),
	swapFeeReserve: (fee: bigint) => fee,
}))
vi.mock('react-i18next', () => ({
	useTranslation: () => ({ t: (key: string) => key }),
}))

const input: CrossChainTransferInput = {
	from: 'statemint',
	to: 'hydration',
	symbol: 'USDC',
	amount: 2_000_000n,
	sender: 'sender',
	recipient: 'external-recipient',
	feeAsset: 'USDC',
}
const quote = {
	tx: {},
	originFee: { amount: 1000n, symbol: 'USDC', decimals: 6 },
	originFeeFromAmount: true,
	destinationFee: { amount: 1000n, symbol: 'USDC', decimals: 6 },
	receivedAmount: 1_998_000n,
	destinationBalance: 1_000_000n,
	fetchedAt: 0,
} as CrossChainTransfer
const destinationBalance: StablecoinBalance = {
	chain: 'hydration',
	symbol: 'USDC',
	free: 2_998_000n,
	frozen: 0n,
	existentialDeposit: 10_000n,
	decimals: 6,
}
type BalanceListener = {
	onBalance: (balance: StablecoinBalance) => void
	onError: (error: unknown) => void
	unsubscribe: ReturnType<typeof vi.fn>
}
let listeners: BalanceListener[]
let deliveries: ReturnType<typeof trackCrossChainDelivery>[]
let root: Root
let container: HTMLDivElement
const handlers = () => mocked.handlers.at(-1)!
const spinning = () => !!container.querySelector('[data-spinner]')
const render = (showAction = true, currentInput = input) =>
	act(async () =>
		root.render(
			createElement(
				Fragment,
				null,
				createElement(Sync),
				showAction &&
					createElement(TransferAction, {
						input: currentInput,
						account: { address: 'sender', source: 'extension', name: 'Sender' },
						quote,
						networkFee: 1000n,
						valid: true,
					}),
			),
		),
	)
const advance = (milliseconds: number) =>
	act(async () => vi.advanceTimersByTimeAsync(milliseconds))

beforeEach(() => {
	vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
	vi.useFakeTimers()
	vi.clearAllMocks()
	mocked.handlers.length = 0
	listeners = []
	deliveries = []
	mocked.serviceApi = {
		stablecoins: {
			subscribe: {
				balances: vi.fn((_address, _chain, onBalance, onError) => {
					const unsubscribe = vi.fn()
					listeners.push({ onBalance, onError, unsubscribe })
					return unsubscribe
				}),
			},
			query: {
				balances: vi.fn().mockResolvedValue([]),
				balance: vi.fn(),
			},
			fee: { paymentOptions: () => undefined },
		},
	} as unknown as ServiceInterface
	container = document.createElement('div')
	root = createRoot(container)
})
afterEach(async () => {
	await act(async () => {
		for (const props of mocked.handlers) props.callbackFailure?.()
		for (const delivery of deliveries) delivery.failed()
		root.unmount()
	})
	vi.useRealTimers()
	vi.unstubAllGlobals()
})

test('the spinner waits past source inclusion and finality for the subscribed destination balance', async () => {
	await render()
	expect(spinning()).toBe(false)
	await act(async () => handlers().callbackSubmit!())
	expect(mocked.serviceApi.stablecoins.subscribe.balances).toHaveBeenCalledWith(
		'external-recipient',
		'hydration',
		expect.any(Function),
		expect.any(Function),
	)
	expect(spinning()).toBe(true)
	await act(async () => handlers().callbackInBlock!())
	expect(spinning()).toBe(true)
	await act(async () => handlers().callbackFinalized!())
	expect(container.textContent).toContain('xcmStatusFinalized')
	await advance(18_000)
	expect(mocked.serviceApi.stablecoins.query.balance).not.toHaveBeenCalled()
	await act(async () => {
		listeners[0].onBalance({ ...destinationBalance, symbol: 'USDT' })
		listeners[0].onBalance({ ...destinationBalance, chain: 'statemint' })
		listeners[0].onBalance({ ...destinationBalance, free: 2_997_999n })
	})
	expect(spinning()).toBe(true)
	await act(async () => listeners[0].onBalance(destinationBalance))
	expect(spinning()).toBe(false)
	expect(container.textContent).toContain('xcmStatusBalanceUpdated')
	expect(listeners[0].unsubscribe).toHaveBeenCalledOnce()
	expect(mocked.serviceApi.stablecoins.query.balances).toHaveBeenCalledWith(
		'external-recipient',
	)
})

test('receipt before source finality is remembered without completing the transfer early', async () => {
	await render()
	await act(async () => handlers().callbackSubmit!())
	await act(async () => listeners[0].onBalance(destinationBalance))
	expect(container.textContent).toContain('xcmStatusSubmitted')
	expect(spinning()).toBe(true)
	await act(async () => handlers().callbackFinalized!())
	expect(spinning()).toBe(false)
	expect(container.textContent).toContain('xcmStatusBalanceUpdated')
})

test('delivery tracking retains the submitted recipient and survives the form unmounting', async () => {
	await render()
	await act(async () => handlers().callbackSubmit!())
	const submitted = handlers()
	await render(true, { ...input, recipient: 'different-recipient' })
	expect(
		mocked.serviceApi.stablecoins.subscribe.balances,
	).toHaveBeenCalledOnce()
	await render(false)
	expect(listeners[0].unsubscribe).not.toHaveBeenCalled()
	expect(spinning()).toBe(true)
	await act(async () => submitted.callbackFinalized!())
	expect(spinning()).toBe(true)
	await act(async () => listeners[0].onBalance(destinationBalance))
	expect(spinning()).toBe(false)
	expect(mocked.serviceApi.stablecoins.query.balances).toHaveBeenCalledWith(
		'external-recipient',
	)
	expect(listeners[0].unsubscribe).toHaveBeenCalledOnce()
})

test('a delivery timeout stops the spinner, releases the subscription, and ignores late updates', async () => {
	await render()
	await act(async () => handlers().callbackSubmit!())
	await act(async () => handlers().callbackFinalized!())
	await advance(119_999)
	expect(spinning()).toBe(true)
	await advance(1)
	expect(spinning()).toBe(false)
	expect(container.textContent).toContain('xcmStatusUnconfirmed')
	expect(listeners[0].unsubscribe).toHaveBeenCalledOnce()
	await act(async () => listeners[0].onBalance(destinationBalance))
	expect(container.textContent).toContain('xcmStatusUnconfirmed')
	expect(mocked.serviceApi.stablecoins.query.balances).not.toHaveBeenCalled()
})

test('source failure releases the subscription and enables retrying', async () => {
	await render()
	await act(async () => handlers().callbackSubmit!())
	expect(handlers().shouldSubmit).toBe(false)
	await act(async () => handlers().callbackFailure!())
	expect(spinning()).toBe(false)
	expect(listeners[0].unsubscribe).toHaveBeenCalledOnce()
	expect(handlers().shouldSubmit).toBe(true)
})

test('subscription cleanup errors cannot leave a failed transfer pending', async () => {
	await render()
	await act(async () => handlers().callbackSubmit!())
	listeners[0].unsubscribe.mockImplementationOnce(() => {
		throw new Error('Cleanup failed')
	})
	await act(async () => {
		expect(() => handlers().callbackFailure!()).toThrow('Cleanup failed')
	})
	expect(spinning()).toBe(false)
	expect(handlers().shouldSubmit).toBe(true)
	await act(async () => handlers().callbackFailure!())
	expect(listeners[0].unsubscribe).toHaveBeenCalledOnce()
})

test.each([false, true])(
	'a subscription error becomes unconfirmed after source finality (already finalized: %s)',
	async (finalized) => {
		await render()
		await act(async () => handlers().callbackSubmit!())
		if (finalized) await act(async () => handlers().callbackFinalized!())
		await act(async () => listeners[0].onError(new Error('Disconnected')))
		if (!finalized) {
			expect(spinning()).toBe(true)
			await act(async () => handlers().callbackFinalized!())
		}
		expect(spinning()).toBe(false)
		expect(container.textContent).toContain('xcmStatusUnconfirmed')
		expect(listeners[0].unsubscribe).toHaveBeenCalledOnce()
	},
)

test('finishing one transfer does not stop the spinner for another pending delivery', async () => {
	await render(false)
	await act(async () => {
		deliveries.push(trackCrossChainDelivery(mocked.serviceApi, input, quote))
		deliveries.push(trackCrossChainDelivery(mocked.serviceApi, input, quote))
	})
	await act(async () => deliveries[0].failed())
	expect(spinning()).toBe(true)
	await act(async () => deliveries[1].finalized())
	await act(async () => listeners[1].onBalance(destinationBalance))
	expect(spinning()).toBe(false)
	expect(
		listeners.every(({ unsubscribe }) => unsubscribe.mock.calls.length === 1),
	).toBe(true)
})
