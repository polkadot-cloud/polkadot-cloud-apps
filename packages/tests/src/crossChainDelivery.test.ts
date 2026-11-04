// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
// @vitest-environment jsdom

import { encodeAddress } from 'dedot/utils'
import type {
	CrossChainTransfer,
	CrossChainTransferInput,
	ServiceInterface,
	StablecoinBalance,
} from 'types'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { getPendingCrossChainDeliveries } from '../../global-bus/src/crossChainDelivery'
import { trackCrossChainDelivery } from '../../tx-submit/src/trackCrossChainDelivery'

const baseline = 1_000_000n
const amount = 1_998_000n
const quote = {
	destinationBalance: baseline,
	receivedAmount: amount,
} as CrossChainTransfer
type Listener = {
	recipient: string
	chain: string
	onBalance: (balance: StablecoinBalance) => void
	unsubscribe: ReturnType<typeof vi.fn>
}
let sequence = 0
let input: CrossChainTransferInput
let serviceApi: ServiceInterface
let listeners: Listener[]
let trackers: ReturnType<typeof trackCrossChainDelivery>[]

const start = (
	currentQuote = quote,
	currentInput = input,
	api = serviceApi,
) => {
	const onDelivered = vi.fn()
	const onUnconfirmed = vi.fn()
	const tracker = trackCrossChainDelivery(api, currentInput, currentQuote, {
		onDelivered,
		onUnconfirmed,
	})
	trackers.push(tracker)
	return { ...tracker, onDelivered, onUnconfirmed }
}
const balance = (free: bigint, overrides: Partial<StablecoinBalance> = {}) =>
	({
		chain: input.to,
		symbol: input.symbol,
		free,
		...overrides,
	}) as StablecoinBalance
const emit = (free: bigint, overrides: Partial<StablecoinBalance> = {}) => {
	for (const listener of [...listeners])
		listener.onBalance(balance(free, overrides))
}

beforeEach(() => {
	vi.useFakeTimers()
	input = {
		from: 'statemint',
		to: 'hydration',
		symbol: 'USDC',
		amount: 2_000_000n,
		sender: 'sender',
		recipient: encodeAddress(new Uint8Array(32).fill(++sequence)),
		feeAsset: 'USDC',
	}
	listeners = []
	trackers = []
	serviceApi = {
		stablecoins: {
			subscribe: {
				balances: vi.fn((recipient, chain, onBalance) => {
					const unsubscribe = vi.fn()
					listeners.push({ recipient, chain, onBalance, unsubscribe })
					return unsubscribe
				}),
			},
			query: { balances: vi.fn().mockResolvedValue([]) },
		},
	} as unknown as ServiceInterface
})
afterEach(() => {
	for (const tracker of trackers) tracker.failed()
	expect(getPendingCrossChainDeliveries()).toHaveLength(0)
	vi.useRealTimers()
})

test('one receipt cannot complete both transfers quoted against the same balance', () => {
	const first = start()
	const second = start()
	first.finalized()
	second.finalized()
	emit(baseline + amount)
	expect(first.onDelivered).toHaveBeenCalledOnce()
	expect(second.onDelivered).not.toHaveBeenCalled()
	expect(getPendingCrossChainDeliveries()).toHaveLength(1)
	expect(listeners[1].unsubscribe).not.toHaveBeenCalled()
	emit(baseline + amount)
	expect(second.onDelivered).not.toHaveBeenCalled()
	emit(baseline + 2n * amount)
	expect(second.onDelivered).toHaveBeenCalledOnce()
	expect(
		listeners.every(({ unsubscribe }) => unsubscribe.mock.calls.length === 1),
	).toBe(true)
})

test('a second transfer that never arrives stays monitored until it is unconfirmed', async () => {
	const first = start()
	const second = start()
	first.finalized()
	second.finalized()
	emit(baseline + amount)
	await vi.advanceTimersByTimeAsync(120_000)
	expect(first.onDelivered).toHaveBeenCalledOnce()
	expect(second.onDelivered).not.toHaveBeenCalled()
	expect(second.onUnconfirmed).toHaveBeenCalledOnce()
})

test.each([false, true])(
	'receipt accounting is independent of source finality order (both received: %s)',
	(bothReceived) => {
		const first = start()
		const second = start()
		second.finalized()
		emit(baseline + (bothReceived ? 2n : 1n) * amount)
		expect(second.onDelivered).toHaveBeenCalledTimes(bothReceived ? 1 : 0)
		first.finalized()
		expect(first.onDelivered).toHaveBeenCalledOnce()
		expect(second.onDelivered).toHaveBeenCalledTimes(bothReceived ? 1 : 0)
		if (!bothReceived) emit(baseline + 2n * amount)
		expect(second.onDelivered).toHaveBeenCalledOnce()
	},
)

test('a source failure releases its reserved increase to the remaining transfer', () => {
	const first = start()
	const second = start()
	second.finalized()
	emit(baseline + amount)
	first.failed()
	expect(first.onDelivered).not.toHaveBeenCalled()
	expect(second.onDelivered).toHaveBeenCalledOnce()
})

