// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { ServiceInterface } from 'types'

export const defaultServiceInterface: ServiceInterface = {
	stablecoins: {
		query: {
			balances: async () => [],
			balance: async () => undefined,
			hydrationFeeCurrency: async () => undefined,
		},
		tx: {
			transfer: async () => undefined,
			setHydrationFeeCurrency: async () => undefined,
		},
		fee: {
			paymentOptions: () => undefined,
			estimate: async () => 0n,
		},
	},
	query: {
		accountBalance: {
			hub: async () => undefined,
		},
		claimPermissionsMulti: async () => [],
		erasStakersOverview: async () => undefined,
		erasRewardPoints: async () => undefined,
		erasValidatorReward: async () => BigInt(0),
		erasValidatorRewardMulti: async () => [],
		bondedPool: async () => undefined,
		bondedPoolEntries: async () => [],
		erasStakersOverviewEntries: async () => [],
		erasStakersPagedEntries: async () => [],
		identityOfMulti: async () => [],
		nominatorsMulti: async () => [],
		poolMembersMulti: async () => [],
		poolMetadataMulti: async () => [],
		superOfMulti: async () => [],
		validatorEntries: async () => [],
		validatorsMulti: async () => [],
	},
	runtimeApi: {
		balanceToPoints: async () => BigInt(0),
		pendingRewards: async () => BigInt(0),
		pointsToBalance: async () => BigInt(0),
	},
	tx: {
		batch: () => undefined,
		createPool: () => undefined,
		joinPool: () => undefined,
		newNominator: () => undefined,
		payoutStakersByPage: () => undefined,
		poolBondExtra: () => undefined,
		poolChill: () => undefined,
		poolClaimCommission: () => undefined,
		poolClaimPayout: () => undefined,
		poolNominate: () => undefined,
		poolSetClaimPermission: () => undefined,
		poolSetCommission: () => undefined,
		poolSetCommissionChangeRate: () => undefined,
		poolSetCommissionMax: () => undefined,
		poolSetMetadata: () => undefined,
		poolSetState: () => undefined,
		poolUnbond: () => undefined,
		poolUpdateRoles: () => undefined,
		poolWithdraw: () => undefined,
		proxy: () => undefined,
		setController: () => undefined,
		stakingBondExtra: () => undefined,
		stakingChill: () => undefined,
		stakingNominate: () => undefined,
		stakingRebond: () => undefined,
		stakingSetPayee: () => undefined,
		stakingUnbond: () => undefined,
		stakingWithdraw: () => undefined,
		transferKeepAlive: () => undefined,
	},
	signer: {
		extraSignedExtension: () => undefined,
		metadata: async () => undefined,
	},
	spec: {
		ss58: () => 0,
	},
	codec: {
		$Signature: () => undefined,
	},
}
