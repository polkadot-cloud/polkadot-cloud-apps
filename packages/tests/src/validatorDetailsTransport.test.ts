// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { afterAll, afterEach, expect, test, vi } from 'vitest'
import {
	GraphQLIncludeDirective,
	getDirectiveValues,
	parse,
} from '../../plugin-staking-api/node_modules/graphql/index.js'
import { client } from '../../plugin-staking-api/src/Client'
import { fetchValidatorDetailsBatch } from '../../plugin-staking-api/src/queries/validatorDetailsBatch'

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

test.each([
	['kusama', false],
	['polkadot', true],
] as const)(
	'detail requests for %s execute only supported fields',
	async (network, includeRetainment) => {
		httpFetch.mockImplementation(async (_, options) => {
			const { query, variables } = JSON.parse(String(options?.body))
			const document = parse(query)
			const operation = document.definitions.find(
				(node) => node.kind === 'OperationDefinition',
			)
			if (operation?.kind !== 'OperationDefinition')
				throw new Error('Missing query')
			const fields = operation.selectionSet.selections
				.filter(
					(node) =>
						node.kind === 'Field' &&
						node.name.value !== '__typename' &&
						getDirectiveValues(GraphQLIncludeDirective, node, {
							sources: {},
							coerced: variables,
						})?.if !== false,
				)
				.map((node) => (node.kind === 'Field' ? node.name.value : ''))
			expect(fields).toEqual(
				includeRetainment
					? [
							'validatorRetainmentBatch',
							'validatorAvgRewardRateBatch',
							'validatorEraPointsBatch',
						]
					: ['validatorAvgRewardRateBatch', 'validatorEraPointsBatch'],
			)
			expect(variables.network).toBe(network)
			return Response.json({
				data: {
					validatorAvgRewardRateBatch: [{ validator: 'alice', rate: 12 }],
					validatorEraPointsBatch: [{ validator: 'alice', points: [] }],
					...(includeRetainment ? { validatorRetainmentBatch: [] } : {}),
				},
			})
		})
		const result = await fetchValidatorDetailsBatch(
			network,
			['alice'],
			100,
			4,
			30,
			includeRetainment
				? { throwOnError: true }
				: { includeRetainment: false, throwOnError: true },
		)
		expect(result.validatorAvgRewardRateBatch).toEqual([
			{ validator: 'alice', rate: 12 },
		])
		expect(result.validatorRetainmentBatch).toEqual([])
		expect(httpFetch).toHaveBeenCalledTimes(1)
	},
)
