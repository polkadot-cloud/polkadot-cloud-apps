// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { NetworkId } from 'types'

export type DataModule =
	| 'staking'
	| 'validators'
	| 'pools'
	| 'identities'
	| 'prices'
	| 'rewards'
export type DataSource = 'staking-api' | 'node' | 'disabled'

// This is the network support matrix for data-gate. Product preferences (such as whether to
// display nomination-health warnings) do not change these data capabilities.
const networkCapabilities = {
	polkadot: { stakingApi: true, retainment: true, poolWarnings: true },
	kusama: { stakingApi: true, retainment: false, poolWarnings: false },
	paseo: { stakingApi: false, retainment: false, poolWarnings: false },
} satisfies Record<
	NetworkId,
	{ stakingApi: boolean; retainment: boolean; poolWarnings: boolean }
>

export const resolveDataPolicy = (
	network: NetworkId,
	apiEnabled: boolean,
	modules: readonly DataModule[],
) => {
	const supported = networkCapabilities[network]
	const stakingApi = apiEnabled && supported.stakingApi
	const retainment =
		stakingApi && supported.retainment && modules.includes('validators')
	const apiOrNode: DataSource = stakingApi ? 'staking-api' : 'node'
	const apiOnly: DataSource = stakingApi ? 'staking-api' : 'disabled'
	const forModule = (module: DataModule, source: DataSource): DataSource =>
		modules.includes(module) ? source : 'disabled'
	return {
		capabilities: {
			stakingApi,
			retainment,
			validatorDirectoryApi: retainment,
			candidates: retainment,
			poolWarnings:
				stakingApi && supported.poolWarnings && modules.includes('pools'),
			rewards: stakingApi && modules.includes('rewards'),
			prices: stakingApi && modules.includes('prices'),
		},
		// Resources with incomplete API coverage explicitly keep a node source. There is no implicit
		// fallback that can unexpectedly start a full-chain scan after an API error.
		sources: {
			nominationStatuses: forModule('staking', apiOrNode),
			nominationBacking: forModule('staking', 'node'),
			activeNominators: forModule('staking', apiOrNode),
			validatorOverviews: forModule('validators', 'node'),
			validatorEntries: forModule('validators', 'node'),
			validatorList: forModule(
				'validators',
				retainment ? 'staking-api' : 'disabled',
			),
			validatorStats: forModule('validators', apiOnly),
			validatorPerformance: forModule('validators', apiOrNode),
			previousEraRewards: forModule('validators', 'node'),
			averageRewardInputs: forModule('validators', apiOrNode),
			averageEraReward: forModule('validators', 'node'),
			validatorDetails: forModule(
				'validators',
				retainment ? 'staking-api' : 'disabled',
			),
			optimalValidators: forModule(
				'validators',
				retainment ? 'staking-api' : 'node',
			),
			validatorCandidates: forModule(
				'validators',
				retainment ? 'staking-api' : 'node',
			),
			validatorSearch: forModule('validators', apiOnly),
			validatorHistory: forModule('validators', apiOnly),
			operators: forModule('validators', apiOnly),
			identities: forModule('identities', apiOrNode),
			poolDirectory: forModule('pools', 'node'),
			poolNominations: forModule('pools', 'node'),
			poolMemberDetails: forModule('pools', 'node'),
			poolMembers: forModule('pools', apiOnly),
			poolCandidates: forModule('pools', apiOrNode),
			poolWarnings: forModule(
				'pools',
				stakingApi && supported.poolWarnings ? 'staking-api' : 'disabled',
			),
			tokenPrice: forModule('prices', apiOnly),
			rewards: forModule('rewards', apiOnly),
		},
	}
}

export type DataPolicy = ReturnType<typeof resolveDataPolicy>
export type ResourceName = keyof DataPolicy['sources']
