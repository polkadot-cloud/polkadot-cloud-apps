// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { TxFailure, TxStatusHandlers } from 'types'
import { afterEach, expect, test, vi } from 'vitest'
import type { SubmittableExtrinsic } from '../../global-bus/node_modules/dedot/index.js'
import type { TxStatus } from '../../global-bus/node_modules/dedot/types/index.js'
import {
	addSend,
	addSignAndSend,
	addUid,
	getUid,
	handleResult,
	pendingTxCount,
	removeSub,
	removeUid,
	setUidPending,
	setUidSubmitted,
	subs,
} from '../../global-bus/src/txSubmit'
import { _uids } from '../../global-bus/src/txSubmit/private'

afterEach(() => {
	for (const uid of Object.keys(subs)) removeSub(Number(uid))
	_uids.next([])
})

test('transaction ids remain unique when a quote footer is removed beside a pending transaction', () => {
	const first = addUid({ network: 'polkadot', from: 'sender' })
	const second = addUid({ network: 'polkadot', from: 'sender' })
	const pending = addUid({ network: 'polkadot', from: 'sender' })
	setUidPending(pending, true)
	removeUid(second)
	const next = addUid({ network: 'polkadot', from: 'sender' })
	expect(next).toBeGreaterThan(pending)
	expect(new Set(_uids.getValue().map(({ uid }) => uid)).size).toBe(3)
	expect(getUid(pending)?.pending).toBe(true)
	expect(getUid(first)).toBeDefined()
})

test('new submissions never reuse the id of a completed transaction', () => {
	const uid = addUid({ network: 'polkadot', from: 'sender' })
	removeUid(uid)
	expect(addUid({ network: 'polkadot', from: 'sender' })).toBeGreaterThan(uid)
})

test('replacing a tagged draft preserves an active submission with that tag', () => {
	const first = addUid({ network: 'polkadot', from: 'alice', tag: 'send' })
	setUidSubmitted(first, true)
	const next = addUid({ network: 'polkadot', from: 'alice', tag: 'send' })
	expect(getUid(first)).toMatchObject({ submitted: true, tag: undefined })
	expect(getUid(next)?.tag).toBe('send')
	expect(_uids.getValue().filter(({ tag }) => tag === 'send')).toHaveLength(1)
})

test.each(['finalized', 'invalid', 'dispatch'] as const)(
	'cleans up a %s attempt even when its callback throws',
	(outcome) => {
		const uid = addUid({ network: 'polkadot', from: 'alice' })
		const unsubscribe = vi.fn().mockResolvedValue(undefined)
		subs[uid] = unsubscribe
		const fail = () => {
			throw new Error('UI callback failed')
		}
		const handlers: TxStatusHandlers = {
			onReady: vi.fn(),
			onInBlock: vi.fn(),
			onFinalized: fail,
			onFailed: fail,
			onError: vi.fn(),
		}
		const status: TxStatus =
			outcome === 'invalid'
				? { type: 'Invalid', value: { error: 'Rejected' } }
				: {
						type: 'Finalized',
						value: { blockHash: '0x01', blockNumber: 1, txIndex: 0 },
					}
		expect(() =>
			handleResult(
				uid,
				status,
				handlers,
				outcome === 'dispatch'
					? { type: 'dispatch', error: { type: 'BadOrigin' } }
					: undefined,
			),
		).toThrow('UI callback failed')
		expect(getUid(uid)).toBeUndefined()
		expect(subs[uid]).toBeUndefined()
		expect(unsubscribe).toHaveBeenCalledOnce()
	},
)

test('a dropped transaction reports failure and releases the submission', () => {
	const uid = addUid({ network: 'polkadot', from: 'alice' })
	const handlers = {
		onReady: vi.fn(),
		onInBlock: vi.fn(),
		onFinalized: vi.fn(),
		onFailed: vi.fn(),
	}
	handleResult(
		uid,
		{ type: 'Drop', value: { error: 'Dropped from pool' } },
		handlers,
	)
	expect(handlers.onFailed).toHaveBeenCalledExactlyOnceWith({ type: 'invalid' })
	expect(getUid(uid)).toBeUndefined()
})

test('a retracted inclusion restores the pending nonce count', () => {
	const uid = addUid({ network: 'polkadot', from: 'alice' })
	setUidSubmitted(uid, true, { from: 'alice', genesisHash: '0x01' })
	const handlers = {
		onReady: vi.fn(),
		onInBlock: vi.fn(),
		onFinalized: vi.fn(),
		onFailed: vi.fn(),
	}
	handleResult(uid, { type: 'Broadcasting' }, handlers)
	handleResult(
		uid,
		{
			type: 'BestChainBlockIncluded',
			value: { blockHash: '0x01', blockNumber: 1, txIndex: 0 },
		},
		handlers,
	)
	expect(pendingTxCount('alice', '0x01')).toBe(0)
	expect(getUid(uid)?.submitted).toBe(true)
	handleResult(uid, { type: 'NoLongerInBestChain' }, handlers)
	expect(pendingTxCount('alice', '0x01')).toBe(1)
	expect(handlers.onFailed).not.toHaveBeenCalled()
})

