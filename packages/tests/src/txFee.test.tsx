// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only
// @vitest-environment jsdom

import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { addUid, getUid, uids$, updateFee } from '../../global-bus/src/txSubmit'
import { _uids } from '../../global-bus/src/txSubmit/private'
import { SubmittableExtrinsic } from '../../tx-submit/node_modules/dedot/index.js'
import type { UseTxFeeProps } from '../../tx-submit/src/types'
import { useTxFee } from '../../tx-submit/src/useTxFee'

const client = {}
const transaction = (hex = '0x01', api = client) =>
	({
		client: api,
		call: { pallet: 'Balances', palletCall: { name: 'Transfer' } },
		toHex: () => hex,
	}) as unknown as SubmittableExtrinsic

const deferred = () => {
	let resolve!: (value: bigint) => void
	let reject!: (error: Error) => void
	const promise = new Promise<bigint>((done, fail) => {
		resolve = done
		reject = fail
	})
	return { promise, resolve, reject }
}

const paymentInfo = vi.fn()
let feeTx: SubmittableExtrinsic
let props: UseTxFeeProps
let root: Root | undefined
let container: HTMLDivElement
const Probe = (inputs: UseTxFeeProps) => {
	useTxFee(inputs)
	return null
}
const render = (inputs: Partial<UseTxFeeProps> = {}) => {
	props = { ...props, ...inputs }
	return act(async () => root!.render(createElement(Probe, props)))
}

beforeEach(() => {
	vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
	_uids.next([])
	paymentInfo.mockReset().mockResolvedValue({ partialFee: 75n })
	feeTx = { paymentInfo } as unknown as SubmittableExtrinsic
	vi.spyOn(SubmittableExtrinsic, 'fromTx').mockReturnValue(feeTx)
	props = {
		uid: addUid({ network: 'polkadot', from: 'alice' }),
		tx: transaction(),
		from: 'alice',
	}
	container = document.createElement('div')
	document.body.append(container)
	root = createRoot(container)
})

afterEach(async () => {
	await act(async () => root?.unmount())
	container.remove()
	_uids.next([])
	vi.restoreAllMocks()
	vi.unstubAllGlobals()
})

test('estimates native fees on a separate extrinsic with the current signer and payment options', async () => {
	const feePaymentOptions = { tip: 2n }
	await render({ feePaymentOptions })

	expect(SubmittableExtrinsic.fromTx).toHaveBeenCalledWith(
		props.tx!.client,
		props.tx!.call,
	)
	expect(paymentInfo).toHaveBeenCalledWith('alice', feePaymentOptions)
	expect(getUid(props.uid)?.fee).toBe(75n)
})

test('uses the custom estimator for an alternative fee asset', async () => {
	const feePaymentOptions = { assetId: 1337 }
	const feeEstimator = vi.fn().mockResolvedValue(120n)
	await render({ feeEstimator, feePaymentOptions })

	expect(feeEstimator).toHaveBeenCalledWith({
		tx: feeTx,
		from: 'alice',
		feePaymentOptions,
	})
	expect(paymentInfo).not.toHaveBeenCalled()
	expect(getUid(props.uid)?.fee).toBe(120n)
})

test.each([0n, 100n])(
	'uses a supplied fee of %s and updates it without a loading reset',
	async (estimatedFee) => {
		const feeEstimator = vi.fn()
		await render({ estimatedFee, feeEstimator })
		expect(getUid(props.uid)?.fee).toBe(estimatedFee)
		expect(SubmittableExtrinsic.fromTx).not.toHaveBeenCalled()
		expect(feeEstimator).not.toHaveBeenCalled()

		const fees: bigint[] = []
		const subscription = uids$.subscribe(() =>
			fees.push(getUid(props.uid)!.fee),
		)
		try {
			await render({ estimatedFee: 150n })
			expect(fees).toEqual([estimatedFee, 150n])
		} finally {
			subscription.unsubscribe()
		}
	},
)

test('equivalent transaction and payment objects do not trigger another fee request', async () => {
	await render({ feePaymentOptions: { tip: 2n } })
	await render({ tx: transaction(), feePaymentOptions: { tip: 2n } })

	expect(paymentInfo).toHaveBeenCalledTimes(1)
	expect(getUid(props.uid)?.fee).toBe(75n)
})

const changes: [string, () => Partial<UseTxFeeProps>][] = [
	['transaction', () => ({ tx: transaction('0x02') })],
	['signer', () => ({ from: 'bob' })],
	['fee asset', () => ({ feePaymentOptions: { assetId: 1337 } })],
	['chain client', () => ({ tx: transaction('0x01', {}) })],
]
for (const outcome of ['success', 'failure'] as const) {
	test.each(changes)(
		`a late ${outcome} cannot overwrite the fee after the %s changes`,
		async (_name, change) => {
			const old = deferred()
			const feeEstimator = vi
				.fn()
				.mockReturnValueOnce(old.promise)
				.mockResolvedValueOnce(120n)
			await render({ feeEstimator })
			await render(change())
			expect(feeEstimator).toHaveBeenCalledTimes(2)
			expect(getUid(props.uid)?.fee).toBe(120n)

			await act(async () => {
				if (outcome === 'success') old.resolve(999n)
				else old.reject(new Error('Old estimate failed'))
			})
			expect(getUid(props.uid)?.fee).toBe(120n)
		},
	)
}

test('a supplied fee supersedes an in-flight estimate', async () => {
	const pending = deferred()
	await render({ feeEstimator: () => pending.promise })
	await render({ estimatedFee: 150n })
	await act(async () => pending.resolve(999n))

	expect(getUid(props.uid)?.fee).toBe(150n)
})

test('a current estimation failure clears the previous fee', async () => {
	updateFee(props.uid, 120n)
	paymentInfo.mockRejectedValue(new Error('Fee unavailable'))
	await render()

	expect(getUid(props.uid)?.fee).toBe(0n)
})

test.each(['tx', 'from'] as const)(
	'clears the fee when %s becomes unavailable',
	async (key) => {
		await render()
		expect(getUid(props.uid)?.fee).toBe(75n)
		await render({ [key]: undefined })
		expect(getUid(props.uid)?.fee).toBe(0n)
	},
)

test('unmounting prevents a pending estimate from updating the submission', async () => {
	const pending = deferred()
	await render({ feeEstimator: () => pending.promise })
	await act(async () => root!.unmount())
	root = undefined
	await act(async () => pending.resolve(999n))

	expect(getUid(props.uid)?.fee).toBe(0n)
})
