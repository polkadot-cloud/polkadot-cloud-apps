// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { afterAll, afterEach, expect, test, vi } from 'vitest'
import { client } from '../../plugin-staking-api/src/Client'
import { fetchPoolMembers } from '../../plugin-staking-api/src/queries/poolMembers'

const { httpFetch } = vi.hoisted(() => {
	const httpFetch = vi.fn<typeof fetch>()
	vi.stubGlobal('fetch', httpFetch)
	return { httpFetch }
})

afterEach(async () => {
	await client.clearStore()
	httpFetch.mockReset()
})
afterAll(() => {
	client.stop()
	vi.unstubAllGlobals()
})

test('one paginated request includes claim permissions and preserves exact wire balances', async () => {
	const member = {
		poolId: 7,
		address: 'alice',
		points: '900719925474099312345',
		claimPermission: 'PermissionlessCompound',
		unbondingEras: [{ era: 50, amount: '900719925474099312346' }],
	}
	httpFetch.mockResolvedValue(
		Response.json({
			data: {
				poolMembers: { poolId: 7, totalMembers: 101, members: [member] },
			},
		}),
	)
	const result = await fetchPoolMembers(
		'polkadot',
		7,
		50,
		50,
		new AbortController().signal,
	)
	expect(result.poolMembers.members).toEqual([member])
	expect(httpFetch).toHaveBeenCalledOnce()
	const { query, variables } = JSON.parse(
		String(httpFetch.mock.calls[0][1]?.body),
	)
	expect(variables).toEqual({
		network: 'polkadot',
		poolId: 7,
		limit: 50,
		offset: 50,
	})
	expect(query).toContain('claimPermission')
	expect(query).not.toContain('identity')
})

test('API failures propagate instead of returning a successful empty page', async () => {
	httpFetch.mockResolvedValue(
		Response.json({ errors: [{ message: 'Unavailable' }] }),
	)
	await expect(fetchPoolMembers('polkadot', 7, 50, 0)).rejects.toThrow()
})

test('an empty API page remains a successful empty result', async () => {
	httpFetch.mockResolvedValue(
		Response.json({
			data: { poolMembers: { poolId: 7, totalMembers: 0, members: [] } },
		}),
	)
	await expect(fetchPoolMembers('polkadot', 7, 50, 0)).resolves.toEqual({
		poolMembers: { poolId: 7, totalMembers: 0, members: [] },
	})
})
