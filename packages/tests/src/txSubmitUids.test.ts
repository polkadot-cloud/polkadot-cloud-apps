// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { TxStatus } from 'dedot/types'
import { afterEach, expect, test, vi } from 'vitest'
import {
	addUid,
	getUid,
	handleResult,
	removeUid,
	setUidPending,
} from '../../global-bus/src/txSubmit'
import { _uids } from '../../global-bus/src/txSubmit/private'

afterEach(() => _uids.next([]))

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

test('a reverted swap reports failure and never reports inclusion or finalization as success', () => {
	const uid = addUid({ network: 'polkadot', from: 'sender' })
	setUidPending(uid, true)
	const handlers = {
		onReady: vi.fn(),
		onInBlock: vi.fn(),
		onFinalized: vi.fn(),
		onFailed: vi.fn(),
	}
	const failure = new Error('ProvidedMinimumNotSufficientForSwap')
	handleResult(
		uid,
		{ type: 'BestChainBlockIncluded' } as TxStatus,
		handlers,
		failure,
	)
	handleResult(uid, { type: 'Finalized' } as TxStatus, handlers)
	expect(handlers.onFailed).toHaveBeenCalledExactlyOnceWith(failure)
	expect(handlers.onInBlock).not.toHaveBeenCalled()
	expect(handlers.onFinalized).not.toHaveBeenCalled()
	expect(getUid(uid)).toBeUndefined()
})
