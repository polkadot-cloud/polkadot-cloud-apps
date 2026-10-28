// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { afterEach, expect, test, vi } from 'vitest'
import {
	type SubmittableExtrinsic,
	SubmittableResult,
} from '../../global-bus/node_modules/dedot/index.js'
import type { ISubmittableResult } from '../../global-bus/node_modules/dedot/types/index.js'
import {
	addSend,
	addSignAndSend,
	addUid,
	getUid,
	removeSub,
	subs,
} from '../../global-bus/src/txSubmit'
import { _uids } from '../../global-bus/src/txSubmit/private'

afterEach(() => {
	for (const uid of Object.keys(subs)) removeSub(Number(uid))
	_uids.next([])
})

const error = { type: 'Token', value: 'Frozen' } as const
const cases: {
	event: ISubmittableResult['events'][number]['event']
	failed: boolean
}[] = [
	{
		event: {
			pallet: 'Proxy',
			palletEvent: {
				name: 'ProxyExecuted',
				data: { result: { isErr: true, err: error } },
			},
		},
		failed: true,
	},
	{
		event: {
			pallet: 'Utility',
			palletEvent: { name: 'BatchInterrupted', data: { index: 0, error } },
		},
		failed: true,
	},
	{
		event: {
			pallet: 'Utility',
			palletEvent: { name: 'ItemFailed', data: { error } },
		},
		failed: true,
	},
	{
		event: {
			pallet: 'Proxy',
			palletEvent: {
				name: 'ProxyExecuted',
				data: { result: { isOk: true, value: [] } },
			},
		},
		failed: false,
	},
	{
		event: { pallet: 'Utility', palletEvent: 'BatchCompleted' },
		failed: false,
	},
	{
		event: {
			pallet: 'Other',
			palletEvent: { name: 'ItemFailed', data: { error } },
		},
		failed: false,
	},
]

for (const path of ['extension', 'manual'] as const) {
	test.each(cases)(
		`${path} signing handles wrapped event $event with failed=$failed`,
		async ({ event, failed }) => {
			const result = new SubmittableResult<
				ISubmittableResult['events'][number]
			>({
				txHash: '0x01',
				status: {
					type: 'BestChainBlockIncluded',
					value: { blockHash: '0x01', blockNumber: 1, txIndex: 0 },
				},
				events: [
					{ event, phase: { type: 'ApplyExtrinsic', value: 0 }, topics: [] },
					{
						event: {
							pallet: 'System',
							palletEvent: { name: 'ExtrinsicSuccess', data: {} },
						},
						phase: { type: 'ApplyExtrinsic', value: 0 },
						topics: [],
					},
				],
			})
			// Dedot reports outer extrinsic success even when the wrapped call failed.
			expect(result.dispatchError).toBeUndefined()
			const uid = addUid({ network: 'polkadot', from: 'alice' })
			const handlers = {
				onReady: vi.fn(),
				onInBlock: vi.fn(),
				onFinalized: vi.fn(),
				onFailed: vi.fn(),
				onError: vi.fn(),
			}
			const unsubscribe = vi.fn().mockResolvedValue(undefined)
			const submit = async (
				callback: (value: ISubmittableResult) => void | Promise<void>,
			) => {
				await callback(result)
				return unsubscribe
			}
			const tx = {
				call: { pallet: 'Utility', palletCall: { name: 'Batch' } },
				attachSignature: vi.fn(),
				send: submit,
				signAndSend: (
					_from: unknown,
					_options: unknown,
					callback: Parameters<typeof submit>[0],
				) => submit(callback),
			} as unknown as SubmittableExtrinsic
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
					'alice',
					tx,
					{} as Parameters<typeof addSignAndSend>[4],
					0,
					handlers,
				)
			}
			if (failed) {
				expect(handlers.onFailed).toHaveBeenCalledExactlyOnceWith({
					type: 'dispatch',
					error,
					module: undefined,
				})
				expect(handlers.onInBlock).not.toHaveBeenCalled()
				expect(getUid(uid)).toBeUndefined()
				expect(unsubscribe).toHaveBeenCalledOnce()
			} else {
				expect(handlers.onFailed).not.toHaveBeenCalled()
				expect(handlers.onInBlock).toHaveBeenCalledOnce()
			}
			expect(handlers.onError).not.toHaveBeenCalled()
		},
	)
}