test('cancelling an earlier transfer cannot reuse a later completed receipt', () => {
	const first = start()
	const second = start()
	second.finalized()
	emit(baseline + 2n * amount)
	expect(second.onDelivered).toHaveBeenCalledOnce()
	first.failed()
	const third = start()
	third.finalized()
	emit(baseline + 2n * amount)
	expect(third.onDelivered).not.toHaveBeenCalled()
	emit(baseline + 3n * amount)
	expect(third.onDelivered).toHaveBeenCalledOnce()
})

test('an unconfirmed transfer retains its reservation against a late receipt', async () => {
	const first = start()
	const second = start()
	first.finalized()
	await vi.advanceTimersByTimeAsync(60_000)
	second.finalized()
	await vi.advanceTimersByTimeAsync(60_000)
	expect(first.onUnconfirmed).toHaveBeenCalledOnce()
	emit(baseline + amount)
	expect(second.onDelivered).not.toHaveBeenCalled()
	emit(baseline + 2n * amount)
	expect(second.onDelivered).toHaveBeenCalledOnce()
	expect(first.onDelivered).not.toHaveBeenCalled()
})

test('a completed receipt cannot be reused by a later submission with an older quote', () => {
	const first = start()
	first.finalized()
	emit(baseline + amount)
	const second = start()
	second.finalized()
	emit(baseline + amount)
	expect(second.onDelivered).not.toHaveBeenCalled()
	emit(baseline + 2n * amount)
	expect(second.onDelivered).toHaveBeenCalledOnce()
})

test('a newer quote baseline includes earlier receipts without counting them twice', () => {
	const first = start()
	emit(baseline + amount)
	const second = start({ ...quote, destinationBalance: baseline + amount })
	first.finalized()
	second.finalized()
	emit(baseline + 2n * amount)
	expect(first.onDelivered).toHaveBeenCalledOnce()
	expect(second.onDelivered).toHaveBeenCalledOnce()
})

test('a fresh transfer can confirm after an earlier receipt has been spent', () => {
	const first = start()
	first.finalized()
	emit(baseline + amount)
	const second = start()
	second.finalized()
	emit(baseline)
	emit(baseline + amount)
	expect(second.onDelivered).toHaveBeenCalledOnce()
})

test('replacing the service does not let the same receipt confirm two trackers', () => {
	const first = start()
	const second = start(quote, input, {
		...serviceApi,
		stablecoins: { ...serviceApi.stablecoins },
	})
	first.finalized()
	second.finalized()
	emit(baseline + amount)
	expect(first.onDelivered).toHaveBeenCalledOnce()
	expect(second.onDelivered).not.toHaveBeenCalled()
	emit(baseline + 2n * amount)
	expect(second.onDelivered).toHaveBeenCalledOnce()
})

test('a notification error cannot prevent another fully received transfer from completing', () => {
	const first = start()
	const second = start()
	first.onDelivered.mockImplementationOnce(() => {
		throw new Error('Notification failed')
	})
	first.finalized()
	second.finalized()
	emit(baseline + 2n * amount)
	expect(first.onDelivered).toHaveBeenCalledOnce()
	expect(second.onDelivered).toHaveBeenCalledOnce()
	expect(getPendingCrossChainDeliveries()).toHaveLength(0)
})

test('different transfer amounts reserve their own expected increase', () => {
	const first = start()
	const second = start({ ...quote, receivedAmount: 3n * amount })
	first.finalized()
	second.finalized()
	emit(baseline + amount)
	expect(first.onDelivered).toHaveBeenCalledOnce()
	emit(baseline + 3n * amount)
	expect(second.onDelivered).not.toHaveBeenCalled()
	emit(baseline + 4n * amount)
	expect(second.onDelivered).toHaveBeenCalledOnce()
})

test('alternate SS58 prefixes for the same recipient share receipt accounting', () => {
	const first = start()
	const second = start(quote, {
		...input,
		recipient: encodeAddress(input.recipient, 0),
	})
	first.finalized()
	second.finalized()
	emit(baseline + amount)
	expect(first.onDelivered).toHaveBeenCalledOnce()
	expect(second.onDelivered).not.toHaveBeenCalled()
	emit(baseline + 2n * amount)
	expect(second.onDelivered).toHaveBeenCalledOnce()
})

test.each(['recipient', 'chain', 'asset'] as const)(
	'receipt accounting is isolated by %s',
	(dimension) => {
		const first = start()
		const otherInput = {
			...input,
			...(dimension === 'recipient' && {
				recipient: encodeAddress(new Uint8Array(32).fill(255)),
			}),
			...(dimension === 'chain' && {
				from: 'hydration' as const,
				to: 'statemint' as const,
			}),
			...(dimension === 'asset' && { symbol: 'USDT' as const }),
		}
		const second = start(quote, otherInput)
		first.finalized()
		second.finalized()
		listeners[0].onBalance(balance(baseline + amount))
		listeners[1].onBalance(
			balance(baseline + amount, {
				chain: otherInput.to,
				symbol: otherInput.symbol,
			}),
		)
		expect(first.onDelivered).toHaveBeenCalledOnce()
		expect(second.onDelivered).toHaveBeenCalledOnce()
	},
)
