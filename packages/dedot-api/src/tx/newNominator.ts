// Copyright 2026 @polkadot-cloud/polkadot-cloud-apps authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import type { DedotClient } from 'dedot'
import type { PalletStakingRewardDestination } from 'dedot/chaintypes'
import type { StakingChain } from '../types'
import { asTxs } from '../util'

export const newNominator = <T extends StakingChain>(
	api: DedotClient<T>,
	bond: bigint,
	payee: PalletStakingRewardDestination,
	nominees: string[],
) =>
	asTxs([api.tx.staking.bond(bond, payee), api.tx.staking.nominate(nominees)])
