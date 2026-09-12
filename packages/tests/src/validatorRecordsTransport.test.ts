// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { afterAll, afterEach, expect, test, vi } from 'vitest'
import { client } from '../../plugin-staking-api/src/Client'
import { fetchValidatorRecords } from '../../plugin-staking-api/src/queries/validatorRecords'

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

test('targeted requests chunk large batches and preserve missing records without a full-list query', async () => {
	const addresses = Array.from({ length: 205 }, (_, i) => `validator-${i}`)
	httpFetch.mockImplementation(async (_, options) => {
		const { query, variables } = JSON.parse(String(options?.body))
		expect(query).not.toContain('validatorList(')
		expect(variables.addresses.length).toBeLessThanOrEqual(100)
		return Response.json({
			data: {
				validatorRecords: variables.addresses.map((address: string) => ({
					address,
					registered: false,
					prefs: null,
					identity: null,
				})),
			},
		})
	})
	const result = await fetchValidatorRecords(
		'kusama',
		addresses,
		new AbortController().signal,
	)
	expect(result.map(({ address }) => address)).toEqual(addresses)
	expect(result.every(({ prefs }) => prefs === null)).toBe(true)
	expect(httpFetch).toHaveBeenCalledTimes(3)
})

test.each(['missing', 'mismatch'])(
	'incomplete or mismatched batches fail explicitly: %s',
	async (kind) => {
		httpFetch.mockResolvedValue(
			Response.json({
				data: {
					validatorRecords:
						kind === 'missing'
							? []
							: [
									{
										address: 'other',
										registered: true,
										prefs: { commission: 3, blocked: false },
										identity: null,
									},
								],
				},
			}),
		)
		await expect(
			fetchValidatorRecords(
				'polkadot',
				['validator'],
				new AbortController().signal,
			),
		).rejects.toThrow()
	},
)

test('an aborted batch never starts another chunk', async () => {
	const controller = new AbortController()
	httpFetch.mockImplementation(async (_, options) => {
		const { variables } = JSON.parse(String(options?.body))
		controller.abort()
		return Response.json({
			data: {
				validatorRecords: variables.addresses.map((address: string) => ({
					address,
					registered: false,
					prefs: null,
					identity: null,
				})),
			},
		})
	})
	await expect(
		fetchValidatorRecords(
			'kusama',
			Array.from({ length: 101 }, (_, i) => `${i}`),
			controller.signal,
		),
	).rejects.toThrow()
	expect(httpFetch).toHaveBeenCalledTimes(1)
})
