// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { createRequire } from 'node:module'
import { setImmediate } from 'node:timers/promises'
import { describe, expect, test, vi } from 'vitest'
import { $Header } from '../../dedot-api/node_modules/dedot/codecs/index.js'
import {
	ChainHead,
	NetworkDisconnectedError,
} from '../../dedot-api/node_modules/dedot/index.js'
import {
	deferred,
	u8aToHex,
} from '../../dedot-api/node_modules/dedot/utils/index.js'

const require = createRequire(import.meta.url)
const cjs = require('../../dedot-api/node_modules/dedot/cjs/index.js') as {
	ChainHead: typeof ChainHead
	NetworkDisconnectedError: typeof NetworkDisconnectedError
}
const blockHash = `0x${'11'.repeat(32)}` as const
const zeroHash = `0x${'00'.repeat(32)}` as const
const header = u8aToHex(
	$Header.tryEncode({
		parentHash: zeroHash,
		number: 1,
		stateRoot: zeroHash,
		extrinsicsRoot: zeroHash,
		digest: { logs: [] },
	}),
)
const initialized = {
	event: 'initialized',
	finalizedBlockHashes: [blockHash],
	finalizedBlockRuntime: {
		type: 'valid',
		spec: {
			specName: 'test',
			implName: 'test',
			specVersion: 1,
			implVersion: 1,
			authoringVersion: 1,
			transactionVersion: 1,
			apis: {},
		},
	},
}

type FollowCallback = (
	event: Record<string, unknown>,
	subscription: { subscriptionId: string },
) => void

const createFixture = (ChainHeadClass: typeof ChainHead) => {
	const subscriptions: {
		withRuntime: boolean
		notify: (event: Record<string, unknown>) => void
		ack: ReturnType<typeof deferred<() => Promise<void>>>
	}[] = []
	const rpc = {
		chainHead_v1_follow: vi.fn(
			(withRuntime: boolean, callback: FollowCallback) => {
				const subscriptionId = `sub-${subscriptions.length + 1}`
				const ack = deferred<() => Promise<void>>()
				subscriptions.push({
					withRuntime,
					ack,
					notify: (event) => callback(event, { subscriptionId }),
				})
				return ack.promise
			},
		),
		chainHead_v1_header: vi.fn(async () => header),
	}
	const head = new ChainHeadClass(
		{ rpc, provider: {} } as unknown as ConstructorParameters<
			typeof ChainHead
		>[0],
		{ fixedVersion: 'v1' },
	)
	const acknowledge = (index: number) =>
		subscriptions[index].ack.resolve(async () => {})
	return { head, rpc, subscriptions, acknowledge }
}

describe.each([
	{ name: 'ESM', ChainHead, NetworkDisconnectedError },
	{ name: 'CommonJS', ...cjs },
])('Dedot chain-head recovery ($name)', (build) => {
	test.each([1, 2])(
		'waits for initialization after %i early stop events without replaying follow',
		async (stopCount) => {
			const { head, subscriptions, acknowledge } = createFixture(
				build.ChainHead,
			)
			let ready = false
			const following = head.follow().then(() => {
				ready = true
			})
			for (let index = 0; index < stopCount; index++) {
				await vi.waitFor(() =>
					expect(subscriptions.length).toBeGreaterThan(index),
				)
				acknowledge(index)
				subscriptions[index].notify({ event: 'stop' })
				await vi.waitFor(() =>
					expect(subscriptions.length).toBeGreaterThan(index + 1),
				)
				// Keep the replacement subscription acknowledgement pending to expose the race.
				await setImmediate()
				expect(subscriptions.map(({ withRuntime }) => withRuntime)).toEqual(
					Array(index + 2).fill(true),
				)
				expect(ready).toBe(false)
			}
			acknowledge(stopCount)
			subscriptions[stopCount].notify(initialized)
			await following
			expect(await head.finalizedHash()).toBe(blockHash)
			await head.unfollow()
		},
	)

	test('retries disconnected header requests with the replacement subscription ID', async () => {
		const { head, rpc, subscriptions, acknowledge } = createFixture(
			build.ChainHead,
		)
		const following = head.follow()
		await vi.waitFor(() => expect(subscriptions).toHaveLength(1))
		acknowledge(0)
		subscriptions[0].notify(initialized)
		await following

		rpc.chainHead_v1_header.mockRejectedValueOnce(
			new build.NetworkDisconnectedError(),
		)
		const pendingHeader = head.send('header', 'sub-1', blockHash)
		await setImmediate()
		const reconnecting = head.follow(true)
		await vi.waitFor(() => expect(subscriptions).toHaveLength(2))
		acknowledge(1)
		subscriptions[1].notify(initialized)
		await reconnecting
		await expect(pendingHeader).resolves.toBe(header)
		expect(rpc.chainHead_v1_header).toHaveBeenLastCalledWith('sub-2', blockHash)
		await head.unfollow()
	})
})
