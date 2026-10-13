// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { afterAll, afterEach, expect, test, vi } from 'vitest'
import { client } from '../../plugin-staking-api/src/Client'
import { fetchRewards } from '../../plugin-staking-api/src/queries/rewards'
import type {
	NominatorReward,
	PoolReward,
	ValidatorIncentiveReward,
} from '../../plugin-staking-api/src/types'
import {
	isNominatorReward,
	isPoolReward,
	isPoolShareReward,
	isValidatorIncentiveReward,
	splitStakingRewards,
} from '../../plugin-staking-api/src/util'
import { formatRewardsForGraphs } from '../../ui-graphs/src/util/formatters'

const { httpFetch } = vi.hoisted(() => {
	const httpFetch = vi.fn<typeof fetch>()
	vi.stubGlobal('fetch', httpFetch)
	return { httpFetch }
})

const nominator: NominatorReward = {
	era: 100,
	validator: 'validator',
	reward: '10000000000',
	claimed: true,
	timestamp: Date.parse('2026-10-11T23:59:50Z') / 1000,
	type: 'nominator',
	page: null,
	chainId: null,
}
const incentive: ValidatorIncentiveReward = {
	...nominator,
	type: 'validator-incentive',
	reward: '3000000000',
	page: 0,
	chainId: 2,
}
const pool: PoolReward = {
	who: 'member',
	poolId: 1,
	reward: '100',
	timestamp: nominator.timestamp,
}

afterEach(async () => {
	await client.clearStore()
	httpFetch.mockReset()
})

afterAll(() => {
	client.stop()
	vi.unstubAllGlobals()
})

test('reward queries request and preserve incentive page and source information', async () => {
	httpFetch.mockResolvedValue(
		Response.json({ data: { allRewards: [nominator, incentive] } }),
	)
	const data = await fetchRewards('polkadot', 'validator', 100, 10, 20)
	expect(data.allRewards).toEqual([nominator, incentive])
	const request = JSON.parse(String(httpFetch.mock.calls[0][1]?.body))
	expect(request.variables).toEqual({
		network: 'polkadot',
		who: 'validator',
		fromEra: 100,
		limit: 10,
		offset: 20,
	})
	expect(request.query).toMatch(/\bpage\b/)
	expect(request.query).toMatch(/\bchainId\b/)
})

test('reward guards distinguish incentives, ordinary rewards and pools', () => {
	expect(isNominatorReward(nominator)).toBe(true)
	expect(isValidatorIncentiveReward(incentive)).toBe(true)
	expect(isNominatorReward(incentive)).toBe(false)
	expect(isValidatorIncentiveReward(nominator)).toBe(false)
	expect(isPoolReward(incentive)).toBe(false)
	expect(isPoolShareReward(incentive)).toBe(false)
	expect(isPoolReward(pool)).toBe(true)
	expect(isValidatorIncentiveReward(pool)).toBe(false)
})

test('graphs include incentive amounts and keep claimed and unclaimed rewards separate', () => {
	const pending = {
		...incentive,
		page: 1,
		reward: '7000000000',
		claimed: false,
	}
	const { payouts, unclaimedPayouts } = splitStakingRewards([
		nominator,
		pending,
		incentive,
	])
	expect(payouts).toEqual([nominator, incentive])
	expect(unclaimedPayouts).toEqual([pending])
	const data = formatRewardsForGraphs(
		new Date('2026-10-12T00:00:00Z'),
		3,
		10,
		payouts,
		[],
		unclaimedPayouts,
	)
	const day = Date.parse('2026-10-11T00:00:00Z') / 1000
	expect(
		data.allPayouts.p.find(({ timestamp }) => timestamp === day)?.reward,
	).toBe('1.3')
	expect(
		data.allUnclaimedPayouts.p.find(({ timestamp }) => timestamp === day)
			?.reward,
	).toBe('0.7')
})
