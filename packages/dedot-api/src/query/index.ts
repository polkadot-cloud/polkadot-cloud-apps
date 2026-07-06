// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { accountBalance } from './accountBalance'
import { bondedPool } from './bondedPool'
import { bondedPoolEntries } from './bondedPoolEntries'
import { claimPermissionsMulti } from './claimPermissionsMulti'
import { erasRewardPoints } from './erasRewardPoints'
import { erasStakersOverview } from './erasStakersOverview'
import { erasStakersOverviewEntries } from './erasStakersOverviewEntries'
import { erasStakersPagedEntries } from './erasStakersPagedEntries'
import { erasValidatorReward } from './erasValidatorReward'
import { erasValidatorRewardMulti } from './erasValidatorRewardMulti'
import { identityOfMulti } from './identityOfMulti'
import { nominatorsMulti } from './nominatorsMulti'
import { poolMembersMulti } from './poolMembersMulti'
import { poolMetadataMulti } from './poolMetadataMulti'
import { superOfMulti } from './superOfMulti'
import { validatorEntries } from './validatorEntries'
import { validatorsMulti } from './validatorsMulti'

export const query = {
	accountBalance,
	bondedPool,
	bondedPoolEntries,
	claimPermissionsMulti,
	erasStakersOverviewEntries,
	erasStakersPagedEntries,
	erasStakersOverview,
	erasRewardPoints,
	erasValidatorReward,
	erasValidatorRewardMulti,
	identityOfMulti,
	nominatorsMulti,
	poolMembersMulti,
	poolMetadataMulti,
	superOfMulti,
	validatorEntries,
	validatorsMulti,
}