test('a reverted swap reports failure and never reports inclusion or finalization as success', () => {
	const uid = addUid({ network: 'polkadot', from: 'sender' })
	setUidPending(uid, true)
	const handlers = {
		onReady: vi.fn(),
		onInBlock: vi.fn(),
		onFinalized: vi.fn(),
		onFailed: vi.fn(),
	}
	const failure: TxFailure = {
		type: 'dispatch',
		error: { type: 'Module', value: { index: 55, error: '0x12000000' } },
		module: {
			pallet: 'AssetConversion',
			name: 'ProvidedMinimumNotSufficientForSwap',
		},
	}
	handleResult(
		uid,
		{
			type: 'BestChainBlockIncluded',
			value: { blockHash: '0x01', blockNumber: 1, txIndex: 0 },
		},
		handlers,
		failure,
	)
	handleResult(
		uid,
		{
			type: 'Finalized',
			value: { blockHash: '0x01', blockNumber: 1, txIndex: 0 },
		},
		handlers,
	)
	expect(handlers.onFailed).toHaveBeenCalledExactlyOnceWith(failure)
	expect(handlers.onInBlock).not.toHaveBeenCalled()
	expect(handlers.onFinalized).not.toHaveBeenCalled()
	expect(getUid(uid)).toBeUndefined()
})
test('an invalid transaction reports a structured failure and removes its submission', () => {
	const uid = addUid({ network: 'polkadot', from: 'sender' })
	const handlers = {
		onReady: vi.fn(),
		onInBlock: vi.fn(),
		onFinalized: vi.fn(),
		onFailed: vi.fn(),
	}
	handleResult(uid, { type: 'Invalid', value: { error: 'Rejected' } }, handlers)

	expect(handlers.onFailed).toHaveBeenCalledExactlyOnceWith({
		type: 'invalid',
	})
	expect(handlers.onFinalized).not.toHaveBeenCalled()
	expect(getUid(uid)).toBeUndefined()
})

type DispatchFailure = Extract<TxFailure, { type: 'dispatch' }>
const failures: {
	name: string
	error: DispatchFailure['error']
	module?: DispatchFailure['module']
}[] = [
	{
		name: 'a decoded pallet error',
		error: { type: 'Module', value: { index: 56, error: '0x03000000' } },
		module: { pallet: 'Psm', name: 'FeeTooHigh' },
	},
	{
		name: 'an unknown pallet error',
		error: { type: 'Module', value: { index: 255, error: '0xff000000' } },
	},
	{ name: 'a token error', error: { type: 'Token', value: 'Frozen' } },
]

for (const path of ['extension', 'manual'] as const) {
	test.each(failures)(
		`${path} signing preserves $name without reducing it to a message`,
		async ({ error, module }) => {
			const uid = addUid({ network: 'polkadot', from: 'sender' })
			const handlers = {
				onReady: vi.fn(),
				onInBlock: vi.fn(),
				onFinalized: vi.fn(),
				onFailed: vi.fn(),
				onError: vi.fn(),
			}
			const findErrorMeta = vi.fn().mockReturnValue(module)
			const unsubscribe = vi.fn().mockResolvedValue(undefined)
			const submit = async (
				callback: (result: {
					status: TxStatus
					dispatchError: DispatchFailure['error']
				}) => void | Promise<void>,
			) => {
				await callback({
					status: {
						type: 'BestChainBlockIncluded',
						value: { blockHash: '0x01', blockNumber: 1, txIndex: 0 },
					},
					dispatchError: error,
				})
				return unsubscribe
			}
			const tx = {
				client: { registry: { findErrorMeta } },
				call: { pallet: 'Utility', palletCall: { name: 'BatchAll' } },
				attachSignature: vi.fn(),
				send: submit,
				signAndSend: (
					_from: unknown,
					_options: unknown,
					callback: Parameters<typeof submit>[0],
				) => submit(callback),
			} as unknown as SubmittableExtrinsic

			try {
				if (path === 'manual') {
					await addSend(
						'polkadot',
						uid,
						tx,
						{} as Parameters<typeof addSend>[3],
						handlers,
					)
				} else {
					await addSignAndSend(
						'polkadot',
						uid,
						'sender',
						tx,
						{} as Parameters<typeof addSignAndSend>[4],
						0,
						handlers,
					)
				}

				expect(handlers.onFailed).toHaveBeenCalledExactlyOnceWith({
					type: 'dispatch',
					error,
					module,
				})
				expect(handlers.onFailed.mock.calls[0][0].error).toBe(error)
				expect(handlers.onError).not.toHaveBeenCalled()
				expect(handlers.onInBlock).not.toHaveBeenCalled()
				expect(handlers.onFinalized).not.toHaveBeenCalled()
				expect(getUid(uid)).toBeUndefined()
				expect(subs[uid]).toBeUndefined()
				expect(unsubscribe).toHaveBeenCalledOnce()
				if (error.type === 'Module') {
					expect(findErrorMeta).toHaveBeenCalledExactlyOnceWith(error)
				} else {
					expect(findErrorMeta).not.toHaveBeenCalled()
				}
			} finally {
				removeSub(uid)
			}
		},
	)
}
