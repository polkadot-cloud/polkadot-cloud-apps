// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
// @vitest-environment jsdom

import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { CrossChainTransfer, CrossChainTransferInput } from 'types'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { useCrossChainTransfer } from '../../hooks/src/useCrossChainTransfer'

const api = vi.hoisted(() => ({
	stablecoins: {
		xcm: { prepare: vi.fn() },
		fee: { estimate: vi.fn(), paymentOptions: vi.fn() },
	},
}))
vi.mock('../../hooks/src/useApi', () => ({
	useApi: () => ({ serviceApi: api }),
}))

const original: CrossChainTransferInput = {
	from: 'statemint',
	to: 'hydration',
	symbol: 'USDC',
	amount: 1_000_000n,
	sender: 'sender',
	recipient: 'recipient',
	feeAsset: 'USDC',
}
let root: Root
let container: HTMLDivElement
let result: ReturnType<typeof useCrossChainTransfer>
const Probe = ({
	input,
	enabled,
}: {
	input: CrossChainTransferInput
	enabled: boolean
}) => {
	result = useCrossChainTransfer(input, enabled)
	return null
}
const render = (input = original, enabled = true) =>
	act(async () => root.render(createElement(Probe, { input, enabled })))
const advance = (milliseconds: number) =>
	act(async () => vi.advanceTimersByTimeAsync(milliseconds))
const quote = (amount: bigint) =>
	({
		receivedAmount: amount,
		tx: {},
	}) as CrossChainTransfer

beforeEach(() => {
	vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
	vi.useFakeTimers()
	vi.clearAllMocks()
	api.stablecoins.fee.estimate.mockResolvedValue(10n)
	container = document.createElement('div')
	root = createRoot(container)
})
afterEach(async () => {
	await act(async () => root.unmount())
	vi.useRealTimers()
	vi.unstubAllGlobals()
})

test('a late simulation cannot replace a transfer after the destination changes', async () => {
	let resolve!: (value: CrossChainTransfer) => void
	api.stablecoins.xcm.prepare.mockReturnValueOnce(
		new Promise<CrossChainTransfer>((done) => {
			resolve = done
		}),
	)
	api.stablecoins.xcm.prepare.mockResolvedValueOnce(quote(2_000_000n))
	await render()
	await advance(400)
	await render({ ...original, recipient: 'new-recipient' })
	expect(result.quote).toBeUndefined()
	await advance(400)
	expect(result.quote?.receivedAmount).toBe(2_000_000n)
	await act(async () => resolve(quote(1_000_000n)))
	expect(result.quote?.receivedAmount).toBe(2_000_000n)
	expect(api.stablecoins.fee.estimate).toHaveBeenCalledOnce()
})

test('an unchanged bridge transfer never expires or prepares again on a timer', async () => {
	api.stablecoins.xcm.prepare.mockImplementation(async () => quote(1_000_000n))
	await render()
	await advance(400)
	const previous = result.quote
	await advance(300_000)
	await render()
	expect(api.stablecoins.xcm.prepare).toHaveBeenCalledOnce()
	expect(api.stablecoins.fee.estimate).toHaveBeenCalledOnce()
	expect(result.quote).toBe(previous)
	expect(result.loading).toBe(false)
})

test('explicit revalidation returns the fresh transfer after its fee is checked, without overlapping requests', async () => {
	api.stablecoins.xcm.prepare.mockImplementation(async () => quote(1_000_000n))
	await render()
	await advance(400)
	const previous = result.quote
	let resolveQuote!: (value: CrossChainTransfer) => void
	let resolveFee!: (value: bigint) => void
	api.stablecoins.xcm.prepare.mockReturnValueOnce(
		new Promise<CrossChainTransfer>((resolve) => {
			resolveQuote = resolve
		}),
	)
	api.stablecoins.fee.estimate.mockReturnValueOnce(
		new Promise<bigint>((resolve) => {
			resolveFee = resolve
		}),
	)
	let pending!: Promise<CrossChainTransfer | undefined>
	await act(async () => {
		pending = result.refresh()
	})
	expect(api.stablecoins.xcm.prepare).toHaveBeenCalledTimes(2)
	expect(result.loading).toBe(true)
	expect(result.quote).toBe(previous)
	expect(result.networkFee).toBe(10n)
	await act(async () => {
		result.refresh()
		result.refresh()
	})
	expect(api.stablecoins.xcm.prepare).toHaveBeenCalledTimes(2)
	await act(async () => resolveQuote(quote(2_000_000n)))
	expect(result.quote).toBe(previous)
	expect(result.loading).toBe(true)
	await act(async () => resolveFee(20n))
	expect(result.quote?.receivedAmount).toBe(2_000_000n)
	expect(result.networkFee).toBe(20n)
	expect(result.loading).toBe(false)
	expect(await pending).toBe(result.quote)
	await advance(30_001)
	expect(api.stablecoins.xcm.prepare).toHaveBeenCalledTimes(2)
})

test('failed revalidation invalidates the transaction and can be retried without a request loop', async () => {
	api.stablecoins.xcm.prepare.mockImplementation(async () => quote(1_000_000n))
	await render()
	await advance(400)
	expect(result.networkFee).toBe(10n)
	api.stablecoins.fee.estimate.mockRejectedValueOnce(
		new Error('Fee unavailable'),
	)
	await act(async () => expect(await result.refresh()).toBeUndefined())
	expect(result.error).toBe('Fee unavailable')
	expect(result.quote).toBeUndefined()
	expect(result.networkFee).toBeUndefined()
	expect(result.loading).toBe(false)
	await advance(30_001)
	expect(api.stablecoins.xcm.prepare).toHaveBeenCalledTimes(2)
	await act(async () => result.refresh())
	expect(result.error).toBeUndefined()
	expect(result.quote).toBeDefined()
})

test('revalidation returns no transaction if the form changes while it is running', async () => {
	api.stablecoins.xcm.prepare.mockResolvedValue(quote(1_000_000n))
	await render()
	await advance(400)
	let resolve!: (value: CrossChainTransfer) => void
	api.stablecoins.xcm.prepare.mockReturnValueOnce(
		new Promise<CrossChainTransfer>((done) => {
			resolve = done
		}),
	)
	let pending!: Promise<CrossChainTransfer | undefined>
	await act(async () => {
		pending = result.refresh()
	})
	await render({ ...original, recipient: 'new-recipient' })
	await advance(400)
	const current = result.quote
	await act(async () => resolve(quote(2_000_000n)))
	expect(await pending).toBeUndefined()
	expect(result.quote).toBe(current)
})

test('disabling preparation while fee currency changes immediately invalidates the quote', async () => {
	api.stablecoins.xcm.prepare.mockResolvedValue(quote(1_000_000n))
	await render()
	await advance(400)
	expect(result.quote).toBeDefined()
	await render(original, false)
	expect(result.quote).toBeUndefined()
	expect(result.loading).toBe(false)
	await advance(30_001)
	expect(api.stablecoins.xcm.prepare).toHaveBeenCalledOnce()
})

test('changing the route releases a stalled revalidation', async () => {
	api.stablecoins.xcm.prepare.mockResolvedValue(quote(1_000_000n))
	await render()
	await advance(400)
	api.stablecoins.xcm.prepare.mockReturnValueOnce(new Promise(() => {}))
	let pending!: Promise<CrossChainTransfer | undefined>
	await act(async () => {
		pending = result.refresh()
	})
	expect(result.loading).toBe(true)
	await render(original, false)
	expect(await pending).toBeUndefined()
	expect(result.loading).toBe(false)
	expect(vi.getTimerCount()).toBe(0)
})
