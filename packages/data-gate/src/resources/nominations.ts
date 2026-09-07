// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import {
	ERA_TOTAL_NOMINATORS_QUERY,
	GET_NOMINEES_STATUS_QUERY,
} from 'plugin-staking-api'
import type {
	EraTotalNominatorsData,
	GetActiveStakerWithNomineesData,
} from 'plugin-staking-api/types'
import type { NominationStatus, Staker } from 'types'
import { mapInBatches, readValidatorExposure } from '../sources/node'
import { queryStakingApi } from '../sources/stakingApi'
import type { ResourceDefinition } from '../types'

export const aggregateNominationStatus = (
	statuses: Record<string, NominationStatus>,
): NominationStatus => {
	const values = Object.values(statuses)
	return values.includes('active')
		? 'active'
		: values.includes('inactive')
			? 'inactive'
			: 'waiting'
}

export const validatorExposure = (
	address: string,
): ResourceDefinition<Staker | null> => ({
	name: 'nominationBacking',
	key: ['exposure', address],
	requires: ['era'],
	enabled: !!address,
	load: ({ node, era }) => readValidatorExposure(node, era, address),
})

export const nominationStatuses = (
	who: string | null | undefined,
	targets: readonly string[],
	enabled = true,
): ResourceDefinition<Record<string, NominationStatus>> => {
	const addresses = [...new Set(targets)].sort()
	return {
		name: 'nominationStatuses',
		refreshIntervalMs: { 'staking-api': 30_000 },
		staleTimeMs: 25_000,
		key: [who, addresses],
		requires: ['era'],
		enabled: enabled && !!who,
		load: async (context) => {
			if (!who || !addresses.length) return {}
			if (context.policy.sources.nominationStatuses === 'staking-api') {
				const result = await queryStakingApi<GetActiveStakerWithNomineesData>(
					GET_NOMINEES_STATUS_QUERY,
					{ network: context.network, era: context.era, who, addresses },
					context.signal,
				)
				const statuses: Record<string, NominationStatus> = {}
				for (const { address, status } of result.getNomineesStatus.statuses) {
					if (
						status !== 'active' &&
						status !== 'inactive' &&
						status !== 'waiting'
					)
						throw new Error(`Unknown nomination status: ${status}`)
					statuses[address] = status
				}
				if (addresses.some((address) => statuses[address] === undefined))
					throw new Error('Staking API returned incomplete nomination statuses')
				return statuses
			}
			const results = await mapInBatches(addresses, (address) =>
				context.request(validatorExposure(address)),
			)
			return Object.fromEntries(
				addresses.map((address, index) => {
					const exposure = results[index]
					return [
						address,
						!exposure
							? 'waiting'
							: exposure.others.some((other) => other.who === who)
								? 'active'
								: 'inactive',
					]
				}),
			)
		},
	}
}

export const nominationBacking = (
	who: string | null | undefined,
	address: string,
	enabled = true,
): ResourceDefinition<bigint> => ({
	name: 'nominationBacking',
	key: ['backing', who, address],
	requires: ['era'],
	enabled: enabled && !!who && !!address,
	load: async ({ request }) => {
		const exposure = await request(validatorExposure(address))
		return BigInt(
			exposure?.others.find((other) => other.who === who)?.value ?? 0,
		)
	},
})

export const activeNominatorCount = (): ResourceDefinition<number> => ({
	name: 'activeNominators',
	refreshIntervalMs: { 'staking-api': 30_000 },
	staleTimeMs: 25_000,
	key: [],
	requires: ['era'],
	load: async (context) => {
		if (context.policy.sources.activeNominators === 'staking-api') {
			const result = await queryStakingApi<EraTotalNominatorsData>(
				ERA_TOTAL_NOMINATORS_QUERY,
				{ network: context.network, era: context.era },
				context.signal,
			)
			return result.eraTotalNominators.totalNominators
		}
		const overviews = await context.node.query.erasStakersOverviewEntries(
			context.era,
		)
		const exposures = await mapInBatches(overviews, ([[, address]]) =>
			context.request(validatorExposure(address)),
		)
		return new Set(
			exposures.flatMap(
				(exposure) => exposure?.others.map(({ who }) => who) ?? [],
			),
		).size
	},
})
