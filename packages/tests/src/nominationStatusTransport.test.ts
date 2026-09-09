// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { afterAll, afterEach, beforeEach, expect, test, vi } from 'vitest'
import { client } from '../../plugin-staking-api/src/Client'
import { fetchGetNominationStatus } from '../../plugin-staking-api/src/queries/getNominationStatus'

const { httpFetch } = vi.hoisted(() => {
	const httpFetch = vi.fn<typeof fetch>()
	vi.stubGlobal('fetch', httpFetch)
	return { httpFetch }
})

const controllers: AbortController[] = []
const responses: ((response: Response) => void)[] = []

beforeEach(() => {
	httpFetch.mockImplementation(
		(_, options) =>
			new Promise<Response>((resolve, reject) => {
				const signal = options?.signal
				signal?.throwIfAborted()
				signal?.addEventListener('abort', () => reject(signal.reason), {
					once: true,
				})
				responses.push(resolve)
			}),
	)
})

afterEach(async () => {
	for (const controller of controllers.splice(0)) controller.abort()
	responses.length = 0
	await client.clearStore()
	httpFetch.mockReset()
})

afterAll(() => {
	client.stop()
	vi.unstubAllGlobals()
})

test.each(['overlapping', 'replacement'])(
	'%s status queries for the same stash keep separate cancellation signals',
	async (mode) => {
		const previous = new AbortController()
		const current = new AbortController()
		controllers.push(previous, current)
		const first = fetchGetNominationStatus(
			'polkadot',
			'stash',
			previous.signal,
		).catch((error: unknown) => error)
		if (mode === 'replacement') previous.abort()
		const second = fetchGetNominationStatus(
			'polkadot',
			'stash',
			current.signal,
		).catch((error: unknown) => error)

		try {
			await vi.waitFor(() => expect(httpFetch).toHaveBeenCalledTimes(2))
			previous.abort()
			responses[1](
				Response.json({ data: { getNominationStatus: { status: 'active' } } }),
			)
			expect(await first).toBeInstanceOf(Error)
			expect(await second).toBe('active')
			expect(current.signal.aborted).toBe(false)
		} finally {
			previous.abort()
			current.abort()
			await Promise.all([first, second])
		}
	},
)
