// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type {
	RewardResults,
	ValidatorIncentiveReward,
} from 'plugin-staking-api/types'
import type { SyncConfig, SyncId } from 'types'
import { beforeEach, expect, test, vi } from 'vitest'
import { createElement } from '../../app-staking/node_modules/react/index.js'
import { renderToStaticMarkup } from '../../app-staking/node_modules/react-dom/server.node.js'
import { useValidatorRewardProjection } from '../../app-staking/src/hooks/useValidatorRewardProjection'
import { getValidatorRewardProjection } from '../../app-staking/src/hooks/useValidatorRewardProjection/util'

const { state, rewardsQuery } = vi.hoisted(() => ({
	state: {
		activeAddress: 'validator' as string | null,
		accountsInitialised: true,
		syncIds: [] as SyncId[],
		accountSynced: true,
		network: 'polkadot',
		activeEra: 101,
		erasPerDay: 1,
		isValidator: true,
		validatorLoading: false,
		apiEnabled: true,
		queryLoading: false,
		queryError: undefined as Error | undefined,
		rewards: [] as RewardResults,
	},
	rewardsQuery: vi.fn(),
}))
vi.mock(
	'../../app-staking/node_modules/@polkadot-cloud/connect/index.js',
	() => ({
		useActiveAccount: () => ({ activeAddress: state.activeAddress }),
		useImportedAccounts: () => ({
			accountsInitialised: state.accountsInitialised,
		}),
	}),
)
vi.mock('../../hooks/src/useNetwork', () => ({
	useNetwork: () => ({ network: state.network }),
}))
vi.mock('../../hooks/src/useApi', () => ({
	useApi: () => ({ activeEra: { index: state.activeEra } }),
}))
vi.mock('../../hooks/src/useErasPerDay', () => ({
	useErasPerDay: () => ({ erasPerDay: state.erasPerDay }),
}))
vi.mock('../../hooks/src/usePlugins', () => ({
	usePlugins: () => ({ pluginEnabled: () => state.apiEnabled }),
}))
vi.mock('../../hooks/src/useValidators', () => ({
	useValidators: () => ({
		isValidator: (address: string | null) =>
			Boolean(address && state.isValidator),
		isLoading: () => state.validatorLoading,
	}),
}))
vi.mock('../../hooks/src/useSyncing', () => ({
	useSyncing: (config: SyncConfig) => ({
		syncing: state.syncIds.some((id) => config === '*' || config.includes(id)),
		accountSynced: () => state.accountSynced,
	}),
}))
vi.mock('../../consts/src/util', () => ({
	getStakingChainData: () => ({ units: 10 }),
}))
vi.mock('../../plugin-staking-api/src/index', async () => ({
	...(await import('../../plugin-staking-api/src/util')),
	useRewards: rewardsQuery,
}))

const incentive: ValidatorIncentiveReward = {
	era: 100,
	validator: 'validator',
	reward: '30000000000',
	claimed: true,
	timestamp: 0,
	type: 'validator-incentive',
	page: 0,
	chainId: 2,
}

beforeEach(() => {
	Object.assign(state, {
		activeAddress: 'validator',
		accountsInitialised: true,
		syncIds: [],
		accountSynced: true,
		network: 'polkadot',
		activeEra: 101,
		erasPerDay: 1,
		isValidator: true,
		validatorLoading: false,
		apiEnabled: true,
		queryLoading: false,
		queryError: undefined,
		rewards: [incentive],
	})
	rewardsQuery.mockReset().mockImplementation(() => ({
		data: { allRewards: state.rewards },
		loading: state.queryLoading,
		error: state.queryError,
	}))
})

const readProjection = () => {
	let projection: ReturnType<typeof useValidatorRewardProjection> | undefined
	const Probe = () => {
		projection = useValidatorRewardProjection()
		return null
	}
	renderToStaticMarkup(createElement(Probe))
	return projection!
}

test('projections sync from the first render through account restoration and reward loading', () => {
	Object.assign(state, {
		activeAddress: null,
		accountsInitialised: false,
		isValidator: false,
		rewards: [],
	})
	expect(readProjection().loading).toBe(true)
	Object.assign(state, {
		activeAddress: 'validator',
		accountsInitialised: true,
		validatorLoading: true,
		accountSynced: false,
	})
	expect(readProjection().loading).toBe(true)
	Object.assign(state, {
		isValidator: true,
		validatorLoading: false,
		queryLoading: true,
	})
	expect(readProjection().loading).toBe(true)
	state.queryLoading = false
	state.rewards = [incentive]
	expect(readProjection().loading).toBe(true)
	state.accountSynced = true
	expect(readProjection()).toMatchObject({ loading: false, annualReward: 1095 })
})

test.each<SyncId>(['initialization', 'staking-ledgers'])(
	'projections wait for %s even when rewards are already cached',
	(id) => {
		state.syncIds = [id]
		expect(readProjection().loading).toBe(true)
		state.syncIds = []
		expect(readProjection().loading).toBe(false)
	},
)

