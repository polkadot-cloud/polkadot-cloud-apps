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
		fetchedAt: Date.now(),
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

test('expiry automatically renews the quote and fee while retaining the last values', async () => {
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
	await advance(30_001)
	expect(api.stablecoins.xcm.prepare).toHaveBeenCalledTimes(2)
	expect(result.expired).toBe(true)
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
	expect(result.expired).toBe(true)
	await act(async () => resolveFee(20n))
	expect(result.quote?.receivedAmount).toBe(2_000_000n)
	expect(result.networkFee).toBe(20n)
	expect(result.loading).toBe(false)
	expect(result.expired).toBe(false)
	await advance(30_001)
	expect(api.stablecoins.xcm.prepare).toHaveBeenCalledTimes(3)
	expect(result.expired).toBe(false)
})

test('a failed automatic renewal blocks submission and can be retried without a request loop', async () => {
	api.stablecoins.xcm.prepare.mockImplementation(async () => quote(1_000_000n))
	await render()
	await advance(400)
	expect(result.networkFee).toBe(10n)
	api.stablecoins.fee.estimate.mockRejectedValueOnce(
		new Error('Fee unavailable'),
	)
	await advance(30_001)
	expect(result.error).toBe('Fee unavailable')
	expect(result.quote).toBeUndefined()
	expect(result.networkFee).toBeUndefined()
	expect(result.loading).toBe(false)
	await advance(30_001)
	expect(api.stablecoins.xcm.prepare).toHaveBeenCalledTimes(2)
	await act(async () => result.refresh())
	expect(result.error).toBeUndefined()
	expect(result.expired).toBe(false)
	expect(result.quote).toBeDefined()
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