test('unrelated syncing and initialized disconnected accounts do not block projections', () => {
	state.syncIds = ['era-stakers', 'active-proxy']
	expect(readProjection().loading).toBe(false)
	state.activeAddress = null
	state.accountSynced = false
	expect(readProjection().loading).toBe(false)
})

test('the shared projection requests rewards for the active account, network and completed era', () => {
	expect(readProjection()).toMatchObject({
		annualReward: 1095,
		accountIsValidator: true,
		loading: false,
		unavailable: false,
	})
	expect(rewardsQuery).toHaveBeenLastCalledWith({
		network: 'polkadot',
		who: 'validator',
		fromEra: 100,
		skip: false,
	})
	Object.assign(state, {
		network: 'kusama',
		activeAddress: 'other',
		activeEra: 201,
	})
	expect(readProjection().annualReward).toBe(0)
	expect(rewardsQuery).toHaveBeenLastCalledWith({
		network: 'kusama',
		who: 'other',
		fromEra: 200,
		skip: false,
	})
})

test.each([
	{ isValidator: false },
	{ activeAddress: null },
	{ apiEnabled: false },
	{ activeEra: 0 },
	{ erasPerDay: 0 },
])(
	'ineligible or unready projections skip reward requests: %j',
	(overrides) => {
		Object.assign(state, overrides)
		expect(readProjection().annualReward).toBe(0)
		expect(rewardsQuery).toHaveBeenLastCalledWith(
			expect.objectContaining({ skip: true }),
		)
	},
)

test('loading and errors remain distinct from a completed zero-reward projection', () => {
	state.queryLoading = true
	expect(readProjection()).toMatchObject({ loading: true, unavailable: false })
	state.queryLoading = false
	state.queryError = new Error('offline')
	expect(readProjection()).toMatchObject({ loading: false, unavailable: true })
	state.queryError = undefined
	state.rewards = []
	expect(readProjection()).toMatchObject({
		loading: false,
		unavailable: false,
		annualReward: 0,
	})
	state.validatorLoading = true
	expect(readProjection().loading).toBe(true)
})

test('projections include every incentive page, whether claimed or unclaimed', () => {
	const rewards: RewardResults = [
		incentive,
		{ ...incentive, reward: '70000000000', page: 1, claimed: false },
		{ ...incentive, reward: '10000000000', page: 2, chainId: 0 },
	]
	expect(
		getValidatorRewardProjection(rewards, 'validator', 101, 1, 10),
	).toEqual({
		annualReward: 4015,
		annualIncentiveReward: 4015,
	})
})

test('ordinary validator rewards are included once and kept out of the incentive subtotal', () => {
	const rewards: RewardResults = [
		incentive,
		{ ...incentive, type: 'nominator', reward: '20000000000' },
	]
	expect(
		getValidatorRewardProjection(rewards, 'validator', 101, 1, 10),
	).toEqual({
		annualReward: 1825,
		annualIncentiveReward: 1095,
	})
})

test('only the active validator and latest completed era contribute to projections', () => {
	const rewards: RewardResults = [
		incentive,
		{ ...incentive, validator: 'other' },
		{ ...incentive, era: 99 },
		{ ...incentive, era: 101 },
		{ who: 'validator', poolId: 1, reward: '90000000000', timestamp: 0 },
	]
	expect(
		getValidatorRewardProjection(rewards, 'validator', 101, 1, 10),
	).toEqual({
		annualReward: 1095,
		annualIncentiveReward: 1095,
	})
})

test.each([
	[1, 10, 1095],
	[4, 12, 43.8],
	[0.5, 10, 547.5],
])(
	'era frequency %s and token decimals %s annualize correctly',
	(erasPerDay, units, annualReward) => {
		expect(
			getValidatorRewardProjection(
				[incentive],
				'validator',
				101,
				erasPerDay,
				units,
			),
		).toEqual({ annualReward, annualIncentiveReward: annualReward })
	},
)

test.each([
	[null, 101, 1],
	['validator', 0, 1],
	['validator', 101, 0],
	['validator', 101, Number.NaN],
	['validator', 101, Number.POSITIVE_INFINITY],
	['waiting-validator', 101, 1],
])(
	'missing validator activity or era data yields zero: %s, %s, %s',
	(validator, era, erasPerDay) => {
		expect(
			getValidatorRewardProjection([incentive], validator, era, erasPerDay, 10),
		).toEqual({ annualReward: 0, annualIncentiveReward: 0 })
	},
)

test('old incentives do not produce a projection for a validator that missed the latest era', () => {
	expect(
		getValidatorRewardProjection([incentive], 'validator', 102, 1, 10),
	).toEqual({
		annualReward: 0,
		annualIncentiveReward: 0,
	})
})
